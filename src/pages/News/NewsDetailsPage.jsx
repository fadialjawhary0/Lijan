import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ExternalLink, Calendar, User, Building2, Users, Globe, Lock, Edit } from 'lucide-react';
import { useBreadcrumbs } from '../../context';
import { useGetAnnouncementByIdQuery, useExtractImageFromUrlQuery, useGetCommitteeByIdQuery, useGetCouncilByIdQuery } from '../../queries';
import { isApiResponseSuccessful } from '../../utils/apiResponseHandler';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { extractImageFromUrl } from '../../utils/imageExtractor';
import coverImage from '../../assets/cover2.png';
import EmptyState from '../../components/ui/EmptyState';
import { Newspaper } from 'lucide-react';

const NewsDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('news');
  const { setBreadcrumbs } = useBreadcrumbs();
  const isRTL = i18n.dir() === 'rtl';

  const [imageError, setImageError] = useState(false);

  const { data: announcementData, isLoading, error } = useGetAnnouncementByIdQuery(parseInt(id));

  const announcement = announcementData?.data;
  const announcementLink = announcement?.link || announcement?.Link || '';
  
  // Get committee and council IDs
  const committeeId = announcement?.committeeId || announcement?.CommitteeId;
  const councilId = announcement?.councilId || announcement?.CouncilId;
  
  // Fetch committee and council details
  const { data: committeeResponse } = useGetCommitteeByIdQuery(committeeId ? parseInt(committeeId) : null, {
    enabled: !!committeeId,
  });
  
  const { data: councilResponse } = useGetCouncilByIdQuery(councilId ? parseInt(councilId) : null, {
    enabled: !!councilId,
  });
  
  // Extract committee and council names
  const committeeData = isApiResponseSuccessful(committeeResponse) 
    ? (committeeResponse?.data?.Data || committeeResponse?.data) 
    : null;
  const committeeName = committeeData 
    ? (i18n.language === 'ar' ? (committeeData.arabicName || committeeData.ArabicName) : (committeeData.englishName || committeeData.EnglishName))
    : null;
  
  const councilData = isApiResponseSuccessful(councilResponse) 
    ? (councilResponse?.data?.Data || councilResponse?.data) 
    : null;
  const councilName = councilData 
    ? (i18n.language === 'ar' ? (councilData.arabicName || councilData.ArabicName) : (councilData.englishName || councilData.EnglishName))
    : null;

  // Try to extract image synchronously first (for direct images)
  const initialImageUrl = extractImageFromUrl(announcementLink);

  // If not a direct image, fetch from backend API
  const { data: imageData } = useExtractImageFromUrlQuery(announcementLink && !initialImageUrl ? announcementLink : null, {
    enabled: !!announcementLink && !initialImageUrl,
  });

  const extractedImageUrl = imageData?.data || imageData?.Data || '';
  const imageUrl = imageError ? coverImage : initialImageUrl || extractedImageUrl || coverImage;

  useEffect(() => {
    if (announcement) {
      setBreadcrumbs([
        { label: t('title') || 'News', href: '/news' },
        { label: announcement.title || announcement.Title || 'Details', href: `/news/${id}` },
      ]);
    }
  }, [setBreadcrumbs, announcement, id, i18n.language, t]);

  const handleImageError = () => {
    setImageError(true);
    setImageUrl(coverImage);
  };

  const formatDate = dateString => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-surface-muted rounded w-1/4 mb-4" />
          <div className="h-96 bg-surface-muted rounded mb-6" />
          <div className="space-y-3">
            <div className="h-6 bg-surface-muted rounded w-3/4" />
            <div className="h-4 bg-surface-muted rounded w-full" />
            <div className="h-4 bg-surface-muted rounded w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <EmptyState
        icon={Newspaper}
        title={t('details.notFound') || 'Announcement not found'}
        description={t('details.notFoundDescription') || 'The announcement you are looking for does not exist or has been removed.'}
        action={
          <Button onClick={() => navigate('/news')} variant="primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('details.backToNews') || 'Back to News'}
          </Button>
        }
      />
    );
  }

  const title = announcement?.title || announcement?.Title || '';
  const description = announcement?.description || announcement?.Description || '';
  const link = announcement?.link || announcement?.Link || '';
  const createdAt = announcement?.createdAt || announcement?.CreatedAt || '';
  const isPublic = announcement?.isPublic || announcement?.IsPublic;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate('/news')} className="flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" />
        {t('details.back') || 'Back to News'}
      </Button>

      {/* Image Section */}
      <div className="relative w-full h-96 overflow-hidden rounded-lg">
        <img src={imageUrl} alt={title} className="w-full h-full object-cover" onError={handleImageError} />
        {link && (
          <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm rounded-lg p-2">
            <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white hover:text-white/80 transition-colors">
              <ExternalLink className="w-5 h-5" />
              <span className="font-medium">{t('details.visitLink') || 'Visit Link'}</span>
            </a>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            {/* Title */}
            <h1 className="text-3xl font-bold text-text mb-4">{title}</h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-border">
              {createdAt && (
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(createdAt)}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-text-muted">
                {isPublic ? (
                  <>
                    <Globe className="w-4 h-4" />
                    <span>{t('details.public') || 'Public'}</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>{t('details.private') || 'Private'}</span>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="prose prose-sm max-w-none">
              <div className="text-text whitespace-pre-wrap leading-relaxed">{description || t('details.noDescription') || 'No description available.'}</div>
            </div>

            {/* Link Section */}
            {link && (
              <div className="mt-6 pt-6 border-t border-border">
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-medium transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                  <span>{t('details.viewFullArticle') || 'View Full Article'}</span>
                </a>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Related Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-text mb-4">{t('details.information') || 'Information'}</h2>
            <div className="space-y-4">
              {committeeId && (
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-text-muted mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-text-muted">{t('details.committee') || 'Committee'}</p>
                    <p className="text-sm text-text">
                      {committeeName || `ID: ${committeeId}`}
                    </p>
                  </div>
                </div>
              )}
              {councilId && (
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-text-muted mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-text-muted">{t('details.council') || 'Council'}</p>
                    <p className="text-sm text-text">
                      {councilName || `ID: ${councilId}`}
                    </p>
                  </div>
                </div>
              )}
              {announcement?.createdByMemberId && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-text-muted mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-text-muted">{t('details.createdBy') || 'Created By'}</p>
                    <p className="text-sm text-text">Member ID: {announcement.createdByMemberId}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Actions */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-text mb-4">{t('details.actions') || 'Actions'}</h2>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate(`/news/update/${id}`)}>
                <Edit className="w-4 h-4 mr-2" />
                {t('details.edit') || 'Edit Announcement'}
              </Button>
              {link && (
                <Button variant="outline" className="w-full justify-start" onClick={() => window.open(link, '_blank')}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {t('details.openLink') || 'Open Link'}
                </Button>
              )}
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/news')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('details.backToNews') || 'Back to News'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewsDetailsPage;
