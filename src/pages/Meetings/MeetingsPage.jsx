import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useBreadcrumbs } from '../../context';
import { useCommittee } from '../../context/CommitteeContext';
import MeetingsHeader from '../../features/Meetings/components/MeetingsHeader';
import MeetingsFilters from '../../features/Meetings/components/MeetingsFilters';
import MeetingsTable from '../../features/Meetings/components/MeetingsTable';
import DeleteDialog from '../../components/ui/DeleteDialog';
import { useToast } from '../../context/ToasterContext';
import { useGetAllMeetingsQuery, useGetAllMeetingTypesQuery, useGetAllMeetingStatusesQuery, useDeleteMeetingMutation } from '../../queries';
import { isApiResponseSuccessful, getApiErrorMessage } from '../../utils/apiResponseHandler';

const MeetingsPage = () => {
  const { t, i18n } = useTranslation('meetings');
  const { t: tCommon } = useTranslation('common');
  const { setBreadcrumbs } = useBreadcrumbs();
  const { selectedCommitteeId } = useCommittee();
  const toast = useToast();

  const [filters, setFilters] = useState({
    searchTerm: '',
    typeFilter: 'all',
    statusFilter: 'all',
    organizerFilter: 'all',
    locationFilter: 'all',
    dateFrom: '',
    dateTo: '',
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState(null);

  // Fetch lookup data
  const { data: meetingTypesData } = useGetAllMeetingTypesQuery({});
  const { data: meetingStatusesData } = useGetAllMeetingStatusesQuery({});

  const meetingTypes = meetingTypesData?.data || [];
  const meetingStatuses = meetingStatusesData?.data || [];

  // Build query parameters for meetings API
  const meetingsQueryParams = useMemo(() => {
    // When location filter is active, fetch more data to account for client-side filtering
    const effectivePageSize = filters.locationFilter !== 'all' ? pageSize * 10 : pageSize;

    const params = {
      CommitteeId: selectedCommitteeId ? parseInt(selectedCommitteeId) : undefined,
      Page: filters.locationFilter !== 'all' ? 1 : page, // Always fetch from page 1 when location filter is active
      PageSize: effectivePageSize,
      SearchTerm: filters.searchTerm || undefined,
      MeetingTypeId: filters.typeFilter !== 'all' ? parseInt(filters.typeFilter) : undefined,
      StatusId: filters.statusFilter !== 'all' ? parseInt(filters.statusFilter) : undefined,
      CreatedByMemberId: filters.organizerFilter !== 'all' ? parseInt(filters.organizerFilter) : undefined,
      DateFrom: filters.dateFrom || undefined,
      DateTo: filters.dateTo || undefined,
    };

    // Remove undefined values
    Object.keys(params).forEach(key => {
      if (params[key] === undefined) {
        delete params[key];
      }
    });

    return params;
  }, [selectedCommitteeId, page, pageSize, filters]);

  const {
    data: meetingsData,
    isLoading: isLoadingMeetings,
    refetch: refetchMeetings,
  } = useGetAllMeetingsQuery(meetingsQueryParams, { enabled: !!selectedCommitteeId });

  const deleteMeetingMutation = useDeleteMeetingMutation();

  const allMeetings = meetingsData?.data || [];
  const apiTotalCount = meetingsData?.totalCount || 0;

  // Apply client-side location filter (online/onsite) since API doesn't support it
  const filteredMeetings = useMemo(() => {
    if (filters.locationFilter === 'all') {
      return allMeetings;
    }

    if (filters.locationFilter === 'online') {
      return allMeetings.filter(meeting => !!meeting.link);
    }

    if (filters.locationFilter === 'onsite') {
      return allMeetings.filter(meeting => !meeting.link);
    }

    return allMeetings;
  }, [allMeetings, filters.locationFilter]);

  // Paginate filtered meetings
  const paginatedMeetings = useMemo(() => {
    if (filters.locationFilter === 'all') {
      // Use API pagination when location filter is not active
      return filteredMeetings;
    }

    // Client-side pagination when location filter is active
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredMeetings.slice(startIndex, endIndex);
  }, [filteredMeetings, filters.locationFilter, page, pageSize]);

  const meetings = paginatedMeetings;
  const totalCount = filters.locationFilter === 'all' ? apiTotalCount : filteredMeetings.length;

  // Extract unique organizers from meetings
  const organizers = useMemo(() => {
    const uniqueOrganizers = new Map();
    allMeetings.forEach(meeting => {
      if (meeting.createdByMemberId && meeting.createdByMember?.userInfo) {
        const memberId = meeting.createdByMemberId;
        if (!uniqueOrganizers.has(memberId)) {
          uniqueOrganizers.set(memberId, {
            id: memberId,
            name: meeting.createdByMember.userInfo.fullName,
          });
        }
      }
    });
    return Array.from(uniqueOrganizers.values());
  }, [allMeetings]);

  useEffect(() => {
    setBreadcrumbs([{ label: t('title'), href: '/meetings' }]);
  }, [setBreadcrumbs, i18n.language, t]);

  useEffect(() => {
    setPage(1);
  }, [filters.searchTerm, filters.typeFilter, filters.statusFilter, filters.organizerFilter, filters.locationFilter, filters.dateFrom, filters.dateTo]);

  const handlePageChange = newPage => {
    setPage(newPage);
  };

  const handlePageSizeChange = e => {
    setPage(1);
    setPageSize(parseInt(e.target.value));
  };

  const handleCreateMeeting = () => {
    // In the future, navigate to create meeting page
    toast.info(t('createMeetingInfo'));
  };

  const handleEdit = meeting => {
    // In the future, navigate to edit meeting page
    toast.info(t('editMeetingInfo'));
  };

  const handleDelete = meeting => {
    setMeetingToDelete(meeting);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!meetingToDelete) return;

    const meetingId = meetingToDelete.id || meetingToDelete.Id;
    const meetingName = meetingToDelete.englishName || meetingToDelete.arabicName || t('meeting');

    deleteMeetingMutation.mutate(
      { Id: parseInt(meetingId) },
      {
        onSuccess: response => {
          if (isApiResponseSuccessful(response)) {
            toast.success(t('deleteSuccess', { title: meetingName }));
            setDeleteDialogOpen(false);
            setMeetingToDelete(null);
            refetchMeetings();
          } else {
            const errorMessage = getApiErrorMessage(response, tCommon('error') || 'An error occurred');
            toast.error(errorMessage);
          }
        },
        onError: error => {
          console.error('Delete error:', error);
          toast.error(error.message || tCommon('error') || 'An error occurred');
        },
      }
    );
  };

  const handleCancel = meeting => {
    // In the future, this will call an API
    toast.info(t('cancelMeetingInfo'));
  };

  const handleStartMeeting = meeting => {
    if (meeting.link) {
      window.open(meeting.link, '_blank');
      toast.success(t('meetingStarted'));
    }
  };

  const handleJoinMeeting = meeting => {
    if (meeting.link) {
      window.open(meeting.link, '_blank');
    }
  };

  const handlePublishMinutes = meeting => {
    // In the future, this will publish minutes
    toast.success(t('minutesPublished'));
  };

  const handleExport = meeting => {
    // In the future, this will export meeting
    toast.info(t('exportInfo'));
  };

  return (
    <div className="space-y-6">
      <MeetingsHeader totalCount={totalCount} onCreateMeeting={handleCreateMeeting} />

      {!selectedCommitteeId ? (
        <div className="text-center py-12">
          <p className="text-text-muted">{t('noCommitteeSelected') || 'Please select a committee first'}</p>
        </div>
      ) : (
        <>
          <MeetingsFilters filters={filters} setFilters={setFilters} types={meetingTypes} statuses={meetingStatuses} organizers={organizers} />

          <MeetingsTable
            meetings={meetings}
            isLoading={isLoadingMeetings}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCancel={handleCancel}
            onStartMeeting={handleStartMeeting}
            onJoinMeeting={handleJoinMeeting}
            onPublishMinutes={handlePublishMinutes}
            onExport={handleExport}
            page={page}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            totalCount={totalCount}
          />

          {/* Delete Dialog */}
          <DeleteDialog
            isOpen={deleteDialogOpen}
            onClose={() => {
              if (!deleteMeetingMutation.isPending) {
                setDeleteDialogOpen(false);
                setMeetingToDelete(null);
              }
            }}
            onConfirm={handleConfirmDelete}
            title={t('deleteDialog.title')}
            message={t('deleteDialog.message', {
              title: meetingToDelete?.englishName || meetingToDelete?.arabicName || '',
            })}
            isLoading={deleteMeetingMutation.isPending}
          />
        </>
      )}
    </div>
  );
};

export default MeetingsPage;
