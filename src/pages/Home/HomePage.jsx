import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Plus, Building2, Users } from 'lucide-react';
import { useBreadcrumbs } from '../../context';
import KPISection from '../../features/Home/components/KPISection';
import CouncilsSection from '../../features/Home/components/CouncilsSection';
import StandaloneCommitteesSection from '../../features/Home/components/StandaloneCommitteesSection';
import HomeFilters from '../../features/Home/components/HomeFilters';
import { useToast } from '../../context/ToasterContext';
import Button from '../../components/ui/Button';
import DeleteDialog from '../../components/ui/DeleteDialog';
import { useGetAllCommitteesQuery, useDeleteCommitteeMutation } from '../../queries/committees';
import { useGetAllCouncilsQuery, useDeleteCouncilMutation } from '../../queries/council';
import { useGetAllMeetingsQuery } from '../../queries/meetings';
import { useGetAllTasksQuery } from '../../queries/tasks';
import { useAuth } from '../../context/AuthContext';
import { isApiResponseSuccessful, getApiErrorMessage } from '../../utils/apiResponseHandler';

const HomePage = () => {
  const { setBreadcrumbs } = useBreadcrumbs();
  const { t, i18n } = useTranslation('home');
  const { t: tCommon } = useTranslation('common');
  const toast = useToast();
  const navigate = useNavigate();
  const { userId } = useAuth();

  // State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(null);

  // Pagination
  const [councilsPage, setCouncilsPage] = useState(1);
  const [councilsPageSize] = useState(10);
  const [committeesPage, setCommitteesPage] = useState(1);
  const [committeesPageSize] = useState(12);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    IsActive: undefined,
    DepartmentId: undefined,
    TypeId: undefined,
    CategoryId: undefined,
  });

  // Queries
  const councilsQueryParams = {
    Page: councilsPage,
    PageSize: councilsPageSize,
    SearchTerm: searchTerm || undefined,
    IsActive: filters.IsActive,
    DepartmentId: filters.DepartmentId,
    UserId: userId || undefined,
  };

  const committeesQueryParams = {
    Page: committeesPage,
    PageSize: committeesPageSize * 2,
    SearchTerm: searchTerm || undefined,
    IsActive: filters.IsActive,
    DepartmentId: filters.DepartmentId,
    TypeId: filters.TypeId,
    CategoryId: filters.CategoryId,
    UserId: userId || undefined,
  };

  const {
    data: councilsData,
    isLoading: councilsLoading,
    refetch: refetchCouncils,
  } = useGetAllCouncilsQuery(councilsQueryParams, {
    enabled: !!userId,
  });

  const {
    data: committeesData,
    isLoading: committeesLoading,
    refetch: refetchCommittees,
  } = useGetAllCommitteesQuery(committeesQueryParams, {
    enabled: !!userId,
  });

  const { data: allMeetingsData } = useGetAllMeetingsQuery(
    { Page: 1, PageSize: 1000 }, // Get a large number to calculate stats
    { enabled: !!userId }
  );

  const { data: tasksData } = useGetAllTasksQuery({ Page: 1, PageSize: 1000 }, { enabled: !!userId });

  const deleteCommitteeMutation = useDeleteCommitteeMutation();
  const deleteCouncilMutation = useDeleteCouncilMutation();

  const councils = councilsData?.data || [];
  const allCommittees = committeesData?.data || [];
  const allMeetings = isApiResponseSuccessful(allMeetingsData) ? allMeetingsData?.data?.Data || allMeetingsData?.data || [] : [];
  const allTasks = isApiResponseSuccessful(tasksData) ? tasksData?.data?.Data || tasksData?.data || [] : [];

  const userTasks = useMemo(() => {
    if (!userId || !allTasks.length) return [];
    const userIdNum = parseInt(userId);
    return allTasks.filter(task => {
      const member = task.member || task.Member;
      if (member) {
        const memberUserId = member.userId || member.UserId;
        return memberUserId === userIdNum;
      }
      const assignedTo = task.assignedTo || task.AssignedTo;
      if (assignedTo) {
        const assignedToUserId = assignedTo.userId || assignedTo.UserId;
        return assignedToUserId === userIdNum;
      }
      return false;
    });
  }, [allTasks, userId]);

  const kpis = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const meetingsToday = allMeetings.filter(meeting => {
      const meetingDate = meeting.date || meeting.Date;
      if (!meetingDate) return false;
      const date = new Date(meetingDate);
      date.setHours(0, 0, 0, 0);
      return date >= today && date < tomorrow;
    }).length;

    const totalMeetings = allCommittees.reduce((sum, committee) => {
      return sum + (committee.totalMeetings || committee.TotalMeetings || 0);
    }, 0);

    return {
      totalCommittees: allCommittees.length,
      totalMeetings,
      myTasksCount: userTasks.length,
      meetingsToday,
    };
  }, [allCommittees, allMeetings, userTasks]);

  const enrichedCommittees = useMemo(() => {
    const now = new Date();

    const getMeetingDateTime = meeting => {
      const date = meeting.date || meeting.Date;
      if (!date) return null;

      const meetingDate = new Date(date);
      if (isNaN(meetingDate.getTime())) return null;

      const startTime = meeting.startTime || meeting.StartTime;
      if (startTime) {
        let hours = 0;
        let minutes = 0;

        if (typeof startTime === 'string') {
          const timeParts = startTime.split(':');
          if (timeParts.length >= 2) {
            hours = parseInt(timeParts[0], 10) || 0;
            minutes = parseInt(timeParts[1], 10) || 0;
          }
        } else if (typeof startTime === 'object') {
          hours = startTime.hours || 0;
          minutes = startTime.minutes || 0;
        }

        meetingDate.setHours(hours, minutes, 0, 0);
      } else {
        meetingDate.setHours(0, 0, 0, 0);
      }

      return meetingDate;
    };

    return allCommittees.map(committee => {
      const committeeId = committee.Id || committee.id;

      const committeeMeetings = allMeetings.filter(meeting => {
        const meetingCommitteeId = meeting.committeeId || meeting.CommitteeId;
        return meetingCommitteeId === committeeId;
      });

      const upcomingMeetings = committeeMeetings.filter(meeting => {
        const datetime = getMeetingDateTime(meeting);
        return datetime && datetime > now;
      }).length;

      const completedMeetings = committeeMeetings.filter(meeting => {
        const datetime = getMeetingDateTime(meeting);
        return datetime && datetime < now;
      }).length;

      const upcomingMeetingsList = committeeMeetings
        .map(meeting => ({
          meeting,
          datetime: getMeetingDateTime(meeting),
        }))
        .filter(({ datetime }) => datetime && datetime > now)
        .sort((a, b) => a.datetime - b.datetime);

      const nextMeeting = upcomingMeetingsList.length > 0 ? upcomingMeetingsList[0].meeting : null;

      let formattedNextMeetingDate = null;
      if (nextMeeting) {
        const nextMeetingDateTime = getMeetingDateTime(nextMeeting);
        if (nextMeetingDateTime) {
          formattedNextMeetingDate = nextMeetingDateTime.toISOString();
        }
      }

      return {
        ...committee,
        id: committee.Id || committee.id,
        Id: committee.Id || committee.id,
        englishName: committee.EnglishName || committee.englishName,
        arabicName: committee.ArabicName || committee.arabicName,
        memberCount: committee.TotalMembers || committee.totalMembers || 0,
        upcomingMeetings,
        completedMeetings,
        nextMeetingDate: formattedNextMeetingDate,
        status: committee.IsActive === true || committee.isActive === true ? 'active' : 'archived',
        formationDate: committee.FormationDate || committee.formationDate,
        // Preserve CouncilId for grouping
        CouncilId: committee.CouncilId || committee.councilId,
        councilId: committee.CouncilId || committee.councilId,
      };
    });
  }, [allCommittees, allMeetings]);

  const committeesByCouncilId = useMemo(() => {
    const grouped = new Map();
    enrichedCommittees.forEach(committee => {
      const councilId = committee.CouncilId || committee.councilId;
      if (councilId) {
        if (!grouped.has(councilId)) {
          grouped.set(councilId, []);
        }
        grouped.get(councilId).push(committee);
      }
    });
    return grouped;
  }, [enrichedCommittees]);

  const councilsWithCommittees = useMemo(() => {
    return councils.map(council => {
      const councilId = council.Id || council.id;
      const committeesFromApi = committeesByCouncilId.get(councilId) || [];

      return {
        ...council,
        Committees: committeesFromApi,
        committees: committeesFromApi,
      };
    });
  }, [councils, committeesByCouncilId]);

  const councilCommitteeIds = useMemo(() => {
    const ids = new Set();
    enrichedCommittees.forEach(committee => {
      const councilId = committee.CouncilId || committee.councilId;
      if (councilId) {
        ids.add(committee.id);
      }
    });
    return ids;
  }, [enrichedCommittees]);

  const enrichedStandaloneCommittees = useMemo(() => {
    return enrichedCommittees.filter(committee => !councilCommitteeIds.has(committee.id) && !(committee.CouncilId || committee.councilId));
  }, [enrichedCommittees, councilCommitteeIds]);

  const councilsTotalCount = councilsData?.totalCount || 0;
  const committeesTotalCount = enrichedStandaloneCommittees.length;
  const councilsTotalPages = councilsData?.totalPages || 1;
  const committeesTotalPages = Math.ceil(committeesTotalCount / committeesPageSize) || 1;

  useEffect(() => {
    setBreadcrumbs([{ label: t('breadcrumbs.home'), href: '/' }]);
  }, [setBreadcrumbs, i18n.language, t]);

  // Handlers
  const handleCreateCouncil = () => {
    navigate('/councils/create');
  };

  const handleCreateCommittee = () => {
    navigate('/committees/create');
  };

  const handleEditCouncil = council => {
    navigate(`/councils/update/${council.Id || council.id}`);
  };

  const handleEditCommittee = committee => {
    navigate(`/committees/update/${committee.Id || committee.id}`);
  };

  const handleDeleteCouncil = council => {
    setItemToDelete(council);
    setDeleteType('council');
    setDeleteDialogOpen(true);
  };

  const handleDeleteCommittee = committee => {
    setItemToDelete(committee);
    setDeleteType('committee');
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete || !deleteType) return;

    const itemId = itemToDelete.Id || itemToDelete.id;
    const itemName = itemToDelete.EnglishName || itemToDelete.englishName || itemToDelete.ArabicName || itemToDelete.arabicName || t(deleteType);

    if (deleteType === 'council') {
      deleteCouncilMutation.mutate(
        { Id: parseInt(itemId) },
        {
          onSuccess: response => {
            if (isApiResponseSuccessful(response)) {
              toast.success(t('actions.deleteSuccess', { name: itemName }));
              setDeleteDialogOpen(false);
              setItemToDelete(null);
              setDeleteType(null);
              refetchCouncils();
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
    } else {
      deleteCommitteeMutation.mutate(
        { Id: parseInt(itemId) },
        {
          onSuccess: response => {
            if (isApiResponseSuccessful(response)) {
              toast.success(t('actions.deleteSuccess', { name: itemName }));
              setDeleteDialogOpen(false);
              setItemToDelete(null);
              setDeleteType(null);
              refetchCommittees();
              refetchCouncils();
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
    }
  };

  const handleCloseDeleteDialog = () => {
    if (!deleteCommitteeMutation.isPending && !deleteCouncilMutation.isPending) {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      setDeleteType(null);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCouncilsPage(1);
    setCommitteesPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      IsActive: undefined,
      DepartmentId: undefined,
      TypeId: undefined,
      CategoryId: undefined,
    });
    setSearchTerm('');
    setCouncilsPage(1);
    setCommitteesPage(1);
  };

  const handleSearchChange = value => {
    setSearchTerm(value);
    setCouncilsPage(1);
    setCommitteesPage(1);
  };

  const isLoading = councilsLoading || committeesLoading;
  const isDeleting = deleteCommitteeMutation.isPending || deleteCouncilMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-text mb-2">{t('title')}</h1>
        <p className="text-text-muted">{t('subtitle')}</p>
      </div>

      {/* KPIs */}
      <KPISection kpis={kpis} />

      {/* Filters */}
      <HomeFilters
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      {/* Standalone Committees Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold text-text">
              {t('standaloneCommittees')} ({committeesTotalCount})
            </h2>
          </div>
          <Button variant="primary" onClick={handleCreateCommittee}>
            <Plus className="h-4 w-4" />
            {t('createCommittee')}
          </Button>
        </div>
        <StandaloneCommitteesSection
          committees={enrichedStandaloneCommittees}
          isLoading={committeesLoading}
          onEdit={handleEditCommittee}
          onDelete={handleDeleteCommittee}
          pagination={{
            currentPage: committeesPage,
            totalPages: committeesTotalPages,
          }}
          onPageChange={setCommitteesPage}
        />
      </section>

      {/* Councils Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold text-text">
              {t('councils')} ({councilsTotalCount})
            </h2>
          </div>
          <Button variant="primary" onClick={handleCreateCouncil}>
            <Plus className="h-4 w-4" />
            {t('createCouncil')}
          </Button>
        </div>
        <CouncilsSection
          councils={councilsWithCommittees}
          isLoading={councilsLoading}
          onEdit={handleEditCouncil}
          onDelete={handleDeleteCouncil}
          onCommitteeEdit={handleEditCommittee}
          onCommitteeDelete={handleDeleteCommittee}
          pagination={{
            currentPage: councilsPage,
            totalPages: councilsTotalPages,
          }}
          onPageChange={setCouncilsPage}
        />
      </section>
      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title={tCommon('deleteDialog.title')}
        message={tCommon('deleteDialog.message')}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default HomePage;
