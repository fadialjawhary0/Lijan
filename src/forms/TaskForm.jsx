import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CheckSquare } from 'lucide-react';
import {
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useGetTaskByIdQuery,
  useGetAllTaskStatusesQuery,
} from '../queries/tasks';
import { useGetAllMembersQuery } from '../queries/members';
import { useGetAllMeetingsQuery } from '../queries/meetings';
import { useGetMeetingAgendaQuery } from '../queries/meetings';
import { useToast } from '../context/ToasterContext';
import { useBreadcrumbs } from '../context';
import { useCommittee } from '../context/CommitteeContext';
import { useAuth } from '../context/AuthContext';
import { isApiResponseSuccessful, getApiErrorMessage } from '../utils/apiResponseHandler';
import FormHeader from '../components/ui/FormHeader';
import FormActions from '../components/ui/FormActions';
import Card from '../components/ui/Card';

const TaskForm = ({ initialData = null, onSuccess, onClose }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const meetingIdParam = searchParams.get('meetingId');
  const { t, i18n } = useTranslation('taskForm');
  const { t: tHome } = useTranslation('home');
  const { t: tTasks } = useTranslation('tasks');
  const toast = useToast();
  const { setBreadcrumbs } = useBreadcrumbs();
  const { selectedCommitteeId } = useCommittee();
  const { userId } = useAuth();
  const isRTL = i18n.dir() === 'rtl';

  // Fetch task data if in update mode
  const {
    data: taskData,
    isLoading: isLoadingTask,
    error: taskError,
  } = useGetTaskByIdQuery(parseInt(id), { enabled: !!id && !initialData });

  // Use initialData prop if provided, otherwise use fetched data, otherwise null (create mode)
  const taskDataToUse = initialData || taskData?.data || taskData?.Data || null;
  const isEditMode = !!id || !!taskDataToUse;

  // Get meetingId from task data or URL param
  const meetingId = taskDataToUse?.meetingId || taskDataToUse?.MeetingId || (meetingIdParam ? parseInt(meetingIdParam) : null);

  // Fetch lookup data
  const { data: taskStatusesData } = useGetAllTaskStatusesQuery();
  const { data: membersData } = useGetAllMembersQuery(
    {
      CommitteeId: selectedCommitteeId ? parseInt(selectedCommitteeId) : undefined,
      IsActive: true,
      PageSize: 1000,
    },
    { enabled: !!selectedCommitteeId }
  );
  const { data: meetingsData } = useGetAllMeetingsQuery(
    {
      CommitteeId: selectedCommitteeId ? parseInt(selectedCommitteeId) : undefined,
      PageSize: 1000,
    },
    { enabled: !!selectedCommitteeId }
  );
  const { data: agendaData } = useGetMeetingAgendaQuery(meetingId, { enabled: !!meetingId });

  const taskStatuses = taskStatusesData?.data || taskStatusesData?.Data || [];
  const members = membersData?.data || membersData?.Data || [];
  const meetings = meetingsData?.data || meetingsData?.Data || [];
  const agendaItems = agendaData?.data || agendaData?.Data || [];

  // Get current user's member ID
  const currentMemberId = useMemo(() => {
    if (!membersData?.data || !userId) return null;
    const member = membersData.data.find(m => m.userId === parseInt(userId));
    return member?.id || null;
  }, [membersData, userId]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
    setValue,
  } = useForm({
    defaultValues: initialData || {
      EnglishName: '',
      ArabicName: '',
      MemberId: '',
      StatusId: '',
      MeetingId: meetingId || '',
      AgendaItemId: '',
      StartDate: '',
      EndDate: '',
      PercentageComplete: '',
      CommitteeId: selectedCommitteeId ? parseInt(selectedCommitteeId) : null,
    },
  });

  const createMutation = useCreateTaskMutation();
  const updateMutation = useUpdateTaskMutation();

  const watchedMeetingId = watch('MeetingId');
  const percentageComplete = watch('PercentageComplete');

  // Set breadcrumbs
  useEffect(() => {
    setBreadcrumbs([
      { label: tHome('breadcrumbs.home'), href: '/' },
      { label: tTasks('title'), href: '/tasks' },
      { label: isEditMode ? t('editTitle') : t('createTitle'), href: isEditMode ? `/tasks/update/${id}` : '/tasks/create' },
    ]);
  }, [setBreadcrumbs, isEditMode, id, t, tHome, tTasks]);

  // Reset form when task data is loaded or selectedCommitteeId changes for create mode
  useEffect(() => {
    if (taskDataToUse) {
      const data = {
        EnglishName: taskDataToUse.EnglishName || taskDataToUse.englishName || '',
        ArabicName: taskDataToUse.ArabicName || taskDataToUse.arabicName || '',
        MemberId: taskDataToUse.MemberId || taskDataToUse.memberId || '',
        StatusId: String(taskDataToUse.StatusId || taskDataToUse.statusId || ''),
        MeetingId: String(taskDataToUse.MeetingId || taskDataToUse.meetingId || ''),
        AgendaItemId: String(taskDataToUse.AgendaItemId || taskDataToUse.agendaItemId || ''),
        StartDate: taskDataToUse.StartDate || taskDataToUse.startDate ? new Date(taskDataToUse.StartDate || taskDataToUse.startDate).toISOString().split('T')[0] : '',
        EndDate: taskDataToUse.EndDate || taskDataToUse.endDate ? new Date(taskDataToUse.EndDate || taskDataToUse.endDate).toISOString().split('T')[0] : '',
        PercentageComplete: taskDataToUse.PercentageComplete !== undefined && taskDataToUse.PercentageComplete !== null ? String(taskDataToUse.PercentageComplete) : taskDataToUse.percentageComplete !== undefined && taskDataToUse.percentageComplete !== null ? String(taskDataToUse.percentageComplete) : '',
        CommitteeId: taskDataToUse.CommitteeId || taskDataToUse.committeeId || (selectedCommitteeId ? parseInt(selectedCommitteeId) : null),
      };
      reset(data);
    } else if (!isEditMode && selectedCommitteeId) {
      // For create mode, if no initial data and selectedCommitteeId is available, set it
      setValue('CommitteeId', parseInt(selectedCommitteeId));
      if (meetingId) {
        setValue('MeetingId', String(meetingId));
      }
    }
  }, [taskDataToUse, reset, selectedCommitteeId, isEditMode, setValue, meetingId]);

  // When MeetingId changes, clear AgendaItemId if meeting is cleared
  useEffect(() => {
    if (!watchedMeetingId) {
      setValue('AgendaItemId', '');
    }
  }, [watchedMeetingId, setValue]);

  const onSubmit = async data => {
    const payload = {
      EnglishName: data.EnglishName || null,
      ArabicName: data.ArabicName || null,
      MemberId: data.MemberId ? parseInt(data.MemberId) : null,
      StatusId: data.StatusId ? parseInt(data.StatusId) : null,
      MeetingId: data.MeetingId ? parseInt(data.MeetingId) : null,
      AgendaItemId: data.AgendaItemId ? parseInt(data.AgendaItemId) : null,
      StartDate: data.StartDate ? new Date(data.StartDate).toISOString() : null,
      EndDate: data.EndDate ? new Date(data.EndDate).toISOString() : null,
      PercentageComplete: data.PercentageComplete ? parseFloat(data.PercentageComplete) : null,
      IsApproved: false,
    };

    if (isEditMode) {
      payload.Id = taskDataToUse?.Id || taskDataToUse?.id || parseInt(id) || null;
      payload.RequestingMemberId = currentMemberId;
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
          navigate('/tasks');
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

  if (isLoadingTask && !initialData) {
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
        <FormHeader icon={<CheckSquare size={42} />} title={t(isEditMode ? 'editTitle' : 'createTitle')} subtitle={t(isEditMode ? 'editSubtitle' : 'createSubtitle')} />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-6 hover:border-border border-2 border-transparent p-3 m-3 rounded-xl transition-all duration-300">
            <h3 className="text-lg font-semibold text-text border-b border-brand/30 pb-2">{t('sections.basicInfo')}</h3>
            <div className="space-y-4">
              {/* Title Fields - English and Arabic */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="EnglishName" className="block text-sm font-medium text-text mb-2">
                    {t('englishName')} {!isRTL && <span className="text-destructive">*</span>}
                  </label>
                  <input
                    id="EnglishName"
                    type="text"
                    {...register('EnglishName', {
                      required: !isRTL ? t('englishNameRequired') : false,
                      maxLength: { value: 200, message: t('maxLength200') },
                    })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none bg-surface text-text ${
                      errors.EnglishName ? 'border-destructive' : 'border-border'
                    } ${isRTL ? 'text-right' : 'text-left'}`}
                    placeholder={t('englishNamePlaceholder')}
                    disabled={isSubmitting}
                  />
                  {errors.EnglishName && <p className="mt-1 text-sm text-destructive">{errors.EnglishName.message}</p>}
                </div>

                <div>
                  <label htmlFor="ArabicName" className="block text-sm font-medium text-text mb-2">
                    {t('arabicName')} {isRTL && <span className="text-destructive">*</span>}
                  </label>
                  <input
                    id="ArabicName"
                    type="text"
                    {...register('ArabicName', {
                      required: isRTL ? t('arabicNameRequired') : false,
                      maxLength: { value: 200, message: t('maxLength200') },
                    })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none bg-surface text-text ${
                      errors.ArabicName ? 'border-destructive' : 'border-border'
                    } ${isRTL ? 'text-right' : 'text-left'}`}
                    placeholder={t('arabicNamePlaceholder')}
                    disabled={isSubmitting}
                  />
                  {errors.ArabicName && <p className="mt-1 text-sm text-destructive">{errors.ArabicName.message}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Assignment Section */}
          <div className="space-y-6 hover:border-border border-2 border-transparent p-3 m-3 rounded-xl transition-all duration-300">
            <h3 className="text-lg font-semibold text-text border-b border-brand/30 pb-2">{t('sections.assignment')}</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Assigned To */}
                <div>
                  <label htmlFor="MemberId" className="block text-sm font-medium text-text mb-2">
                    {t('assignedTo')}
                  </label>
                  <select
                    id="MemberId"
                    {...register('MemberId')}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none bg-surface text-text border-border cursor-pointer"
                    disabled={isSubmitting || !selectedCommitteeId}
                  >
                    <option value="">{t('selectMember')}</option>
                    {members.map(member => (
                      <option key={member.id || member.Id} value={member.id || member.Id}>
                        {member.userInfo?.fullName || member.member?.userInfo?.fullName || `Member ${member.id || member.Id}`}
                      </option>
                    ))}
                  </select>
                  {!selectedCommitteeId && <p className="mt-1 text-sm text-text-muted">{t('noCommitteeSelected')}</p>}
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="StatusId" className="block text-sm font-medium text-text mb-2">
                    {t('status')} <span className="text-destructive">*</span>
                  </label>
                  <select
                    id="StatusId"
                    {...register('StatusId', {
                      required: t('statusRequired'),
                    })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none bg-surface text-text cursor-pointer ${
                      errors.StatusId ? 'border-destructive' : 'border-border'
                    }`}
                    disabled={isSubmitting}
                  >
                    <option value="">{t('selectStatus')}</option>
                    {taskStatuses.map(status => (
                      <option key={status.id || status.Id} value={status.id || status.Id}>
                        {isRTL ? status.arabicName || status.ArabicName : status.englishName || status.EnglishName}
                      </option>
                    ))}
                  </select>
                  {errors.StatusId && <p className="mt-1 text-sm text-destructive">{errors.StatusId.message}</p>}
                </div>
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

          {/* Dates and Progress Section */}
          <div className="space-y-6 hover:border-border border-2 border-transparent p-3 m-3 rounded-xl transition-all duration-300">
            <h3 className="text-lg font-semibold text-text border-b border-brand/30 pb-2">{t('sections.datesAndProgress')}</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    {t('dueDate')}
                  </label>
                  <input
                    id="EndDate"
                    type="date"
                    {...register('EndDate')}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none bg-surface text-text border-border"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Percentage Complete */}
                <div>
                  <label htmlFor="PercentageComplete" className="block text-sm font-medium text-text mb-2">
                    {t('percentageComplete')}
                  </label>
                  <input
                    id="PercentageComplete"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    {...register('PercentageComplete', {
                      min: { value: 0, message: t('percentageMin') },
                      max: { value: 100, message: t('percentageMax') },
                    })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none bg-surface text-text ${
                      errors.PercentageComplete ? 'border-destructive' : 'border-border'
                    }`}
                    placeholder="0-100"
                    disabled={isSubmitting}
                  />
                  {errors.PercentageComplete && <p className="mt-1 text-sm text-destructive">{errors.PercentageComplete.message}</p>}
                  {percentageComplete && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-brand h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(100, Math.max(0, parseFloat(percentageComplete) || 0))}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <FormActions isSubmitting={isSubmitting} isEditMode={isEditMode} onCancel={onClose} cancelRoute="/tasks" translationNamespace="taskForm" />
        </form>
      </Card>
    </div>
  );
};

export default TaskForm;

