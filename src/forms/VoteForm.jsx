import React, { useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Vote } from 'lucide-react';
import { useCreateMeetingVoteMutation, useUpdateMeetingVoteMutation, useGetMeetingVoteByIdQuery } from '../queries/votes';
import { useGetAllMeetingsQuery } from '../queries/meetings';
import { useGetMeetingAgendaQuery } from '../queries/meetings';
import { useToast } from '../context/ToasterContext';
import { useBreadcrumbs } from '../context';
import { useCommittee } from '../context/CommitteeContext';
import { isApiResponseSuccessful, getApiErrorMessage } from '../utils/apiResponseHandler';
import FormHeader from '../components/ui/FormHeader';
import FormActions from '../components/ui/FormActions';
import Card from '../components/ui/Card';
import { Plus, X } from 'lucide-react';
import Button from '../components/ui/Button';

const VoteForm = ({ initialData = null, onSuccess, onClose }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const meetingIdParam = searchParams.get('meetingId');
  const { t, i18n } = useTranslation('voteForm');
  const { t: tHome } = useTranslation('home');
  const { t: tVoting } = useTranslation('voting');
  const toast = useToast();
  const { setBreadcrumbs } = useBreadcrumbs();
  const { selectedCommitteeId } = useCommittee();
  const isRTL = i18n.dir() === 'rtl';

  // Fetch vote data if in update mode
  const {
    data: voteData,
    isLoading: isLoadingVote,
    error: voteError,
  } = useGetMeetingVoteByIdQuery(parseInt(id), { enabled: !!id && !initialData });

  // Use initialData prop if provided, otherwise use fetched data, otherwise null (create mode)
  const voteDataToUse = initialData || voteData?.data || voteData?.Data || null;
  const isEditMode = !!id || !!voteDataToUse;

  // Get meetingId from vote data or URL param
  const meetingId = voteDataToUse?.meetingId || voteDataToUse?.MeetingId || (meetingIdParam ? parseInt(meetingIdParam) : null);

  // Fetch lookup data
  const { data: meetingsData } = useGetAllMeetingsQuery(
    {
      CommitteeId: selectedCommitteeId ? parseInt(selectedCommitteeId) : undefined,
      PageSize: 1000,
    },
    { enabled: !!selectedCommitteeId }
  );
  const { data: agendaData } = useGetMeetingAgendaQuery(meetingId, { enabled: !!meetingId });

  const meetings = meetingsData?.data || meetingsData?.Data || [];
  const agendaItems = agendaData?.data || agendaData?.Data || [];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
    setValue,
    control,
  } = useForm({
    defaultValues: initialData || {
      Question: '',
      MeetingId: meetingId || '',
      AgendaItemId: '',
      StartDate: '',
      EndDate: '',
      Choices: [{ text: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'Choices',
  });

  const createMutation = useCreateMeetingVoteMutation();
  const updateMutation = useUpdateMeetingVoteMutation();

  const watchedMeetingId = watch('MeetingId');

  // Set breadcrumbs
  useEffect(() => {
    setBreadcrumbs([
      { label: tHome('breadcrumbs.home'), href: '/' },
      { label: tVoting('title'), href: '/voting' },
      { label: isEditMode ? t('editTitle') : t('createTitle'), href: isEditMode ? `/voting/update/${id}` : '/voting/create' },
    ]);
  }, [setBreadcrumbs, isEditMode, id, t, tHome, tVoting]);

  // Reset form when vote data is loaded or selectedCommitteeId changes for create mode
  useEffect(() => {
    if (voteDataToUse) {
      const choices = voteDataToUse.choices || voteDataToUse.Choices || [];
      reset({
        Question: voteDataToUse.question || voteDataToUse.Question || '',
        MeetingId: String(voteDataToUse.meetingId || voteDataToUse.MeetingId || ''),
        AgendaItemId: String(voteDataToUse.agendaItemId || voteDataToUse.AgendaItemId || ''),
        StartDate: voteDataToUse.startDate || voteDataToUse.StartDate ? new Date(voteDataToUse.startDate || voteDataToUse.StartDate).toISOString().split('T')[0] : '',
        EndDate: voteDataToUse.endDate || voteDataToUse.EndDate ? new Date(voteDataToUse.endDate || voteDataToUse.EndDate).toISOString().split('T')[0] : '',
        Choices: choices.length > 0 ? choices.map(c => ({ text: c.text || c.Text || '' })) : [{ text: '' }],
      });
    } else if (!isEditMode && selectedCommitteeId) {
      // For create mode, if no initial data and selectedCommitteeId is available
      if (meetingId) {
        setValue('MeetingId', String(meetingId));
      }
    }
  }, [voteDataToUse, reset, selectedCommitteeId, isEditMode, setValue, meetingId]);

  // When MeetingId changes, clear AgendaItemId if meeting is cleared
  useEffect(() => {
    if (!watchedMeetingId) {
      setValue('AgendaItemId', '');
    }
  }, [watchedMeetingId, setValue]);

  const onSubmit = async data => {
    const payload = {
      Question: data.Question || null,
      MeetingId: data.MeetingId ? parseInt(data.MeetingId) : null,
      AgendaItemId: data.AgendaItemId ? parseInt(data.AgendaItemId) : null,
      StartDate: data.StartDate ? new Date(data.StartDate).toISOString() : null,
      EndDate: data.EndDate ? new Date(data.EndDate).toISOString() : null,
      CommitteeId: selectedCommitteeId ? parseInt(selectedCommitteeId) : null,
      IsStarted: false,
      IsEnded: false,
      Choices: data.Choices.filter(c => c.text?.trim()).map(c => c.text.trim()),
    };

    if (isEditMode) {
      payload.Id = voteDataToUse?.Id || voteDataToUse?.id || parseInt(id) || null;
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
          navigate('/voting');
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

  if (isLoadingVote && !initialData) {
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
        <FormHeader icon={<Vote size={42} />} title={t(isEditMode ? 'editTitle' : 'createTitle')} subtitle={t(isEditMode ? 'editSubtitle' : 'createSubtitle')} />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-6 hover:border-border border-2 border-transparent p-3 m-3 rounded-xl transition-all duration-300">
            <h3 className="text-lg font-semibold text-text border-b border-brand/30 pb-2">{t('sections.basicInfo')}</h3>
            <div className="space-y-4">
              {/* Question */}
              <div>
                <label htmlFor="Question" className="block text-sm font-medium text-text mb-2">
                  {t('question')} <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="Question"
                  {...register('Question', {
                    required: t('questionRequired'),
                    maxLength: { value: 500, message: t('maxLength500') },
                  })}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none bg-surface text-text ${
                    errors.Question ? 'border-destructive' : 'border-border'
                  } ${isRTL ? 'text-right' : 'text-left'}`}
                  placeholder={t('questionPlaceholder')}
                  disabled={isSubmitting}
                />
                {errors.Question && <p className="mt-1 text-sm text-destructive">{errors.Question.message}</p>}
              </div>
            </div>
          </div>

          {/* Source Section */}
          <div className="space-y-6 hover:border-border border-2 border-transparent p-3 m-3 rounded-xl transition-all duration-300">
            <h3 className="text-lg font-semibold text-text border-b border-brand/30 pb-2">{t('sections.source')}</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Meeting */}
                <div>
                  <label htmlFor="MeetingId" className="block text-sm font-medium text-text mb-2">
                    {t('meeting')}
                  </label>
                  <select
                    id="MeetingId"
                    {...register('MeetingId')}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none bg-surface text-text border-border cursor-pointer"
                    disabled={isSubmitting || !selectedCommitteeId}
                  >
                    <option value="">{t('noMeeting')}</option>
                    {meetings.map(meeting => (
                      <option key={meeting.id || meeting.Id} value={meeting.id || meeting.Id}>
                        {isRTL ? meeting.arabicName || meeting.ArabicName : meeting.englishName || meeting.EnglishName}
                      </option>
                    ))}
                  </select>
                  {!selectedCommitteeId && <p className="mt-1 text-sm text-text-muted">{t('noCommitteeSelected')}</p>}
                </div>

                {/* Agenda Item - Only show if a meeting is selected */}
                {watchedMeetingId && (
                  <div>
                    <label htmlFor="AgendaItemId" className="block text-sm font-medium text-text mb-2">
                      {t('agendaItem')}
                    </label>
                    <select
                      id="AgendaItemId"
                      {...register('AgendaItemId')}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none bg-surface text-text border-border cursor-pointer"
                      disabled={isSubmitting || !watchedMeetingId}
                    >
                      <option value="">{t('selectAgendaItem')}</option>
                      {agendaItems.map(item => (
                        <option key={item.id || item.Id} value={item.id || item.Id}>
                          {item.sentence || item.Sentence || `Agenda Item ${item.id || item.Id}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dates Section */}
          <div className="space-y-6 hover:border-border border-2 border-transparent p-3 m-3 rounded-xl transition-all duration-300">
            <h3 className="text-lg font-semibold text-text border-b border-brand/30 pb-2">{t('sections.dates')}</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Date */}
                <div>
                  <label htmlFor="StartDate" className="block text-sm font-medium text-text mb-2">
                    {t('startDate')}
                  </label>
                  <input
                    id="StartDate"
                    type="date"
                    {...register('StartDate')}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none bg-surface text-text border-border"
                    disabled={isSubmitting}
                  />
                </div>

                {/* End Date */}
                <div>
                  <label htmlFor="EndDate" className="block text-sm font-medium text-text mb-2">
                    {t('endDate')}
                  </label>
                  <input
                    id="EndDate"
                    type="date"
                    {...register('EndDate')}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none bg-surface text-text border-border"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Choices Section */}
          <div className="space-y-6 hover:border-border border-2 border-transparent p-3 m-3 rounded-xl transition-all duration-300">
            <div className="flex items-center justify-between border-b border-brand/30 pb-2">
              <h3 className="text-lg font-semibold text-text">{t('sections.choices')}</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => append({ text: '' })}
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-1" />
                {t('addChoice')}
              </Button>
            </div>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <input
                    {...register(`Choices.${index}.text`, {
                      required: t('choiceRequired'),
                    })}
                    type="text"
                    className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none bg-surface text-text ${
                      errors.Choices?.[index]?.text ? 'border-destructive' : 'border-border'
                    } ${isRTL ? 'text-right' : 'text-left'}`}
                    placeholder={t('choicePlaceholder', { number: index + 1 })}
                    disabled={isSubmitting}
                  />
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2 text-destructive hover:text-destructive/80 transition-colors cursor-pointer"
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              {errors.Choices && <p className="mt-1 text-sm text-destructive">{t('atLeastOneChoice')}</p>}
            </div>
          </div>

          {/* Form Actions */}
          <FormActions isSubmitting={isSubmitting} isEditMode={isEditMode} onCancel={onClose} cancelRoute="/voting" translationNamespace="voteForm" />
        </form>
      </Card>
    </div>
  );
};

export default VoteForm;

