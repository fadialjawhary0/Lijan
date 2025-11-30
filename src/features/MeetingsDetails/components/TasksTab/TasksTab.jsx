import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, Trash2, MoreVertical, CheckCircle, User, Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import { DropdownMenu, DropdownMenuItem } from '../../../../components/ui/DropdownMenu';
import EmptyState from '../../../../components/ui/EmptyState';
import { CheckSquare } from 'lucide-react';
import { useGetAllTasksQuery, useDeleteTaskMutation, useUpdateTaskMutation, useAssignTaskRACIMutation } from '../../../../queries/tasks';
import { useGetAllTaskStatusesQuery } from '../../../../queries/tasks';
import { useGetMeetingAgendaQuery } from '../../../../queries/meetings';
import { useGetAllMembersQuery } from '../../../../queries/members';
import { formatDate, formatDateTime } from '../../../../utils/dateUtils';
import TableSkeleton from '../../../../components/skeletons/TableSkeleton';
import TaskModal from './TaskModal';
import TaskRACITable from './TaskRACITable';
import TasksFilters from './TasksFilters';
import DeleteDialog from '../../../../components/ui/DeleteDialog';
import { useToast } from '../../../../context/ToasterContext';
import { isApiResponseSuccessful, getApiErrorMessage } from '../../../../utils/apiResponseHandler';
import { useCommittee } from '../../../../context/CommitteeContext';
import { useAuth } from '../../../../context/AuthContext';

