import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import {
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useGetTaskByIdQuery,
  useAddTaskNoteMutation,
  useAddTaskConsultantCommentMutation,
} from '../../../../queries/tasks';
import { useGetAllTaskStatusesQuery } from '../../../../queries/tasks';
import { useGetAllMembersQuery } from '../../../../queries/members';
import { useGetMeetingAgendaQuery } from '../../../../queries/meetings';
import { useToast } from '../../../../context/ToasterContext';
import { isApiResponseSuccessful, getApiErrorMessage } from '../../../../utils/apiResponseHandler';
import { useAuth } from '../../../../context/AuthContext';
import { useCommittee } from '../../../../context/CommitteeContext';
import { formatDateTime } from '../../../../utils/dateUtils';
import { MessageSquare, User, Clock, Plus, Send } from 'lucide-react';

const TaskModal = ({ isOpen, onClose, meetingId, task = null, agendaItem = null, committeeId, onTaskUpdated }) => {
  const { t, i18n } = useTranslation('meetingDetails');
  const { t: tCommon } = useTranslation('common');
  const toast = useToast();
  const isRTL = i18n.dir() === 'rtl';
  const isEditMode = !!task;
  const isConvertingFromAgenda = !!agendaItem && !task;
  const { userId } = useAuth();
  const { selectedCommitteeId } = useCommittee();
  const finalCommitteeId = committeeId || selectedCommitteeId;

  const [newNote, setNewNote] = useState('');
  const [newConsultantComment, setNewConsultantComment] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      englishName: '',
      arabicName: '',
      memberId: '',
      statusId: '',
      agendaItemId: '',
      startDate: '',
      endDate: '',
      percentageComplete: '',
    },
  });

  const percentageComplete = watch('percentageComplete');

  const createMutation = useCreateTaskMutation();
  const updateMutation = useUpdateTaskMutation();
  const addNoteMutation = useAddTaskNoteMutation();
  const addConsultantCommentMutation = useAddTaskConsultantCommentMutation();

  // Fetch full task details when editing to get notes and comments
  const { data: taskDetailsResponse, refetch: refetchTaskDetails } = useGetTaskByIdQuery(task?.id || task?.Id, { enabled: isEditMode && isOpen && !!task });
  const taskDetails = taskDetailsResponse?.data || taskDetailsResponse?.Data || null;

  // Fetch task statuses
  const { data: statusesData } = useGetAllTaskStatusesQuery();
  const taskStatuses = statusesData?.data || statusesData?.Data || [];

  // Fetch committee members for assignment
  const { data: membersData } = useGetAllMembersQuery(
    {
      CommitteeId: finalCommitteeId ? parseInt(finalCommitteeId) : undefined,
      IsActive: true,
      PageSize: 1000,
    },
    { enabled: !!finalCommitteeId }
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

  // Check if current user is a consultant for this task
  const isConsultant = useMemo(() => {
    if (!isEditMode || !task || !currentMemberId) return false;
    const raci = task.raci || task.RACI || taskDetails?.raci || taskDetails?.RACI;
    if (!raci) return false;
    const consulted = raci.consulted || raci.Consulted || [];
    return consulted.some(c => (c.memberId || c.MemberId) === currentMemberId);
  }, [isEditMode, task, currentMemberId, taskDetails]);

  // Check if current user is the assignee
  const isAssignee = useMemo(() => {
    if (!isEditMode || !task || !currentMemberId) return false;
    const taskMemberId = task.memberId || task.MemberId;
    return taskMemberId === currentMemberId;
  }, [isEditMode, task, currentMemberId]);

  // Check if task is completed
  const isTaskCompleted = useMemo(() => {
    if (!task && !taskDetails) return false;
    const statusId = task?.statusId || task?.StatusId || taskDetails?.statusId || taskDetails?.StatusId;
    const completedStatus = taskStatuses.find(s => s.englishName?.toLowerCase().includes('completed'));
    return completedStatus && statusId === completedStatus.id;
  }, [task, taskDetails, taskStatuses]);

  // Get notes and consultant comments from task details
  const taskNotes = useMemo(() => {
    return taskDetails?.notes || taskDetails?.Notes || [];
  }, [taskDetails]);

  const consultantComments = useMemo(() => {
    return taskDetails?.consultantComments || taskDetails?.ConsultantComments || [];
  }, [taskDetails]);

  // Get current user's consultant comment
  const myConsultantComment = useMemo(() => {
    if (!isConsultant || !currentMemberId) return null;
    return consultantComments.find(c => (c.memberId || c.MemberId) === currentMemberId);
  }, [isConsultant, currentMemberId, consultantComments]);

  // Fetch agenda items for createdFrom (only if meetingId exists)
  const { data: agendaData } = useGetMeetingAgendaQuery(meetingId, { enabled: !!meetingId });
  const agendaItems = agendaData?.data || agendaData?.Data || [];

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && task) {
        reset({
          englishName: task.englishName || task.EnglishName || '',
          arabicName: task.arabicName || task.ArabicName || '',
          memberId: task.memberId || task.MemberId || '',
          statusId: task.statusId || task.StatusId || '',
          agendaItemId: task.agendaItemId || task.AgendaItemId || '',
          startDate: task.startDate || task.StartDate ? new Date(task.startDate || task.StartDate).toISOString().split('T')[0] : '',
          endDate: task.endDate || task.EndDate ? new Date(task.endDate || task.EndDate).toISOString().split('T')[0] : '',
          percentageComplete: task.percentageComplete || task.PercentageComplete || '',
        });
        // Load task details to get notes and comments
        refetchTaskDetails();
      } else if (isConvertingFromAgenda && agendaItem) {
        // Pre-fill form when converting from agenda item
        const agendaSentence = agendaItem.sentence || agendaItem.Sentence || '';
        reset({
          englishName: agendaSentence,
          arabicName: agendaSentence,
          memberId: '',
          statusId: taskStatuses.find(s => s.englishName?.toLowerCase().includes('not started'))?.id || '',
          agendaItemId: agendaItem.id || agendaItem.Id || '',
          startDate: '',
          endDate: '',
          percentageComplete: '',
        });
      } else {
        reset({
          englishName: '',
          arabicName: '',
          memberId: '',
          statusId: taskStatuses.find(s => s.englishName?.toLowerCase().includes('not started'))?.id || '',
          agendaItemId: '',
          startDate: '',
          endDate: '',
          percentageComplete: '',
        });
      }
      // Reset note and comment states
      setNewNote('');
      setNewConsultantComment('');
      setIsAddingNote(false);
      setIsAddingComment(false);
    }
  }, [isOpen, isEditMode, task, agendaItem, isConvertingFromAgenda, reset, taskStatuses, refetchTaskDetails]);

  const onSubmit = async data => {
    try {
      const payload = {
        MeetingId: meetingId ? parseInt(meetingId) : null,
        EnglishName: data.englishName || null,
        ArabicName: data.arabicName || null,
        MemberId: data.memberId ? parseInt(data.memberId) : null,
        StatusId: data.statusId ? parseInt(data.statusId) : null,
        AgendaItemId: data.agendaItemId ? parseInt(data.agendaItemId) : null,
        StartDate: data.startDate ? new Date(data.startDate).toISOString() : null,
        EndDate: data.endDate ? new Date(data.endDate).toISOString() : null,
        PercentageComplete: data.percentageComplete ? parseFloat(data.percentageComplete) : null,
        IsApproved: false,
      };

      let response;
      if (isEditMode) {
        payload.Id = task.id || task.Id;
        payload.RequestingMemberId = currentMemberId;
        response = await updateMutation.mutateAsync(payload);
      } else {
        response = await createMutation.mutateAsync(payload);
      }

      if (isApiResponseSuccessful(response)) {
        toast.success(isEditMode ? t('tasks.updateSuccess') || 'Task updated successfully' : t('tasks.createSuccess') || 'Task created successfully');
        if (onTaskUpdated) onTaskUpdated();
        if (!isEditMode) {
          onClose();
          reset();
        } else {
          refetchTaskDetails();
        }
      } else {
        const errorMessage = getApiErrorMessage(response, tCommon('error') || 'An error occurred');
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Task save error:', error);
      toast.error(error.message || tCommon('error') || 'An error occurred');
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !currentMemberId || !task) {
      toast.error(t('tasks.noteRequired') || 'Please enter a note');
      return;
    }

    setIsAddingNote(true);
    try {
      const response = await addNoteMutation.mutateAsync({
        TaskId: task.id || task.Id,
        MemberId: currentMemberId,
        Note: newNote.trim(),
      });

      if (isApiResponseSuccessful(response)) {
        toast.success(t('tasks.noteAdded') || 'Note added successfully');
        setNewNote('');
        refetchTaskDetails();
        if (onTaskUpdated) onTaskUpdated();
      } else {
        const errorMessage = getApiErrorMessage(response, tCommon('error') || 'An error occurred');
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Add note error:', error);
      toast.error(error.message || tCommon('error') || 'An error occurred');
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleAddConsultantComment = async () => {
    if (!newConsultantComment.trim() || !currentMemberId || !task) {
      toast.error(t('tasks.commentRequired') || 'Please enter a comment');
      return;
    }

    if (isTaskCompleted) {
      toast.error(t('tasks.cannotCommentCompleted') || 'Cannot add comments to completed tasks');
      return;
    }

    setIsAddingComment(true);
    try {
      const response = await addConsultantCommentMutation.mutateAsync({
        TaskId: task.id || task.Id,
        MemberId: currentMemberId,
        Comment: newConsultantComment.trim(),
      });

      if (isApiResponseSuccessful(response)) {
        toast.success(
          myConsultantComment ? t('tasks.commentUpdated') || 'Comment updated successfully' : t('tasks.commentAdded') || 'Comment added successfully'
        );
        setNewConsultantComment('');
        refetchTaskDetails();
        if (onTaskUpdated) onTaskUpdated();
      } else {
        const errorMessage = getApiErrorMessage(response, tCommon('error') || 'An error occurred');
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Add consultant comment error:', error);
      toast.error(error.message || tCommon('error') || 'An error occurred');
    } finally {
      setIsAddingComment(false);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const modalTitle = isEditMode
    ? t('tasks.editTask') || 'Edit Task'
    : isConvertingFromAgenda
    ? t('agenda.convertToTask') || 'Convert to Task'
    : t('tasks.addTask') || 'Add Task';

  // Pre-fill consultant comment if editing and user is consultant
  useEffect(() => {
    if (isOpen && isEditMode && isConsultant && myConsultantComment && !newConsultantComment) {
      setNewConsultantComment(myConsultantComment.comment || myConsultantComment.Comment || '');
    }
  }, [isOpen, isEditMode, isConsultant, myConsultantComment]);

  // If user is only a consultant (not assigned to task and not creator), disable form fields
  const isOnlyConsultant =
    isConsultant && currentMemberId !== (task?.memberId || task?.MemberId) && currentMemberId !== (task?.createdByMemberId || task?.CreatedByMemberId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto px-2 ">
        {/* Title Fields - English and Arabic on same row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">
              {isRTL ? t('tasks.table.title') + ' (عربي)' : t('tasks.table.title') + ' (English)'}
            </label>
            <input
              {...register('englishName', {
                required: !isRTL ? t('tasks.titleRequired') || 'English name is required' : false,
              })}
              type="text"
              className={`w-full px-3 py-2 border border-border rounded-lg bg-surface text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                errors.englishName ? 'border-destructive' : ''
              } ${isRTL ? 'text-right' : 'text-left'}`}
              placeholder={isRTL ? 'اسم المهمة (إنجليزي)' : 'Task Title (English)'}
              disabled={isLoading || isOnlyConsultant}
            />
            {errors.englishName && <p className="mt-1 text-sm text-destructive">{errors.englishName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">
              {isRTL ? t('tasks.table.title') + ' (عربي)' : t('tasks.table.title') + ' (Arabic)'}
            </label>
            <input
              {...register('arabicName', {
                required: isRTL ? t('tasks.titleRequired') || 'Arabic name is required' : false,
              })}
              type="text"
              className={`w-full px-3 py-2 border border-border rounded-lg bg-surface text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                errors.arabicName ? 'border-destructive' : ''
              } ${isRTL ? 'text-right' : 'text-left'}`}
              placeholder={isRTL ? 'اسم المهمة (عربي)' : 'Task Title (Arabic)'}
              disabled={isLoading || isOnlyConsultant}
            />
            {errors.arabicName && <p className="mt-1 text-sm text-destructive">{errors.arabicName.message}</p>}
          </div>
        </div>

        {/* Assigned To and Status on same row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">{t('tasks.table.assignedTo')}</label>
            <select
              {...register('memberId')}
              className={`w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent cursor-pointer ${
                errors.memberId ? 'border-destructive' : ''
              } ${isRTL ? 'text-right' : 'text-left'}`}
              disabled={isLoading || !finalCommitteeId || isOnlyConsultant}
            >
              <option value="">{t('tasks.selectMember') || 'Select a member (optional)'}</option>
              {members.map(member => (
                <option key={member.id || member.Id} value={member.id || member.Id}>
                  {member.userInfo?.fullName || member.member?.userInfo?.fullName || `Member ${member.id || member.Id}`}
                </option>
              ))}
            </select>
            {errors.memberId && <p className="mt-1 text-sm text-destructive">{errors.memberId.message}</p>}
            {!finalCommitteeId && <p className="mt-1 text-sm text-text-muted">{t('participants.noCommitteeSelected') || 'Please select a committee first'}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">{t('tasks.table.status')}</label>
            <select
              {...register('statusId', {
                required: t('tasks.statusRequired') || 'Status is required',
              })}
              className={`w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent cursor-pointer ${
                errors.statusId ? 'border-destructive' : ''
              } ${isRTL ? 'text-right' : 'text-left'}`}
              disabled={isLoading || isOnlyConsultant}
            >
              <option value="">{t('tasks.selectStatus') || 'Select status'}</option>
              {taskStatuses.map(status => (
                <option key={status.id || status.Id} value={status.id || status.Id}>
                  {isRTL ? status.arabicName : status.englishName}
                </option>
              ))}
            </select>
            {errors.statusId && <p className="mt-1 text-sm text-destructive">{errors.statusId.message}</p>}
          </div>
        </div>

        {/* Created From and Percentage Complete on same row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">{t('tasks.table.createdFrom')}</label>
            <select
              {...register('agendaItemId')}
              className={`w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                isConvertingFromAgenda ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
              } ${errors.agendaItemId ? 'border-destructive' : ''} ${isRTL ? 'text-right' : 'text-left'}`}
              disabled={isLoading || isConvertingFromAgenda || isOnlyConsultant}
            >
              <option value="">{t('tasks.selectAgendaItem') || 'Select agenda item (optional)'}</option>
              {agendaItems.map(item => (
                <option key={item.id || item.Id} value={item.id || item.Id}>
                  {item.sentence || item.Sentence || `Agenda Item ${item.id || item.Id}`}
                </option>
              ))}
            </select>
            {errors.agendaItemId && <p className="mt-1 text-sm text-destructive">{errors.agendaItemId.message}</p>}
            {isConvertingFromAgenda && (
              <p className="mt-1 text-xs text-text-muted">{t('agenda.convertedFromAgenda') || 'This task is linked to the selected agenda item'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">{t('tasks.percentageComplete')}</label>
            <input
              {...register('percentageComplete', {
                min: { value: 0, message: t('tasks.percentageMin') || 'Percentage must be at least 0' },
                max: { value: 100, message: t('tasks.percentageMax') || 'Percentage must be at most 100' },
              })}
              type="number"
              min="0"
              max="100"
              step="0.01"
              className={`w-full px-3 py-2 border border-border rounded-lg bg-surface text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                errors.percentageComplete ? 'border-destructive' : ''
              } ${isRTL ? 'text-right' : 'text-left'}`}
              placeholder="0-100"
              disabled={isLoading || isOnlyConsultant}
            />
            {errors.percentageComplete && <p className="mt-1 text-sm text-destructive">{errors.percentageComplete.message}</p>}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">{t('tasks.startDate') || 'Start Date'}</label>
            <input
              {...register('startDate')}
              type="date"
              className={`w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                errors.startDate ? 'border-destructive' : ''
              }`}
              disabled={isLoading || isOnlyConsultant}
            />
            {errors.startDate && <p className="mt-1 text-sm text-destructive">{errors.startDate.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">{t('tasks.table.dueDate')}</label>
            <input
              {...register('endDate')}
              type="date"
              className={`w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                errors.endDate ? 'border-destructive' : ''
              }`}
              disabled={isLoading || isOnlyConsultant}
            />
            {errors.endDate && <p className="mt-1 text-sm text-destructive">{errors.endDate.message}</p>}
          </div>
        </div>

        {/* Notes Section - Only show in edit mode and for assignees */}
        {isEditMode && task && isAssignee && (
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-text flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                {t('tasks.notes') || 'Notes'}
              </h3>
            </div>

            {/* Notes List */}
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {taskNotes.length === 0 ? (
                <p className="text-sm text-text-muted italic">{t('tasks.noNotes') || 'No notes yet'}</p>
              ) : (
                taskNotes.map(note => {
                  const noteMember = members.find(m => (m.id || m.Id) === (note.memberId || note.MemberId));
                  const memberName =
                    noteMember?.userInfo?.fullName ||
                    noteMember?.member?.userInfo?.fullName ||
                    note.member?.fullName ||
                    `Member ${note.memberId || note.MemberId}`;
                  return (
                    <div key={note.id || note.Id} className="p-3 bg-surface-elevated rounded-lg border border-border">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-text-muted" />
                          <span className="text-xs font-medium text-text">{memberName}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-text-muted">
                          <Clock className="h-3 w-3" />
                          <span>{formatDateTime(note.createdAt || note.CreatedAt)}</span>
                        </div>
                      </div>
                      <p className="text-sm text-text whitespace-pre-wrap">{note.note || note.Note}</p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add Note Form */}
            <div className="flex gap-2">
              <textarea
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder={t('tasks.addNotePlaceholder') || 'Add a note...'}
                className={`flex-1 px-3 py-2 border border-border rounded-lg bg-surface text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent resize-none ${
                  isRTL ? 'text-right' : 'text-left'
                }`}
                rows={2}
                disabled={isAddingNote || isLoading || !currentMemberId}
              />
              <Button
                type="button"
                onClick={handleAddNote}
                disabled={isAddingNote || isLoading || !newNote.trim() || !currentMemberId}
                variant="primary"
                className="self-end"
              >
                {isAddingNote ? tCommon('saving') : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}

        {/* Consultant Comments Section - Only show to consultants in edit mode */}
        {isEditMode && task && isConsultant && (
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-text flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                {t('tasks.consultantComments') || 'Consultant Comments'}
                <span className="text-xs font-normal text-text-muted">({t('tasks.yourComments') || 'Your comments'})</span>
              </h3>
            </div>

            {/* Consultant Comments List */}
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {consultantComments.length === 0 ? (
                <p className="text-sm text-text-muted italic">{t('tasks.noConsultantComments') || 'No consultant comments yet'}</p>
              ) : (
                consultantComments.map(comment => {
                  const commentMember = members.find(m => (m.id || m.Id) === (comment.memberId || comment.MemberId));
                  const memberName =
                    commentMember?.userInfo?.fullName ||
                    commentMember?.member?.userInfo?.fullName ||
                    comment.member?.fullName ||
                    `Member ${comment.memberId || comment.MemberId}`;
                  const isMyComment = (comment.memberId || comment.MemberId) === currentMemberId;
                  return (
                    <div
                      key={comment.id || comment.Id}
                      className={`p-3 rounded-lg border ${isMyComment ? 'bg-brand/5 border-brand' : 'bg-surface-elevated border-border'}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-text-muted" />
                          <span className="text-xs font-medium text-text">{memberName}</span>
                          {isMyComment && <span className="text-xs text-brand">({t('tasks.yourComment') || 'Your comment'})</span>}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1 text-xs text-text-muted">
                            <Clock className="h-3 w-3" />
                            <span>{formatDateTime(comment.createdAt || comment.CreatedAt)}</span>
                          </div>
                          {comment.lastModified ||
                            (comment.LastModified && (
                              <span className="text-xs text-text-muted italic">
                                {t('tasks.lastModified') || 'Modified'}: {formatDateTime(comment.lastModified || comment.LastModified)}
                              </span>
                            ))}
                        </div>
                      </div>
                      <p className="text-sm text-text whitespace-pre-wrap">{comment.comment || comment.Comment}</p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add/Update Consultant Comment Form */}
            {!isTaskCompleted && (
              <div className="space-y-2">
                <textarea
                  value={newConsultantComment}
                  onChange={e => setNewConsultantComment(e.target.value)}
                  placeholder={
                    myConsultantComment
                      ? t('tasks.updateCommentPlaceholder') || 'Update your comment...'
                      : t('tasks.addCommentPlaceholder') || 'Add your consultant comment...'
                  }
                  className={`w-full px-3 py-2 border border-border rounded-lg bg-surface text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent resize-none ${
                    isRTL ? 'text-right' : 'text-left'
                  }`}
                  rows={3}
                  disabled={isAddingComment || isLoading}
                />
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={handleAddConsultantComment}
                    disabled={isAddingComment || isLoading || !newConsultantComment.trim()}
                    variant="primary"
                  >
                    {isAddingComment
                      ? tCommon('saving')
                      : myConsultantComment
                      ? t('tasks.updateComment') || 'Update Comment'
                      : t('tasks.addComment') || 'Add Comment'}
                  </Button>
                </div>
              </div>
            )}
            {isTaskCompleted && (
              <p className="text-sm text-text-muted italic">{t('tasks.cannotCommentCompleted') || 'Cannot add or update comments on completed tasks'}</p>
            )}
          </div>
        )}

        {/* Only show form submit buttons if user is not only a consultant */}
        {!isOnlyConsultant && (
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading || !finalCommitteeId}>
              {isLoading ? tCommon('saving') : isEditMode ? tCommon('update') : tCommon('create')}
            </Button>
          </div>
        )}

        {/* Show close button only if user is only a consultant */}
        {isOnlyConsultant && (
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="ghost" onClick={onClose}>
              {tCommon('close') || tCommon('cancel')}
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default TaskModal;
