import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import {
  useCreateMeetingMutation,
  useUpdateMeetingMutation,
  useGetMeetingByIdQuery,
  useGetAllMeetingTypesQuery,
  useGetAllMeetingStatusesQuery,
  useGetAllLocationsQuery,
  useGetAllBuildingsQuery,
  useGetAllRoomsQuery,
  useGenerateZoomLinkMutation,
} from '../queries/index';
import { useToast } from '../context/ToasterContext';
import { useBreadcrumbs } from '../context';
import { useCommittee } from '../context/CommitteeContext';
import { isApiResponseSuccessful, getApiErrorMessage } from '../utils/apiResponseHandler';
import FormHeader from '../components/ui/FormHeader';
import FormActions from '../components/ui/FormActions';
import Card from '../components/ui/Card';
import { getDefaultSuccessRoute } from '../utils/routeUtils';

const MeetingForm = ({ initialData = null, onSuccess, onClose }) => {
  const navigate = useNavigate();
  const { meetingId } = useParams();
  const { t, i18n } = useTranslation('meetingForm');
  const { t: tHome } = useTranslation('home');
  const toast = useToast();
  const { setBreadcrumbs } = useBreadcrumbs();
  const { selectedCommitteeId } = useCommittee();

  // Fetch meeting data if in update mode
  const { data: meetingData, isLoading: isLoadingMeeting, error: meetingError } = useGetMeetingByIdQuery(meetingId, { enabled: !!meetingId && !initialData });

  // Use initialData prop if provided, otherwise use fetched data, otherwise null (create mode)
  const meetingDataToUse = initialData || meetingData?.data || meetingData?.Data || null;
  const isEditMode = !!meetingId || !!meetingDataToUse;

  // Fetch lookup data
  const { data: meetingTypesData } = useGetAllMeetingTypesQuery();
  const { data: meetingStatusesData } = useGetAllMeetingStatusesQuery();
  const { data: locationsData } = useGetAllLocationsQuery();
  const { data: buildingsData } = useGetAllBuildingsQuery();
  const { data: roomsData } = useGetAllRoomsQuery();

  const meetingTypes = meetingTypesData?.data || meetingTypesData?.Data || [];
  const meetingStatuses = meetingStatusesData?.data || meetingStatusesData?.Data || [];
  const locations = locationsData?.data || locationsData?.Data || [];
  const buildings = buildingsData?.data || buildingsData?.Data || [];
  const rooms = roomsData?.data || roomsData?.Data || [];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
    setValue,
  } = useForm({
    defaultValues: initialData || {
      ArabicName: '',
      EnglishName: '',
      MeetingTypeId: '',
      MeetingLocationId: '',
      BuildingId: '',
      RoomId: '',
      Date: '',
      StartTime: '',
      EndTime: '',
      Notes: '',
      Link: '',
      StatusId: '',
      CommitteeId: selectedCommitteeId ? parseInt(selectedCommitteeId) : null,
      CouncilId: null,
      IsRecurring: false,
      RecurrenceType: 'None',
      RecurrenceInterval: 1,
      RecurrenceEndDate: '',
      RecurrenceCount: null,
    },
  });

  const createMutation = useCreateMeetingMutation();
  const updateMutation = useUpdateMeetingMutation();
  const generateZoomLinkMutation = useGenerateZoomLinkMutation();

  const meetingTypeId = watch('MeetingTypeId');
  const meetingLocationId = watch('MeetingLocationId');
  const buildingId = watch('BuildingId');
  const isRecurring = watch('IsRecurring');
  const recurrenceType = watch('RecurrenceType');
  const recurrenceInterval = watch('RecurrenceInterval');
  const recurrenceCount = watch('RecurrenceCount');
  const meetingDate = watch('Date');

  // Find the selected meeting type
  const selectedMeetingType = meetingTypes.find(type => String(type.Id || type.id) === String(meetingTypeId));

  // Determine if it's Physical or Virtual meeting
  const isPhysicalMeeting =
    selectedMeetingType?.EnglishName?.toLowerCase().includes('physical') ||
    selectedMeetingType?.englishName?.toLowerCase().includes('physical') ||
    selectedMeetingType?.ArabicName?.includes('حضوري') ||
    selectedMeetingType?.arabicName?.includes('حضوري');

  const isVirtualMeeting =
    selectedMeetingType?.EnglishName?.toLowerCase().includes('virtual') ||
    selectedMeetingType?.englishName?.toLowerCase().includes('virtual') ||
    selectedMeetingType?.ArabicName?.includes('افتراضي') ||
    selectedMeetingType?.arabicName?.includes('افتراضي');

  // Clear fields when switching meeting types
  useEffect(() => {
    if (isVirtualMeeting) {
      // Clear location fields when switching to virtual
      setValue('MeetingLocationId', '');
      setValue('BuildingId', '');
      setValue('RoomId', '');
    }
  }, [meetingTypeId, isVirtualMeeting, setValue]);

  // Auto-calculate recurrence end date based on start date, type, interval, and count
  useEffect(() => {
    if (isRecurring && recurrenceType && recurrenceType !== 'None' && meetingDate && recurrenceCount && recurrenceInterval) {
      try {
        const startDate = new Date(meetingDate);
        const interval = parseInt(recurrenceInterval) || 1;
        const count = parseInt(recurrenceCount) || 1;

        // Calculate end date: start date + (interval * (count - 1)) occurrences
        // Note: count - 1 because the first occurrence is the start date itself
        let endDate = new Date(startDate);

        switch (recurrenceType) {
          case 'Daily':
            endDate.setDate(startDate.getDate() + interval * (count - 1));
            break;
          case 'Weekly':
            endDate.setDate(startDate.getDate() + interval * 7 * (count - 1));
            break;
          case 'Monthly':
            endDate.setMonth(startDate.getMonth() + interval * (count - 1));
            break;
          case 'Yearly':
            endDate.setFullYear(startDate.getFullYear() + interval * (count - 1));
            break;
          default:
            return;
        }

        // Format as YYYY-MM-DD for the date input
        const formattedDate = endDate.toISOString().split('T')[0];
        setValue('RecurrenceEndDate', formattedDate);
      } catch (error) {
        console.error('Error calculating recurrence end date:', error);
      }
    } else if (!isRecurring || !recurrenceType || recurrenceType === 'None') {
      // Clear end date if not recurring
      setValue('RecurrenceEndDate', '');
    }
  }, [isRecurring, recurrenceType, meetingDate, recurrenceInterval, recurrenceCount, setValue]);

  // Set breadcrumbs
  useEffect(() => {
    setBreadcrumbs([
      { label: tHome('breadcrumbs.home'), href: '/' },
      { label: isEditMode ? t('editTitle') : t('createTitle'), href: isEditMode ? `/meetings/update/${meetingId}` : '/meetings/create' },
    ]);
  }, [setBreadcrumbs, isEditMode, meetingId, t, tHome]);

  // Reset form when meeting data is loaded
  useEffect(() => {
    if (meetingDataToUse) {
      const data = {
        ArabicName: meetingDataToUse.ArabicName || meetingDataToUse.arabicName || '',
        EnglishName: meetingDataToUse.EnglishName || meetingDataToUse.englishName || '',
        MeetingTypeId: meetingDataToUse.MeetingTypeId || meetingDataToUse.meetingTypeId || '',
        MeetingLocationId: meetingDataToUse.MeetingLocationId || meetingDataToUse.meetingLocationId || '',
        BuildingId: meetingDataToUse.BuildingId || meetingDataToUse.buildingId || '',
        RoomId: meetingDataToUse.RoomId || meetingDataToUse.roomId || '',
        Date: meetingDataToUse.Date || meetingDataToUse.date ? (meetingDataToUse.Date || meetingDataToUse.date).toString().split('T')[0] : '',
        StartTime: meetingDataToUse.StartTime || meetingDataToUse.startTime ? formatTimeSpan(meetingDataToUse.StartTime || meetingDataToUse.startTime) : '',
        EndTime: meetingDataToUse.EndTime || meetingDataToUse.endTime ? formatTimeSpan(meetingDataToUse.EndTime || meetingDataToUse.endTime) : '',
        Notes: meetingDataToUse.Notes || meetingDataToUse.notes || '',
        Link: meetingDataToUse.Link || meetingDataToUse.link || '',
        StatusId: meetingDataToUse.StatusId || meetingDataToUse.statusId || '',
        CommitteeId: meetingDataToUse.CommitteeId || meetingDataToUse.committeeId || (selectedCommitteeId ? parseInt(selectedCommitteeId) : null),
        CouncilId: meetingDataToUse.CouncilId || meetingDataToUse.councilId || null,
        IsRecurring: meetingDataToUse.IsRecurring || meetingDataToUse.isRecurring || false,
        RecurrenceType: meetingDataToUse.RecurrenceType || meetingDataToUse.recurrenceType || 'None',
        RecurrenceInterval: meetingDataToUse.RecurrenceInterval || meetingDataToUse.recurrenceInterval || 1,
        RecurrenceCount: meetingDataToUse.RecurrenceCount || meetingDataToUse.recurrenceCount || null,
        // End date will be auto-calculated, no need to set it here
        RecurrenceEndDate: '',
      };

      // Convert IDs to strings for form inputs
      if (data.MeetingTypeId) data.MeetingTypeId = String(data.MeetingTypeId);
      if (data.MeetingLocationId) data.MeetingLocationId = String(data.MeetingLocationId);
      if (data.BuildingId) data.BuildingId = String(data.BuildingId);
      if (data.RoomId) data.RoomId = String(data.RoomId);
      if (data.StatusId) data.StatusId = String(data.StatusId);

      reset(data);
    }
  }, [meetingDataToUse, reset, selectedCommitteeId]);

  // Helper function to format TimeSpan to HH:mm
  function formatTimeSpan(timeSpan) {
    if (!timeSpan) return '';
    if (typeof timeSpan === 'string') {
      // Handle "HH:mm:ss" or "HH:mm" format
      return timeSpan.substring(0, 5);
    }
    // Handle TimeSpan object (if backend sends it as object)
    const hours = String(timeSpan.hours || 0).padStart(2, '0');
    const minutes = String(timeSpan.minutes || 0).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // Helper function to convert HH:mm to TimeSpan format
  function timeToTimeSpan(timeString) {
    if (!timeString) return null;
    const [hours, minutes] = timeString.split(':').map(Number);
    return `${hours}:${minutes}:00`;
  }

  // Handle Zoom link generation
  const handleGenerateZoomLink = async () => {
    const meetingDate = watch('Date');
    const startTime = watch('StartTime');
    const englishName = watch('EnglishName');
    const arabicName = watch('ArabicName');

    // Prepare meeting topic
    const topic = englishName || arabicName || 'Committee Meeting';

    // Prepare start time
    let startDateTime = null;
    if (meetingDate) {
      if (startTime) {
        const [hours, minutes] = startTime.split(':').map(Number);
        startDateTime = new Date(meetingDate);
        startDateTime.setHours(hours, minutes, 0, 0);
      } else {
        startDateTime = new Date(meetingDate);
      }
    }

    try {
      const response = await generateZoomLinkMutation.mutateAsync({
        Topic: topic,
        StartTime: startDateTime,
        Duration: 60, // Default 60 minutes
      });

      if (isApiResponseSuccessful(response)) {
        const zoomLink = response?.data || response?.Data || '';
        if (zoomLink) {
          setValue('Link', zoomLink);
          toast.success(t('zoomLinkGenerated'));
        } else {
          toast.error(t('zoomLinkGenerationFailed'));
        }
      } else {
        const errorMessage = getApiErrorMessage(response, t('zoomLinkGenerationFailed'));
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Zoom link generation error:', error);
      toast.error(error.message || t('zoomLinkGenerationFailed'));
    }
  };

  const onSubmit = async data => {
    const payload = {
      ArabicName: data.ArabicName || null,
      EnglishName: data.EnglishName || null,
      MeetingTypeId: data.MeetingTypeId ? parseInt(data.MeetingTypeId) : null,
      MeetingLocationId: data.MeetingLocationId ? parseInt(data.MeetingLocationId) : null,
      BuildingId: data.BuildingId ? parseInt(data.BuildingId) : null,
      RoomId: data.RoomId ? parseInt(data.RoomId) : null,
      Date: data.Date ? new Date(data.Date).toISOString() : null,
      StartTime: data.StartTime ? timeToTimeSpan(data.StartTime) : null,
      EndTime: data.EndTime ? timeToTimeSpan(data.EndTime) : null,
      Notes: data.Notes || null,
      Link: data.Link || null,
      StatusId: data.StatusId ? parseInt(data.StatusId) : null,
      CommitteeId: data.CommitteeId ? parseInt(data.CommitteeId) : null,
      CouncilId: data.CouncilId ? parseInt(data.CouncilId) : null,
      IsRecurring: data.IsRecurring || false,
      RecurrenceType: data.IsRecurring && data.RecurrenceType && data.RecurrenceType !== 'None' ? data.RecurrenceType : null,
      RecurrenceInterval:
        data.IsRecurring && data.RecurrenceType && data.RecurrenceType !== 'None' ? (data.RecurrenceInterval ? parseInt(data.RecurrenceInterval) : 1) : null,
      RecurrenceCount: data.IsRecurring && data.RecurrenceCount ? parseInt(data.RecurrenceCount) : null,
      // Calculate end date automatically
      RecurrenceEndDate: (() => {
        if (data.IsRecurring && data.RecurrenceType && data.RecurrenceType !== 'None' && data.Date && data.RecurrenceInterval && data.RecurrenceCount) {
          try {
            const startDate = new Date(data.Date);
            const interval = parseInt(data.RecurrenceInterval) || 1;
            const count = parseInt(data.RecurrenceCount) || 1;
            let endDate = new Date(startDate);

            switch (data.RecurrenceType) {
              case 'Daily':
                endDate.setDate(startDate.getDate() + interval * (count - 1));
                break;
              case 'Weekly':
                endDate.setDate(startDate.getDate() + interval * 7 * (count - 1));
                break;
              case 'Monthly':
                endDate.setMonth(startDate.getMonth() + interval * (count - 1));
                break;
              case 'Yearly':
                endDate.setFullYear(startDate.getFullYear() + interval * (count - 1));
                break;
              default:
                return null;
            }

            return endDate.toISOString();
          } catch (error) {
            console.error('Error calculating recurrence end date:', error);
            return null;
          }
        }
        return null;
      })(),
    };

    if (isEditMode) {
      payload.Id = meetingDataToUse?.Id || meetingDataToUse?.id || parseInt(meetingId) || null;
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
          navigate('/meetings');
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

  if (isLoadingMeeting && !initialData) {
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
    <div className="container mx-auto px-4 py-6 ">
      <Card className="w-full">
        <FormHeader
          icon={<Calendar size={42} />}
          title={t(isEditMode ? 'editTitle' : 'createTitle')}
          subtitle={t(isEditMode ? 'editSubtitle' : 'createSubtitle')}
        />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-6 hover:border-border border-2 border-transparent p-3 m-3 rounded-xl transition-all duration-300">
            <h3 className="text-lg font-semibold text-text border-b border-brand/30 pb-2">{t('sections.basicInfo')}</h3>
            <div className="space-y-4">
              {/* Arabic Name */}
              <div>
                <label htmlFor="ArabicName" className="block text-sm font-medium text-text mb-2">
                  {t('arabicName')}
                </label>
                <input
                  id="ArabicName"
                  type="text"
                  {...register('ArabicName', {
                    maxLength: { value: 200, message: t('maxLength200') },
                  })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none bg-surface text-text ${
                    errors.ArabicName ? 'border-destructive' : 'border-border'
                  }`}
                  placeholder={t('arabicNamePlaceholder')}
                  disabled={isSubmitting}
                />
                {errors.ArabicName && <p className="mt-1 text-sm text-destructive">{errors.ArabicName.message}</p>}
              </div>

              {/* English Name */}
              <div>
                <label htmlFor="EnglishName" className="block text-sm font-medium text-text mb-2">
                  {t('englishName')}
                </label>
                <input
                  id="EnglishName"
                  type="text"
                  {...register('EnglishName', {
                    maxLength: { value: 200, message: t('maxLength200') },
                  })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none bg-surface text-text ${
                    errors.EnglishName ? 'border-destructive' : 'border-border'
                  }`}
                  placeholder={t('englishNamePlaceholder')}
                  disabled={isSubmitting}
                />
                {errors.EnglishName && <p className="mt-1 text-sm text-destructive">{errors.EnglishName.message}</p>}
              </div>
            </div>
          </div>

          {/* Meeting Details Section */}
          <div className="space-y-6 hover:border-border border-2 border-transparent p-3 m-3 rounded-xl transition-all duration-300">
            <h3 className="text-lg font-semibold text-text border-b border-brand/30 pb-2">{t('sections.meetingDetails')}</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Meeting Type */}
                <div>
                  <label htmlFor="MeetingTypeId" className="block text-sm font-medium text-text mb-2">
                    {t('meetingType')}
                  </label>
                  <select
                    id="MeetingTypeId"
                    {...register('MeetingTypeId')}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none bg-surface text-text border-border"
                    disabled={isSubmitting}
                  >
                    <option value="">{t('selectMeetingType')}</option>
                    {meetingTypes.map(type => (
                      <option key={type.Id || type.id} value={type.Id || type.id}>
                        {i18n.language === 'ar' ? type.ArabicName || type.arabicName : type.EnglishName || type.englishName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Meeting Status */}
                <div>
                  <label htmlFor="StatusId" className="block text-sm font-medium text-text mb-2">
                    {t('status')}
                  </label>
                  <select
                    id="StatusId"
                    {...register('StatusId')}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none bg-surface text-text border-border"
                    disabled={isSubmitting}
                  >
                    <option value="">{t('selectStatus')}</option>
                    {meetingStatuses.map(status => (
                      <option key={status.Id || status.id} value={status.Id || status.id}>
                        {i18n.language === 'ar' ? status.ArabicName || status.arabicName : status.EnglishName || status.englishName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Date */}
                <div>
                  <label htmlFor="Date" className="block text-sm font-medium text-text mb-2">
                    {t('date')}
                  </label>
                  <input
                    id="Date"
                    type="date"
                    {...register('Date')}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none bg-surface text-text border-border"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Start Time */}
                <div>
                  <label htmlFor="StartTime" className="block text-sm font-medium text-text mb-2">
                    {t('startTime')}
                  </label>
                  <input
                    id="StartTime"
                    type="time"
                    {...register('StartTime')}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none bg-surface text-text border-border"
                    disabled={isSubmitting}
                  />
                </div>

                {/* End Time */}
                <div>
                  <label htmlFor="EndTime" className="block text-sm font-medium text-text mb-2">
                    {t('endTime')}
                  </label>
                  <input
                    id="EndTime"
                    type="time"
                    {...register('EndTime')}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none bg-surface text-text border-border"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recurrence Section */}
          <div className="space-y-6 hover:border-border border-2 border-transparent p-3 m-3 rounded-xl transition-all duration-300">
            <h3 className="text-lg font-semibold text-text border-b border-brand/30 pb-2">{t('sections.recurrence')}</h3>
            <div className="space-y-4">
              {/* Is Recurring Checkbox */}
              <div className="flex items-center gap-3">
                <input
                  id="IsRecurring"
                  type="checkbox"
                  {...register('IsRecurring')}
                  className="w-5 h-5 rounded border-border text-brand focus:ring-brand"
                  disabled={isSubmitting}
                />
                <label htmlFor="IsRecurring" className="text-sm font-medium text-text cursor-pointer">
                  {t('isRecurring')}
                </label>
              </div>

              {/* Recurrence Options - Only show if IsRecurring is true */}
              {isRecurring && (
                <div className="space-y-4 pl-8 border-l-2 border-brand/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Recurrence Type */}
                    <div>
                      <label htmlFor="RecurrenceType" className="block text-sm font-medium text-text mb-2">
                        {t('recurrenceType')}
                      </label>
                      <select
                        id="RecurrenceType"
                        {...register('RecurrenceType', {
                          required: isRecurring ? t('recurrenceTypeRequired') : false,
                        })}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none bg-surface text-text ${
                          errors.RecurrenceType ? 'border-destructive' : 'border-border'
                        }`}
                        disabled={isSubmitting}
                      >
                        <option value="None">{t('recurrenceTypes.none')}</option>
                        <option value="Daily">{t('recurrenceTypes.daily')}</option>
                        <option value="Weekly">{t('recurrenceTypes.weekly')}</option>
                        <option value="Monthly">{t('recurrenceTypes.monthly')}</option>
                        <option value="Yearly">{t('recurrenceTypes.yearly')}</option>
                      </select>
                      {errors.RecurrenceType && <p className="mt-1 text-sm text-destructive">{errors.RecurrenceType.message}</p>}
                    </div>

                    {/* Recurrence Interval */}
                    {recurrenceType && recurrenceType !== 'None' && (
                      <div>
                        <label htmlFor="RecurrenceInterval" className="block text-sm font-medium text-text mb-2">
                          {t('recurrenceInterval')}
                        </label>
                        <input
                          id="RecurrenceInterval"
                          type="number"
                          min="1"
                          {...register('RecurrenceInterval', {
                            required: isRecurring && recurrenceType !== 'None' ? t('recurrenceIntervalRequired') : false,
                            min: { value: 1, message: t('recurrenceIntervalMin') },
                          })}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none bg-surface text-text ${
                            errors.RecurrenceInterval ? 'border-destructive' : 'border-border'
                          }`}
                          placeholder={t('recurrenceIntervalPlaceholder')}
                          disabled={isSubmitting}
                        />
                        {errors.RecurrenceInterval && <p className="mt-1 text-sm text-destructive">{errors.RecurrenceInterval.message}</p>}
                        <p className="mt-1 text-xs text-text-muted">{t('recurrenceIntervalHelp')}</p>
                      </div>
                    )}
                  </div>

                  {/* Recurrence Count */}
                  {recurrenceType && recurrenceType !== 'None' && (
                    <div>
                      <label htmlFor="RecurrenceCount" className="block text-sm font-medium text-text mb-2">
                        {t('recurrenceCount')}
                      </label>
                      <input
                        id="RecurrenceCount"
                        type="number"
                        min="1"
                        max="1000"
                        {...register('RecurrenceCount', {
                          required: isRecurring && recurrenceType !== 'None' ? t('recurrenceCountRequired') : false,
                          min: { value: 1, message: t('recurrenceCountMin') },
                          max: { value: 1000, message: t('recurrenceCountMax') },
                        })}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none bg-surface text-text ${
                          errors.RecurrenceCount ? 'border-destructive' : 'border-border'
                        }`}
                        placeholder={t('recurrenceCountPlaceholder')}
                        disabled={isSubmitting}
                      />
                      {errors.RecurrenceCount && <p className="mt-1 text-sm text-destructive">{errors.RecurrenceCount.message}</p>}
                      <p className="mt-1 text-xs text-text-muted">{t('recurrenceCountHelp')}</p>
                      {/* Display calculated end date */}
                      {meetingDate && recurrenceInterval && recurrenceCount && (
                        <p className="mt-2 text-sm text-text-muted">
                          {t('calculatedEndDate')}:{' '}
                          <span className="font-semibold text-text">
                            {(() => {
                              try {
                                const startDate = new Date(meetingDate);
                                const interval = parseInt(recurrenceInterval) || 1;
                                const count = parseInt(recurrenceCount) || 1;
                                let endDate = new Date(startDate);

                                switch (recurrenceType) {
                                  case 'Daily':
                                    endDate.setDate(startDate.getDate() + interval * (count - 1));
                                    break;
                                  case 'Weekly':
                                    endDate.setDate(startDate.getDate() + interval * 7 * (count - 1));
                                    break;
                                  case 'Monthly':
                                    endDate.setMonth(startDate.getMonth() + interval * (count - 1));
                                    break;
                                  case 'Yearly':
                                    endDate.setFullYear(startDate.getFullYear() + interval * (count - 1));
                                    break;
                                  default:
                                    return '';
                                }

                                return endDate.toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                });
                              } catch (error) {
                                return '';
                              }
                            })()}
                          </span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Location Section - Only show for Physical Meetings */}
          {isPhysicalMeeting && (
            <div className="space-y-6 hover:border-border border-2 border-transparent p-3 m-3 rounded-xl transition-all duration-300">
              <h3 className="text-lg font-semibold text-text border-b border-brand/30 pb-2">{t('sections.location')}</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Meeting Location */}
                  <div>
                    <label htmlFor="MeetingLocationId" className="block text-sm font-medium text-text mb-2">
                      {t('meetingLocation')}
                    </label>
                    <select
                      id="MeetingLocationId"
                      {...register('MeetingLocationId')}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none bg-surface text-text border-border"
                      disabled={isSubmitting}
                    >
                      <option value="">{t('selectLocation')}</option>
                      {locations.map(location => (
                        <option key={location.Id || location.id} value={location.Id || location.id}>
                          {i18n.language === 'ar' ? location.ArabicName || location.arabicName : location.EnglishName || location.englishName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Building */}
                  <div>
                    <label htmlFor="BuildingId" className="block text-sm font-medium text-text mb-2">
                      {t('building')}
                    </label>
                    <select
                      id="BuildingId"
                      {...register('BuildingId')}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none bg-surface text-text border-border"
                      disabled={isSubmitting}
                    >
                      <option value="">{t('selectBuilding')}</option>
                      {buildings.map(building => (
                        <option key={building.Id || building.id} value={building.Id || building.id}>
                          {i18n.language === 'ar' ? building.ArabicName || building.arabicName : building.EnglishName || building.englishName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Room */}
                <div>
                  <label htmlFor="RoomId" className="block text-sm font-medium text-text mb-2">
                    {t('room')}
                  </label>
                  <select
                    id="RoomId"
                    {...register('RoomId')}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none bg-surface text-text border-border"
                    disabled={isSubmitting}
                  >
                    <option value="">{t('selectRoom')}</option>
                    {rooms.map(room => (
                      <option key={room.Id || room.id} value={room.Id || room.id}>
                        {i18n.language === 'ar' ? room.ArabicName || room.arabicName : room.EnglishName || room.englishName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Virtual Meeting Link Section - Only show for Virtual Meetings */}
          {isVirtualMeeting && (
            <div className="space-y-6 hover:border-border border-2 border-transparent p-3 m-3 rounded-xl transition-all duration-300">
              <h3 className="text-lg font-semibold text-text border-b border-brand/30 pb-2">{t('sections.virtualMeeting')}</h3>
              <div>
                <label htmlFor="Link" className="block text-sm font-medium text-text mb-2">
                  {t('link')} <span className="text-destructive">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    id="Link"
                    type="url"
                    {...register('Link', {
                      required: isVirtualMeeting ? t('linkRequired') : false,
                      pattern: {
                        value: /^https?:\/\/.+/,
                        message: t('invalidUrl'),
                      },
                    })}
                    className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none bg-surface text-text ${
                      errors.Link ? 'border-destructive' : 'border-border'
                    }`}
                    placeholder={t('linkPlaceholder')}
                    disabled={isSubmitting || generateZoomLinkMutation.isPending}
                  />
                  <button
                    type="button"
                    onClick={handleGenerateZoomLink}
                    disabled={isSubmitting || generateZoomLinkMutation.isPending}
                    className="px-4 py-3 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                  >
                    {generateZoomLinkMutation.isPending ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        {t('generating')}
                      </>
                    ) : (
                      <>
                        <span>🔗</span>
                        {t('generateZoomLink')}
                      </>
                    )}
                  </button>
                </div>
                {errors.Link && <p className="mt-1 text-sm text-destructive">{errors.Link.message}</p>}
                <p className="mt-1 text-xs text-text-muted">{t('linkHelpText')}</p>
              </div>
            </div>
          )}

          {/* Additional Information Section */}
          <div className="space-y-6 hover:border-border border-2 border-transparent p-3 m-3 rounded-xl transition-all duration-300">
            <h3 className="text-lg font-semibold text-text border-b border-brand/30 pb-2">{t('sections.additionalInfo')}</h3>
            <div className="space-y-4">
              {/* Notes */}
              <div>
                <label htmlFor="Notes" className="block text-sm font-medium text-text mb-2">
                  {t('notes')}
                </label>
                <textarea
                  id="Notes"
                  {...register('Notes', {
                    maxLength: { value: 1000, message: t('maxLength1000') },
                  })}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none bg-surface text-text ${
                    errors.Notes ? 'border-destructive' : 'border-border'
                  }`}
                  placeholder={t('notesPlaceholder')}
                  disabled={isSubmitting}
                />
                {errors.Notes && <p className="mt-1 text-sm text-destructive">{errors.Notes.message}</p>}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <FormActions isSubmitting={isSubmitting} isEditMode={isEditMode} onCancel={onClose} cancelRoute="/meetings" translationNamespace="meetingForm" />
        </form>
      </Card>
    </div>
  );
};

export default MeetingForm;
