import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useBreadcrumbs } from '../../context';
import { useCommittee } from '../../context/CommitteeContext';
import TasksHeader from '../../features/Tasks/components/TasksHeader';
import TasksFilters from '../../features/Tasks/components/TasksFilters';
import TasksTable from '../../features/Tasks/components/TasksTable';
import DeleteDialog from '../../components/ui/DeleteDialog';
import TaskModal from '../../features/MeetingsDetails/components/TasksTab/TaskModal';
import TaskRACITable from '../../features/MeetingsDetails/components/TasksTab/TaskRACITable';
import { useGetAllTasksQuery, useGetAllTaskStatusesQuery, useDeleteTaskMutation, useAssignTaskRACIMutation } from '../../queries/tasks';
import { useGetAllMeetingsQuery } from '../../queries/meetings';
import { useGetAllMembersQuery } from '../../queries/members';
import { useToast } from '../../context/ToasterContext';
import { isApiResponseSuccessful, getApiErrorMessage } from '../../utils/apiResponseHandler';
import { useAuth } from '../../context/AuthContext';

const TasksPage = () => {
  const { t, i18n } = useTranslation('tasks');
  const navigate = useNavigate();
  const { setBreadcrumbs } = useBreadcrumbs();
  const { selectedCommitteeId } = useCommittee();
  const { userId } = useAuth();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [meetingFilter, setMeetingFilter] = useState('all');
  const [memberFilter, setMemberFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dueDateFrom, setDueDateFrom] = useState('');
  const [dueDateTo, setDueDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [expandedTasks, setExpandedTasks] = useState(new Set());

  useEffect(() => {
    setBreadcrumbs([{ label: t('title'), href: '/tasks' }]);
  }, [setBreadcrumbs, i18n.language, t]);

  // Fetch all meetings for the committee
  const { data: meetingsData } = useGetAllMeetingsQuery(
    {
      CommitteeId: selectedCommitteeId ? parseInt(selectedCommitteeId) : undefined,
      Page: 1,
      PageSize: 1000,
    },
    { enabled: !!selectedCommitteeId }
  );
  const meetings = meetingsData?.data || [];

  // Fetch all members for the committee
  const { data: membersData } = useGetAllMembersQuery(
    {
      CommitteeId: selectedCommitteeId ? parseInt(selectedCommitteeId) : undefined,
      IsActive: true,
      Page: 1,
      PageSize: 1000,
    },
    { enabled: !!selectedCommitteeId }
  );
  const members = membersData?.data || [];

  // Get current user's member ID
  const currentMemberId = useMemo(() => {
    if (!membersData?.data || !userId) return null;
    const member = membersData.data.find(m => m.userId === parseInt(userId));
    return member?.id || member?.Id || null;
  }, [membersData, userId]);

  // Fetch task statuses
  const { data: statusesData } = useGetAllTaskStatusesQuery();
  const taskStatuses = statusesData?.data || statusesData?.Data || [];

  // Build API filters
  const apiFilters = useMemo(() => {
    const filters = {
      CommitteeId: selectedCommitteeId ? parseInt(selectedCommitteeId) : undefined,
      Page: page,
      PageSize: pageSize,
    };

    if (searchTerm?.trim()) {
      filters.SearchTerm = searchTerm.trim();
    }
    if (meetingFilter !== 'all') {
      if (meetingFilter === 'none') {
        // Filter for tasks without meeting - handled client-side
      } else {
        filters.MeetingId = parseInt(meetingFilter);
      }
    }
    if (memberFilter !== 'all') {
      filters.MemberId = parseInt(memberFilter);
    }
    if (statusFilter !== 'all') {
      filters.StatusId = parseInt(statusFilter);
    }
    if (dueDateFrom) {
      filters.EndDateFrom = dueDateFrom;
    }
    if (dueDateTo) {
      filters.EndDateTo = dueDateTo;
    }

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    return filters;
  }, [selectedCommitteeId, page, pageSize, searchTerm, meetingFilter, memberFilter, statusFilter, dueDateFrom, dueDateTo]);

  // Fetch tasks
  const { data: tasksResponse, isLoading, refetch } = useGetAllTasksQuery(apiFilters, {
    enabled: !!selectedCommitteeId,
  });
  const allTasks = tasksResponse?.data || tasksResponse?.Data || [];
  const totalCount = tasksResponse?.totalCount || 0;

  // Client-side filtering for meetingFilter === 'none' and status filter (if StatusId not supported in backend)
  const filteredTasks = useMemo(() => {
    let filtered = [...allTasks];

    // Filter tasks without meeting
    if (meetingFilter === 'none') {
      filtered = filtered.filter(task => !task.meetingId && !task.MeetingId);
    }

    return filtered;
  }, [allTasks, meetingFilter]);

  const deleteMutation = useDeleteTaskMutation();
  const assignRACIMutation = useAssignTaskRACIMutation();

  // Check if user is consultant for a task
  const isConsultantForTask = useMemo(() => {
    return task => {
      if (!currentMemberId || !task) return false;
      const raci = task.raci || task.RACI;
      if (!raci) return false;
      const consulted = raci.consulted || raci.Consulted || [];
      return consulted.some(c => (c.memberId || c.MemberId) === currentMemberId);
    };
  }, [currentMemberId]);

  // Check if user is assignee for a task
  const isAssigneeForTask = useMemo(() => {
    return task => {
      if (!currentMemberId || !task) return false;
      const taskMemberId = task.memberId || task.MemberId;
      return taskMemberId === currentMemberId;
    };
  }, [currentMemberId]);

  const toggleTaskExpansion = taskId => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const handleRemoveRACI = async (task, memberId) => {
    try {
      const raci = task.raci || task.RACI;
      if (!raci) return;

      // Get all existing assignments except the ones for this member
      const existingAssignments = [
        ...(raci.responsible || raci.Responsible || []),
        ...(raci.accountable || raci.Accountable || []),
        ...(raci.consulted || raci.Consulted || []),
        ...(raci.informed || raci.Informed || []),
      ].filter(assignment => {
        const assignmentMemberId = assignment.memberId || assignment.MemberId;
        return assignmentMemberId !== memberId;
      });

      const newAssignments = existingAssignments.map(assignment => ({
        MemberId: assignment.memberId || assignment.MemberId,
        Role: assignment.role || assignment.Role,
      }));

      const taskId = task.id || task.Id;
      const response = await assignRACIMutation.mutateAsync({
        TaskId: taskId,
        RACIAssignments: newAssignments,
      });

      if (isApiResponseSuccessful(response)) {
        toast.success(t('raci.removeSuccess') || 'RACI assignment removed successfully');
        refetch();
      } else {
        const errorMessage = getApiErrorMessage(response, t('error') || 'An error occurred');
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Remove RACI error:', error);
      toast.error(error.message || t('error') || 'An error occurred');
    }
  };

  // Paginate tasks (already paginated by API)
  const paginatedTasks = filteredTasks;

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, meetingFilter, memberFilter, statusFilter, dueDateFrom, dueDateTo]);

  const handlePageChange = newPage => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = e => {
    setPage(1);
    setPageSize(parseInt(e.target.value));
  };

  const handleCreateTask = () => {
    navigate('/tasks/create');
  };

  const handleEdit = task => {
    const taskId = task.id || task.Id;
    navigate(`/tasks/update/${taskId}`);
  };

  const handleDelete = task => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;

    try {
      const taskId = taskToDelete.id || taskToDelete.Id;
      const response = await deleteMutation.mutateAsync({
        Id: taskId,
        RequestingMemberId: currentMemberId,
      });

      if (isApiResponseSuccessful(response)) {
        toast.success(t('deleteSuccess', { title: taskToDelete.englishName || taskToDelete.arabicName || 'Task' }));
        setDeleteDialogOpen(false);
        setTaskToDelete(null);
        refetch();
      } else {
        const errorMessage = getApiErrorMessage(response, t('error') || 'An error occurred');
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message || t('error') || 'An error occurred');
    }
  };

  const handleMarkCompleted = task => {
    // In the future, this will mark task as completed
    toast.success(t('markCompletedSuccess', { title: task.englishName || task.arabicName || 'Task' }));
  };

  return (
    <div className="space-y-6">
      <TasksHeader totalCount={totalCount} onCreateTask={handleCreateTask} />

      <TasksFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        meetingFilter={meetingFilter}
        setMeetingFilter={setMeetingFilter}
        memberFilter={memberFilter}
        setMemberFilter={setMemberFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        dueDateFrom={dueDateFrom}
        setDueDateFrom={setDueDateFrom}
        dueDateTo={dueDateTo}
        setDueDateTo={setDueDateTo}
        meetings={meetings}
        members={members}
        statuses={taskStatuses}
      />

      <TasksTable
        tasks={paginatedTasks}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onMarkCompleted={handleMarkCompleted}
        page={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        totalCount={totalCount}
        taskStatuses={taskStatuses}
        expandedTasks={expandedTasks}
        onToggleExpansion={toggleTaskExpansion}
        onRemoveRACI={handleRemoveRACI}
        committeeId={selectedCommitteeId}
        onRACIUpdated={() => refetch()}
        isConsultantForTask={isConsultantForTask}
        isAssigneeForTask={isAssigneeForTask}
      />

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
          refetch();
        }}
        onTaskUpdated={() => {
          refetch();
        }}
        meetingId={selectedTask?.meetingId || selectedTask?.MeetingId || null}
        task={selectedTask}
        committeeId={selectedCommitteeId}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setTaskToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={t('deleteDialog.title')}
        message={t('deleteDialog.message', {
          title: taskToDelete ? (i18n.language === 'ar' ? taskToDelete.arabicName : taskToDelete.englishName) || '' : '',
        })}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default TasksPage;