const TasksTab = ({ meeting }) => {
  const { t, i18n } = useTranslation('meetingDetails');
  const { t: tCommon } = useTranslation('common');
  const toast = useToast();
  const isRTL = i18n.dir() === 'rtl';
  const { selectedCommitteeId } = useCommittee();
  const { userId } = useAuth();

  const meetingId = meeting?.id || meeting?.Id;
  const meetingCommitteeId = meeting?.committeeId || meeting?.CommitteeId;
  const committeeId = meetingCommitteeId || selectedCommitteeId;

  // Filter states
  const [filters, setFilters] = useState({
    searchTerm: '',
    statusId: '',
    agendaItemId: '',
    memberId: '',
  });

  // Build filters for API
  const apiFilters = useMemo(() => {
    const apiFilterParams = {
      MeetingId: meetingId ? parseInt(meetingId) : undefined,
      PageSize: 1000,
    };

    if (filters.searchTerm?.trim()) {
      apiFilterParams.SearchTerm = filters.searchTerm.trim();
    }
    if (filters.agendaItemId) {
      apiFilterParams.AgendaItemId = parseInt(filters.agendaItemId);
    }
    if (filters.memberId) {
      apiFilterParams.MemberId = parseInt(filters.memberId);
    }

    return apiFilterParams;
  }, [meetingId, filters.searchTerm, filters.agendaItemId, filters.memberId]);

  const { data: tasksResponse, isLoading, refetch } = useGetAllTasksQuery(apiFilters);
  const allTasks = tasksResponse?.data || tasksResponse?.Data || [];

  // Client-side status filter (since StatusId isn't in backend query)
  const tasks = useMemo(() => {
    if (!filters.statusId) return allTasks;
    return allTasks.filter(task => {
      const taskStatusId = task.statusId || task.StatusId;
      return taskStatusId === parseInt(filters.statusId);
    });
  }, [allTasks, filters.statusId]);

  const { data: statusesResponse } = useGetAllTaskStatusesQuery();
  const taskStatuses = statusesResponse?.data || statusesResponse?.Data || [];

  // Fetch agenda items for filter
  const { data: agendaData } = useGetMeetingAgendaQuery(meetingId);
  const agendaItems = agendaData?.data || agendaData?.Data || [];

  // Fetch members for filter
  const { data: membersData } = useGetAllMembersQuery(
    {
      CommitteeId: committeeId ? parseInt(committeeId) : undefined,
      IsActive: true,
      PageSize: 1000,
    },
    { enabled: !!committeeId }
  );
  const members = useMemo(() => {
    return membersData?.data || [];
  }, [membersData]);

  // Get current user's member ID
  const currentMemberId = useMemo(() => {
    if (!membersData?.data || !userId) return null;
    const member = membersData.data.find(m => m.userId === parseInt(userId));
    return member?.id || null;
  }, [membersData, userId]);

  // Check if user is consultant for a task
  const isConsultantForTask = useMemo(() => {
    return (task) => {
      if (!currentMemberId || !task) return false;
      const raci = task.raci || task.RACI;
      if (!raci) return false;
      const consulted = raci.consulted || raci.Consulted || [];
      return consulted.some(c => (c.memberId || c.MemberId) === currentMemberId);
    };
  }, [currentMemberId]);

  // Check if user is assignee for a task
  const isAssigneeForTask = useMemo(() => {
    return (task) => {
      if (!currentMemberId || !task) return false;
      const taskMemberId = task.memberId || task.MemberId;
      return taskMemberId === currentMemberId;
    };
  }, [currentMemberId]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [expandedTasks, setExpandedTasks] = useState(new Set());

  const deleteMutation = useDeleteTaskMutation();
  const updateMutation = useUpdateTaskMutation();

  const getStatusBadge = statusId => {
    const status = taskStatuses.find(s => s.id === statusId || s.Id === statusId);
    if (!status) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-500/10 border border-gray-500 text-gray-500">
          {t('tasks.status.pending')}
        </span>
      );
    }

    const color = status.color || '#6c757d';
    const statusName = isRTL ? status.arabicName : status.englishName;

    return (
      <span
        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border"
        style={{
          backgroundColor: `${color}20`,
          borderColor: color,
          color: color,
        }}
      >
        {statusName}
      </span>
    );
  };

  const handleAdd = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleEdit = task => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleDelete = task => {
    setSelectedTask(task);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTask) return;

    try {
      const taskId = selectedTask.id || selectedTask.Id;
      const response = await deleteMutation.mutateAsync({
        Id: taskId,
        RequestingMemberId: currentMemberId,
      });

      if (isApiResponseSuccessful(response)) {
        toast.success(t('tasks.deleteSuccess') || 'Task deleted successfully');
        setIsDeleteDialogOpen(false);
        setSelectedTask(null);
        refetch();
      } else {
        const errorMessage = getApiErrorMessage(response, tCommon('error') || 'An error occurred');
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message || tCommon('error') || 'An error occurred');
    }
  };

  const handleMarkCompleted = async task => {
    try {
      const completedStatus = taskStatuses.find(s => s.englishName?.toLowerCase().includes('completed') || s.arabicName?.includes('مكتملة'));
      if (!completedStatus) {
        toast.error(t('tasks.statusNotFound') || 'Completed status not found');
        return;
      }

      const taskId = task.id || task.Id;
      const response = await updateMutation.mutateAsync({
        Id: taskId,
        MeetingId: task.meetingId || task.MeetingId,
        AgendaItemId: task.agendaItemId || task.AgendaItemId,
        ArabicName: task.arabicName || task.ArabicName,
        EnglishName: task.englishName || task.EnglishName,
        StartDate: task.startDate || task.StartDate,
        EndDate: task.endDate || task.EndDate,
        MemberId: task.memberId || task.MemberId,
        StatusId: completedStatus.id || completedStatus.Id,
        IsApproved: task.isApproved || task.IsApproved,
        RequestingMemberId: currentMemberId,
      });

      if (isApiResponseSuccessful(response)) {
        const taskName = isRTL ? task.arabicName : task.englishName;
        toast.success(t('tasks.markCompletedSuccess', { title: taskName }) || `Task "${taskName}" has been marked as completed`);
        refetch();
      } else {
        const errorMessage = getApiErrorMessage(response, tCommon('error') || 'An error occurred');
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Mark completed error:', error);
      toast.error(error.message || tCommon('error') || 'An error occurred');
    }
  };

  const isTaskCompleted = task => {
    const statusId = task.statusId || task.StatusId;
    const status = taskStatuses.find(s => s.id === statusId || s.Id === statusId);
    return status?.englishName?.toLowerCase().includes('completed') || status?.arabicName?.includes('مكتملة');
  };

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
        toast.success(t('tasks.raci.removeSuccess') || 'RACI assignment removed successfully');
        refetch();
      } else {
        const errorMessage = getApiErrorMessage(response, tCommon('error') || 'An error occurred');
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Remove RACI error:', error);
      toast.error(error.message || tCommon('error') || 'An error occurred');
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text">{t('tasks.title')}</h3>
        </div>
        <TableSkeleton columnNumbers={9} />
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text">{t('tasks.title')}</h3>
          <button onClick={handleAdd} className="text-sm text-brand hover:underline cursor-pointer">
            {t('tasks.addTask')}
          </button>
        </div>

        {/* Filters and Search */}
        <TasksFilters
          filters={filters}
          setFilters={setFilters}
          taskStatuses={taskStatuses}
          agendaItems={agendaItems}
          members={members}
          committeeId={committeeId}
        />

        {!tasks || tasks.length === 0 ? (
          <EmptyState title={t('tasks.noTasks')} message={t('tasks.noTasksDescription')} icon={CheckSquare} />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-border">
              <thead className="bg-surface-elevated border-b border-border">
                <tr>
                  <th className={`px-4 py-3 text-left font-semibold text-text whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('tasks.table.title')}
                  </th>
                  <th className={`px-4 py-3 text-left font-semibold text-text whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('tasks.table.assignedTo')}
                  </th>
                  <th className={`px-4 py-3 text-left font-semibold text-text whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('tasks.table.dueDate')}
                  </th>
                  <th className={`px-4 py-3 text-left font-semibold text-text whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('tasks.table.status')}
                  </th>
                  <th className={`px-4 py-3 text-left font-semibold text-text whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('tasks.percentageComplete')}
                  </th>
                  <th className={`px-4 py-3 text-left font-semibold text-text whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('tasks.table.createdFrom')}
                  </th>
                  <th className={`px-4 py-3 text-left font-semibold text-text whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('tasks.table.createdBy')}
                  </th>
                  <th className={`px-4 py-3 text-left font-semibold text-text whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('tasks.table.lastUpdated')}
                  </th>
                  <th className={`px-4 py-3 text-left font-semibold text-text whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('tasks.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tasks.map(task => {
                  const taskId = task.id || task.Id;
                  const taskName = isRTL ? task.arabicName : task.englishName;
                  const assignedToName = task.assignedTo?.fullName || task.userInfo?.fullName || task.member?.userInfo?.fullName || '-';
                  const createdFromName = task.agendaItem?.sentence || '-';
                  const createdByName = task.createdBy?.fullName || task.member?.userInfo?.fullName || '-';
                  const completed = isTaskCompleted(task);
                  const isExpanded = expandedTasks.has(taskId);
                  const isAssignee = isAssigneeForTask(task);
                  const isConsultant = isConsultantForTask(task);

                  return (
                    <React.Fragment key={taskId}>
                      <tr className="hover:bg-surface transition-colors cursor-pointer" onClick={() => toggleTaskExpansion(taskId)}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                toggleTaskExpansion(taskId);
                              }}
                              className="p-1 hover:bg-surface-hover rounded transition-colors"
                            >
                              {isExpanded ? <ChevronUp className="h-4 w-4 text-text-muted" /> : <ChevronDown className="h-4 w-4 text-text-muted" />}
                            </button>
                            <p className="font-medium text-text">{taskName || '-'}</p>
                            {isConsultant && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-full">
                                {t('tasks.consultant') || 'Consultant'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-text-muted" />
                            <span className="text-text">{assignedToName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-text-muted">
                            <Calendar className="h-4 w-4" />
                            <span>{task.endDate || task.EndDate ? formatDate(task.endDate || task.EndDate) : '-'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">{getStatusBadge(task.statusId || task.StatusId)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {task.percentageComplete !== null && task.percentageComplete !== undefined ? (
                              <>
                                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-brand transition-all"
                                    style={{ width: `${Math.min(100, Math.max(0, parseFloat(task.percentageComplete) || 0))}%` }}
                                  />
                                </div>
                                <span className="text-xs text-text-muted whitespace-nowrap">
                                  {parseFloat(task.percentageComplete || 0).toFixed(0)}%
                                </span>
                              </>
                            ) : (
                              <span className="text-xs text-text-muted">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-text-muted">{createdFromName}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-text-muted text-xs">{createdByName}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-text-muted text-xs">
                            <Clock className="h-3 w-3" />
                            <span>{task.lastModified || task.LastModified ? formatDateTime(task.lastModified || task.LastModified) : '-'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <DropdownMenu
                            trigger={
                              <button
                                type="button"
                                onClick={e => e.stopPropagation()}
                                className="p-1 hover:bg-surface-hover rounded-lg transition-colors text-text-muted hover:text-text cursor-pointer"
                                aria-label={t('tasks.actions')}
                              >
                                <MoreVertical size={18} className="cursor-pointer" />
                              </button>
                            }
                          >
                            {isAssignee && (
                              <>
                                <DropdownMenuItem onClick={() => handleEdit(task)} className="hover:bg-transparent cursor-pointer">
                                  <Edit size={16} className="text-text-muted" />
                                  <span>{t('tasks.edit')}</span>
                                </DropdownMenuItem>
                                {!completed && (
                                  <DropdownMenuItem onClick={() => handleMarkCompleted(task)} className="hover:bg-transparent cursor-pointer">
                                    <CheckCircle size={16} className="text-text-muted" />
                                    <span>{t('tasks.markCompleted')}</span>
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => handleDelete(task)} className="text-destructive hover:bg-transparent cursor-pointer">
                                  <Trash2 size={16} />
                                  <span>{t('tasks.delete')}</span>
                                </DropdownMenuItem>
                              </>
                            )}
                            {!isAssignee && (
                              <DropdownMenuItem disabled className="text-text-muted cursor-not-allowed">
                                <span>{t('tasks.onlyAssigneeCanEdit') || 'Only assignee can edit'}</span>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenu>
                        </td>
                      </tr>
              {isExpanded && (
                <tr>
                  <td colSpan="9" className="p-0">
                            <TaskRACITable task={task} onRemoveRACI={handleRemoveRACI} committeeId={committeeId} onRACIUpdated={() => refetch()} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

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
                meetingId={meetingId}
                task={selectedTask}
                committeeId={committeeId}
              />

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          if (!deleteMutation.isPending) {
            setIsDeleteDialogOpen(false);
            setSelectedTask(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        title={t('tasks.deleteDialog.title') || 'Delete Task'}
        message={t('tasks.deleteDialog.message', {
          title: selectedTask ? (isRTL ? selectedTask.arabicName : selectedTask.englishName) : '',
        })}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
};

export default TasksTab;
