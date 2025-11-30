import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Newspaper } from 'lucide-react';
import {
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useGetAnnouncementByIdQuery,
  useGetAllCommitteesQuery,
  useGetAllCouncilsQuery,
  useGetCommitteeByIdQuery,
  useGetCouncilByIdQuery,
} from '../queries/index';
import { useToast } from '../context/ToasterContext';
import { useBreadcrumbs } from '../context';
import { useCommittee } from '../context/CommitteeContext';
import { isApiResponseSuccessful, getApiErrorMessage } from '../utils/apiResponseHandler';
import FormHeader from '../components/ui/FormHeader';
import FormActions from '../components/ui/FormActions';
import Card from '../components/ui/Card';
import { getDefaultSuccessRoute } from '../utils/routeUtils';

const AnnouncementForm = ({ initialData = null, onSuccess, onClose }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t, i18n } = useTranslation('announcementForm');
  const { t: tHome } = useTranslation('home');
  const toast = useToast();
  const { setBreadcrumbs } = useBreadcrumbs();
  const { selectedCommitteeId } = useCommittee();

  // Fetch announcement data if in update mode
  const {
    data: announcementData,
    isLoading: isLoadingAnnouncement,
    error: announcementError,
  } = useGetAnnouncementByIdQuery(parseInt(id), { enabled: !!id && !initialData });

  // Use initialData prop if provided, otherwise use fetched data, otherwise null (create mode)
  const announcementDataToUse = initialData || announcementData?.data || announcementData?.Data || null;
  const isEditMode = !!id || !!announcementDataToUse;

  // Determine which committee ID to use
  const committeeIdToFetch = isEditMode ? announcementDataToUse?.CommitteeId || announcementDataToUse?.committeeId : selectedCommitteeId;

  // Fetch committee details by ID
  const { data: committeeData } = useGetCommitteeByIdQuery(committeeIdToFetch ? parseInt(committeeIdToFetch) : null, {
    enabled: !!committeeIdToFetch,
  });

  const selectedCommittee = committeeData?.data || committeeData?.Data || null;

  // Determine which council ID to use - check announcement first, then committee's CouncilId
  const councilIdToFetch = isEditMode
    ? announcementDataToUse?.CouncilId || announcementDataToUse?.councilId
    : selectedCommittee?.CouncilId || selectedCommittee?.councilId || null;

  // Fetch council details by ID
  const { data: councilData } = useGetCouncilByIdQuery(councilIdToFetch ? parseInt(councilIdToFetch) : null, {
    enabled: !!councilIdToFetch,
  });

  const selectedCouncil = councilData?.data || councilData?.Data || null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
    setValue,
  } = useForm({
    defaultValues: initialData || {
      Title: '',
      Description: '',
      Link: '',
      CommitteeId: selectedCommitteeId ? String(selectedCommitteeId) : '',
      CouncilId: '',
      IsPublic: true,
    },
  });

  const createMutation = useCreateAnnouncementMutation();
  const updateMutation = useUpdateAnnouncementMutation();

  // Set breadcrumbs
  useEffect(() => {
    setBreadcrumbs([
      { label: tHome('breadcrumbs.home'), href: '/' },
      { label: isEditMode ? t('editTitle') : t('createTitle'), href: isEditMode ? `/news/update/${id}` : '/news/create' },
    ]);
  }, [setBreadcrumbs, isEditMode, id, t, tHome]);

  // Set committee from selectedCommitteeId when creating (not editing)
  useEffect(() => {
    if (!isEditMode && selectedCommitteeId) {
      setValue('CommitteeId', String(selectedCommitteeId));
    }
  }, [selectedCommitteeId, isEditMode, setValue]);

  // Set council ID when council data is fetched
  useEffect(() => {
    if (selectedCouncil && (selectedCouncil.Id || selectedCouncil.id)) {
      setValue('CouncilId', String(selectedCouncil.Id || selectedCouncil.id));
    }
  }, [selectedCouncil, setValue]);

  // Reset form when announcement data is loaded
  useEffect(() => {
    if (announcementDataToUse) {
      const data = {
        Title: announcementDataToUse.Title || announcementDataToUse.title || '',
        Description: announcementDataToUse.Description || announcementDataToUse.description || '',
        Link: announcementDataToUse.Link || announcementDataToUse.link || '',
        CommitteeId: announcementDataToUse.CommitteeId || announcementDataToUse.committeeId || (selectedCommitteeId ? String(selectedCommitteeId) : ''),
        CouncilId: announcementDataToUse.CouncilId || announcementDataToUse.councilId || '',
        IsPublic:
          announcementDataToUse.IsPublic !== undefined
            ? announcementDataToUse.IsPublic
            : announcementDataToUse.isPublic !== undefined
            ? announcementDataToUse.isPublic
            : true,
      };

      // Convert IDs to strings for form inputs
      if (data.CommitteeId) data.CommitteeId = String(data.CommitteeId);
      if (data.CouncilId) data.CouncilId = String(data.CouncilId);

      reset(data);
    }
  }, [announcementDataToUse, reset, selectedCommitteeId]);

  const onSubmit = async data => {
    // Always use selectedCommitteeId if available, otherwise use form value
    const committeeId = selectedCommitteeId ? parseInt(selectedCommitteeId) : data.CommitteeId ? parseInt(data.CommitteeId) : null;

    const payload = {
      Title: data.Title || null,
      Description: data.Description || null,
      Link: data.Link || null,
      CommitteeId: committeeId,
      CouncilId: data.CouncilId ? parseInt(data.CouncilId) : null,
      IsPublic: data.IsPublic !== undefined ? data.IsPublic : true,
    };

    if (isEditMode) {
      payload.Id = announcementDataToUse?.Id || announcementDataToUse?.id || parseInt(id) || null;
    }

    const mutation = isEditMode ? updateMutation : createMutation;

    mutation.mutate(payload, {
      onSuccess: response => {
        if (!isApiResponseSuccessful(response)) {
          const errorMessage = getApiErrorMessage(response, t('error'));
          toast.error(errorMessage);
          return;
        }

        toast.success(t(isEditMode ? 'updateSuccess' : 'createSuccess'));
        onSuccess?.(response);
        if (!onSuccess && !onClose) {
          navigate('/news');
        } else {
          onClose?.();
        }
      },
      onError: error => {
        console.error('Mutation error:', error);
        toast.error(error.message || t('error'));
      },
    });
  };

  if (isLoadingAnnouncement && !initialData) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="w-full">
          <div className="p-6 text-center">
            <p className="text-text-muted">{t('loading')}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="w-full">
        <FormHeader
          icon={<Newspaper size={42} />}
          title={t(isEditMode ? 'editTitle' : 'createTitle')}
          subtitle={t(isEditMode ? 'editSubtitle' : 'createSubtitle')}
        />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-6 hover:border-border border-2 border-transparent p-3 m-3 rounded-xl transition-all duration-300">
            <h3 className="text-lg font-semibold text-text border-b border-brand/30 pb-2">{t('sections.basicInfo')}</h3>
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label htmlFor="Title" className="block text-sm font-medium text-text mb-2">
                  {t('title')} <span className="text-destructive">*</span>
                </label>
                <input
                  id="Title"
                  type="text"
                  {...register('Title', {
                    required: t('titleRequired'),
                    maxLength: { value: 200, message: t('maxLength200') },
                  })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none bg-surface text-text ${
                    errors.Title ? 'border-destructive' : 'border-border'
                  }`}
                  placeholder={t('titlePlaceholder')}
                  disabled={isSubmitting}
                />
                {errors.Title && <p className="mt-1 text-sm text-destructive">{errors.Title.message}</p>}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="Description" className="block text-sm font-medium text-text mb-2">
                  {t('description')}
                </label>
                <textarea
                  id="Description"
                  {...register('Description', {
                    maxLength: { value: 2000, message: t('maxLength2000') },
                  })}
                  rows={6}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none bg-surface text-text ${
                    errors.Description ? 'border-destructive' : 'border-border'
                  }`}
                  placeholder={t('descriptionPlaceholder')}
                  disabled={isSubmitting}
                />
                {errors.Description && <p className="mt-1 text-sm text-destructive">{errors.Description.message}</p>}
              </div>

              {/* Link */}
              <div>
                <label htmlFor="Link" className="block text-sm font-medium text-text mb-2">
                  {t('link')}
                </label>
                <input
                  id="Link"
                  type="url"
                  {...register('Link', {
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: t('invalidUrl'),
                    },
                  })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none bg-surface text-text ${
                    errors.Link ? 'border-destructive' : 'border-border'
                  }`}
                  placeholder={t('linkPlaceholder')}
                  disabled={isSubmitting}
                />
                {errors.Link && <p className="mt-1 text-sm text-destructive">{errors.Link.message}</p>}
              </div>
            </div>
          </div>

          {/* Association Section */}
          <div className="space-y-6 hover:border-border border-2 border-transparent p-3 m-3 rounded-xl transition-all duration-300">
            <h3 className="text-lg font-semibold text-text border-b border-brand/30 pb-2">{t('sections.association')}</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Committee */}
                <div>
                  <label htmlFor="CommitteeId" className="block text-sm font-medium text-text mb-2">
                    {t('committee')}
                  </label>
                  <input
                    id="CommitteeId"
                    type="text"
                    value={
                      selectedCommittee
                        ? i18n.language === 'ar'
                          ? selectedCommittee.ArabicName || selectedCommittee.arabicName || ''
                          : selectedCommittee.EnglishName || selectedCommittee.englishName || ''
                        : ''
                    }
                    className="w-full px-4 py-3 border rounded-lg bg-surface-muted text-text-muted border-border cursor-not-allowed"
                    disabled={true}
                    readOnly
                  />
                  <input type="hidden" {...register('CommitteeId')} />
                </div>

                {/* Council */}
                <div>
                  <label htmlFor="CouncilId" className="block text-sm font-medium text-text mb-2">
                    {t('council')}
                  </label>
                  <input
                    id="CouncilId"
                    type="text"
                    value={
                      selectedCouncil
                        ? i18n.language === 'ar'
                          ? selectedCouncil.ArabicName || selectedCouncil.arabicName || ''
                          : selectedCouncil.EnglishName || selectedCouncil.englishName || ''
                        : t('noCouncil') || 'No Council'
                    }
                    className="w-full px-4 py-3 border rounded-lg bg-surface-muted text-text-muted border-border cursor-not-allowed"
                    disabled={true}
                    readOnly
                  />
                  <input type="hidden" {...register('CouncilId')} />
                </div>
              </div>
            </div>
          </div>

          {/* Visibility Section */}
          <div className="space-y-6 hover:border-border border-2 border-transparent p-3 m-3 rounded-xl transition-all duration-300">
            <h3 className="text-lg font-semibold text-text border-b border-brand/30 pb-2">{t('sections.visibility')}</h3>
            <div className="space-y-4">
              {/* Is Public */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('IsPublic')}
                    className="w-5 h-5 rounded border-border text-brand focus:ring-2 focus:ring-brand/30"
                    disabled={isSubmitting}
                  />
                  <span className="text-sm font-medium text-text">{t('isPublic')}</span>
                </label>
                <p className="mt-1 text-xs text-text-muted ml-8">{t('isPublicHelpText')}</p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <FormActions isSubmitting={isSubmitting} isEditMode={isEditMode} onCancel={onClose} cancelRoute="/news" translationNamespace="announcementForm" />
        </form>
      </Card>
    </div>
  );
};

export default AnnouncementForm;
