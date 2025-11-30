import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Calendar, User } from 'lucide-react';
import Card from '../../../components/ui/Card';
import { extractImageFromUrl } from '../../../utils/imageExtractor';
import { useExtractImageFromUrlQuery } from '../../../queries/announcements';
import coverImage from '../../../assets/cover2.png';

const NewsCard = ({ announcement }) => {
  const navigate = useNavigate();
  const link = announcement?.link || announcement?.Link || '';

  // Try to extract image synchronously first (for direct images)
  const initialImageUrl = extractImageFromUrl(link);

  // If not a direct image, fetch from backend API
  const { data: imageData, isLoading: isLoadingImage } = useExtractImageFromUrlQuery(link && !initialImageUrl ? link : null, {
    enabled: !!link && !initialImageUrl,
  });

  const extractedImageUrl = imageData?.data || imageData?.Data || '';
  const [imageUrl, setImageUrl] = useState(initialImageUrl || coverImage);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (initialImageUrl) {
      // Direct image URL
      setImageUrl(initialImageUrl);
    } else if (extractedImageUrl) {
      // Image extracted from backend
      setImageUrl(extractedImageUrl);
    } else if (!isLoadingImage && link) {
      // No image found, use fallback
      setImageUrl(coverImage);
    }
    setImageError(false);
  }, [initialImageUrl, extractedImageUrl, isLoadingImage, link]);

  const handleImageError = () => {
    setImageError(true);
    setImageUrl(coverImage);
  };

  const handleCardClick = () => {
    navigate(`/news/${announcement.id || announcement.Id}`);
  };

  const truncateDescription = (text, maxLength = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const formatDate = dateString => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const announcementId = announcement?.id || announcement?.Id;
  const title = announcement?.title || announcement?.Title || '';
  const description = announcement?.description || announcement?.Description || '';
  const createdAt = announcement?.createdAt || announcement?.CreatedAt || '';

  return (
    <Card hover onClick={handleCardClick} className="h-full flex flex-col overflow-hidden">
      {/* Image Section */}
      <div className="relative w-full h-48 overflow-hidden bg-surface-muted">
        <img src={imageUrl} alt={title} className="w-full h-full object-cover" onError={handleImageError} />
        {link && (
          <div className="absolute top-2 right-2 bg-primary/80 backdrop-blur-sm rounded-full p-1.5">
            <ExternalLink className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col p-4">
        {/* Title */}
        <h3 className="text-lg font-semibold text-text mb-2 line-clamp-2 min-h-[3.5rem]">{title || 'Untitled Announcement'}</h3>

        {/* Description */}
        <p className="text-sm text-text-muted mb-4 flex-1 line-clamp-3">{truncateDescription(description)}</p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          {createdAt && (
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(createdAt)}</span>
            </div>
          )}
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1.5 text-xs text-primary hover:text-primary-hover transition-colors"
            >
              <span>View Link</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </Card>
  );
};

export default NewsCard;
