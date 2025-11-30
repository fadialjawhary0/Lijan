import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, MoreVertical, CheckCircle, User, Calendar, Clock, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import Card from '../../../components/ui/Card';
import { DropdownMenu, DropdownMenuItem } from '../../../components/ui/DropdownMenu';
import EmptyState from '../../../components/ui/EmptyState';
import { CheckSquare } from 'lucide-react';
import { formatDate, formatDateTime } from '../../../utils/dateUtils';
import TablePaginationRows from '../../../components/ui/TablePaginationRows';
import Pagination from '../../../components/ui/Pagination';
import TableSkeleton from '../../../components/skeletons/TableSkeleton';
import TaskRACITable from '../../../features/MeetingsDetails/components/TasksTab/TaskRACITable';

const TasksTable = ({
  tasks = [],
  isLoading = false,
  onEdit,
  onDelete,
  onMarkCompleted,
  page = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  totalCount = 0,
  taskStatuses = [],
  expandedTasks = new Set(),
  onToggleExpansion,
  onRemoveRACI,
  committeeId,
  onRACIUpdated,
  isConsultantForTask,
  isAssigneeForTask,
}) => {
  const { t, i18n } = useTranslation('tasks');
  const navigate = useNavigate();
  const isRTL = i18n.dir() === 'rtl';

  const totalPages = Math.ceil(totalCount / pageSize);

  const getStatusBadge = statusId => {
    const status = taskStatuses.find(s => s.id === statusId || s.Id === statusId);
    if (!status) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-500/10 border border-gray-500 text-gray-500">
          {t('status.pending')}
        </span>
      );
    }

    const color = status.color || '#6c757d';
    const statusName = isRTL ? status.arabicName || status.ArabicName : status.englishName || status.EnglishName;

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

  const handleViewMeeting = (e, meetingId) => {
    e.stopPropagation();
    if (meetingId) {
      navigate(`/meetings/${meetingId}`);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-card-surface">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-border">
            <thead className="bg-surface-elevated border-b border-border">
              <tr>
                <th className={`px-4 py-3 text-left font-semibold text-text ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('table.title')}
                </th>
                <th className={`px-4 py-3 text-left font-semibold text-text ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('table.assignedTo')}
                </th>
                <th className={`px-4 py-3 text-left font-semibold text-text ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('table.dueDate')}
                </th>
                <th className={`px-4 py-3 text-left font-semibold text-text ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('table.status')}
                </th>
                <th className={`px-4 py-3 text-left font-semibold text-text ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('table.meeting')}
                </th>
                <th className={`px-4 py-3 text-left font-semibold text-text ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('table.agendaItem')}
                </th>
                <th className={`px-4 py-3 text-left font-semibold text-text ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('table.actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              <TableSkeleton columnNumbers={7} />
            </tbody>
          </table>
        </div>
      </Card>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <Card className="p-6">
        <EmptyState title={t('noTasks')} message={t('noTasksDescription')} icon={CheckSquare} />
      </Card>
    );
  }

  return (
    <Card className="bg-card-surface">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-border">
          <thead className="bg-surface-elevated border-b border-border">
            <tr>
              <th className={`px-4 py-3 text-left font-semibold text-text whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('table.title')}
              </th>
              <th className={`px-4 py-3 text-left font-semibold text-text whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('table.assignedTo')}
              </th>
              <th className={`px-4 py-3 text-left font-semibold text-text whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('table.dueDate')}
              </th>
              <th className={`px-4 py-3 text-left font-semibold text-text whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('table.status')}
              </th>
              <th className={`px-4 py-3 text-left font-semibold text-text whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('table.meeting')}
              </th>
              <th className={`px-4 py-3 text-left font-semibold text-text whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('table.agendaItem')}
              </th>
              <th className={`px-4 py-3 text-left font-semibold text-text whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('table.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tasks.map(task => {
              const taskId = task.id || task.Id;
              const taskName = isRTL ? task.arabicName || task.ArabicName : task.englishName || task.EnglishName;
              const assignedToName = task.assignedTo?.fullName || task.userInfo?.fullName || task.member?.userInfo?.fullName || '-';
              const meetingId = task.meetingId || task.MeetingId;
              const meetingName = task.meeting?.englishName || task.meeting?.EnglishName || task.meeting?.arabicName || task.meeting?.ArabicName || '';
              const agendaItemId = task.agendaItemId || task.AgendaItemId;
              const agendaItemSentence = task.agendaItem?.sentence || task.agendaItem?.Sentence || '';
              const isExpanded = expandedTasks.has(taskId);
              const isConsultant = isConsultantForTask?.(task);
              const isAssignee = isAssigneeForTask?.(task);

              return (
                <React.Fragment key={taskId}>
                  <tr className="hover:bg-surface transition-colors cursor-pointer" onClick={() => onToggleExpansion?.(taskId)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {onToggleExpansion && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              onToggleExpansion(taskId);
                            }}
                            className="p-1 hover:bg-surface-hover rounded transition-colors"
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4 text-text-muted" /> : <ChevronDown className="h-4 w-4 text-text-muted" />}
                          </button>
                        )}
                        <p className="font-medium text-text">{taskName || '-'}</p>
                        {isConsultant && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-full">
                            {t('consultant') || 'Consultant'}
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
                    {meetingId ? (
                      <button
                        onClick={e => handleViewMeeting(e, meetingId)}
                        className="text-xs text-brand hover:underline cursor-pointer"
                      >
                        {meetingName || `Meeting ${meetingId}`}
                      </button>
                    ) : (
                      <span className="text-xs text-text-muted">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {agendaItemId && agendaItemSentence ? (
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3 text-text-muted" />
                        <span className="text-xs text-text-muted">{agendaItemSentence}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-text-muted">-</span>
                    )}
                  </td>
                <td className="px-4 py-3">
                  <DropdownMenu
                    trigger={
                      <button
                        type="button"
                        className="p-1 hover:bg-surface-hover rounded-lg transition-colors text-text-muted hover:text-text cursor-pointer"
                        aria-label={t('actions')}
                      >
                        <MoreVertical size={18} className="cursor-pointer" />
                      </button>
                    }
                  >
                    {isAssignee ? (
                      <>
                        {onEdit && (
                          <DropdownMenuItem
                            onClick={e => {
                              e.stopPropagation();
                              onEdit(task);
                            }}
                            className="hover:bg-transparent cursor-pointer"
                          >
                            <Edit size={16} className="text-text-muted" />
                            <span>{t('edit')}</span>
                          </DropdownMenuItem>
                        )}
                        {(() => {
                          const statusId = task.statusId || task.StatusId;
                          const status = taskStatuses.find(s => s.id === statusId || s.Id === statusId);
                          const isCompleted = status?.englishName?.toLowerCase().includes('completed') || status?.arabicName?.includes('مكتملة');
                          return !isCompleted && onMarkCompleted ? (
                            <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                onMarkCompleted(task);
                              }}
                              className="hover:bg-transparent cursor-pointer"
                            >
                              <CheckCircle size={16} className="text-text-muted" />
                              <span>{t('markCompleted')}</span>
                            </DropdownMenuItem>
                          ) : null;
                        })()}
                        {onDelete && (
                          <DropdownMenuItem
                            onClick={e => {
                              e.stopPropagation();
                              onDelete(task);
                            }}
                            className="text-destructive hover:bg-transparent cursor-pointer"
                          >
                            <Trash2 size={16} />
                            <span>{t('delete')}</span>
                          </DropdownMenuItem>
                        )}
                      </>
                    ) : (
                      <DropdownMenuItem disabled className="text-text-muted cursor-not-allowed">
                        <span>{t('onlyAssigneeCanEdit') || 'Only assignee can edit'}</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenu>
                </td>
              </tr>
              {isExpanded && onRemoveRACI && (
                <tr>
                  <td colSpan="7" className="p-0">
                    <TaskRACITable
                      task={task}
                      onRemoveRACI={onRemoveRACI}
                      committeeId={committeeId}
                      onRACIUpdated={onRACIUpdated}
                    />
                  </td>
                </tr>
              )}
            </React.Fragment>
            );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <TablePaginationRows pageSize={pageSize} handlePageSizeChange={onPageSizeChange} />
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      )}
    </Card>
  );
};

export default TasksTable;

