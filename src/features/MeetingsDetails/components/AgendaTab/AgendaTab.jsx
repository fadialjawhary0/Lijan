import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, GripVertical, Edit, Trash2, User, CheckSquare } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import EmptyState from '../../../../components/ui/EmptyState';
import { List } from 'lucide-react';
import { useGetMeetingAgendaQuery, useDeleteAgendaItemMutation, useUpdateAgendaItemMutation } from '../../../../queries/meetings';
import TableSkeleton from '../../../../components/skeletons/TableSkeleton';
import AgendaItemModal from './AgendaItemModal';
import TaskModal from '../TasksTab/TaskModal';
import DeleteDialog from '../../../../components/ui/DeleteDialog';
import { useToast } from '../../../../context/ToasterContext';
import { isApiResponseSuccessful, getApiErrorMessage } from '../../../../utils/apiResponseHandler';
import { useCommittee } from '../../../../context/CommitteeContext';

const AgendaTab = ({ meeting }) => {
  const { t, i18n } = useTranslation('meetingDetails');
  const { t: tCommon } = useTranslation('common');
  const toast = useToast();
  const isRTL = i18n.dir() === 'rtl';
  const { selectedCommitteeId } = useCommittee();

  const meetingId = meeting?.id || meeting?.Id;
  const meetingCommitteeId = meeting?.committeeId || meeting?.CommitteeId;
  const committeeId = meetingCommitteeId || selectedCommitteeId;
  
  const { data: agendaItemsResponse, isLoading, refetch } = useGetMeetingAgendaQuery(meetingId);
  const agendaItems = agendaItemsResponse?.data || agendaItemsResponse?.Data || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedAgendaItem, setSelectedAgendaItem] = useState(null);
  const [agendaItemToConvert, setAgendaItemToConvert] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [localAgendaItems, setLocalAgendaItems] = useState([]);

  const deleteMutation = useDeleteAgendaItemMutation();
  const updateMutation = useUpdateAgendaItemMutation();

  // Sync local state with API data
  React.useEffect(() => {
    if (agendaItems && agendaItems.length > 0) {
      setLocalAgendaItems([...agendaItems].sort((a, b) => (a.order || 0) - (b.order || 0)));
    } else {
      setLocalAgendaItems([]);
    }
  }, [agendaItems]);

  const handleAdd = () => {
    setSelectedAgendaItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = item => {
    setSelectedAgendaItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = item => {
    setSelectedAgendaItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleConvertToTask = item => {
    setAgendaItemToConvert(item);
    setIsTaskModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAgendaItem) return;

    try {
      const response = await deleteMutation.mutateAsync({
        Id: selectedAgendaItem.id || selectedAgendaItem.Id,
      });

      if (isApiResponseSuccessful(response)) {
        toast.success(t('agenda.deleteSuccess'));
        setIsDeleteDialogOpen(false);
        setSelectedAgendaItem(null);
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

  // Drag and Drop handlers
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target);
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = e => {
    e.target.style.opacity = '1';
    setDraggedItem(null);
  };

  const handleDragOver = e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetItem) => {
    e.preventDefault();
    e.target.style.opacity = '1';

    if (!draggedItem || draggedItem.id === targetItem.id) {
      return;
    }

    const draggedIndex = localAgendaItems.findIndex(item => item.id === draggedItem.id);
    const targetIndex = localAgendaItems.findIndex(item => item.id === targetItem.id);

    if (draggedIndex === -1 || targetIndex === -1) {
      return;
    }

    // Create new ordered array
    const newItems = [...localAgendaItems];
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, removed);

    // Update order values for all items
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      order: index + 1,
    }));

    // Optimistically update UI
    setLocalAgendaItems(updatedItems);

    // Update all items that changed order via API
    try {
      const updatePromises = updatedItems
        .filter((item, index) => {
          const originalItem = localAgendaItems.find(orig => orig.id === item.id);
          return !originalItem || originalItem.order !== index + 1;
        })
        .map(item =>
          updateMutation.mutateAsync({
            Id: item.id || item.Id,
            Sentence: item.sentence,
            MeetingId: parseInt(meetingId),
            Duration: item.duration,
            Order: item.order,
          })
        );

      const responses = await Promise.all(updatePromises);
      const allSuccessful = responses.every(response => isApiResponseSuccessful(response));

      if (!allSuccessful) {
        // Revert on error
        setLocalAgendaItems([...agendaItems].sort((a, b) => (a.order || 0) - (b.order || 0)));
        toast.error(t('agenda.orderUpdateError') || tCommon('error') || 'An error occurred while updating order');
      } else {
        // Refetch to ensure sync
        refetch();
      }
    } catch (error) {
      console.error('Order update error:', error);
      // Revert on error
      setLocalAgendaItems([...agendaItems].sort((a, b) => (a.order || 0) - (b.order || 0)));
      toast.error(error.message || tCommon('error') || 'An error occurred');
    }

    setDraggedItem(null);
  };

  if (isLoading) {
    return <TableSkeleton columnNumbers={1} />;
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text">{t('agenda.title')}</h3>
          <button onClick={handleAdd} className="text-sm text-brand hover:underline cursor-pointer">
            {t('agenda.addItem')}
          </button>
        </div>

        {!localAgendaItems || localAgendaItems.length === 0 ? (
          <EmptyState title={t('agenda.noItems')} message={t('agenda.noItemsDescription')} icon={List} />
        ) : (
          <div className="space-y-4">
            {localAgendaItems.map((item, index) => (
              <div
                key={item.id}
                draggable
                onDragStart={e => handleDragStart(e, item)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={e => handleDrop(e, item)}
                className="border border-border rounded-lg p-4 bg-surface hover:bg-surface-elevated transition-colors cursor-move"
              >
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-2 shrink-0">
                    <GripVertical className="h-5 w-5 text-text-muted cursor-move" />
                    <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                      <span className="text-brand font-semibold text-sm">{item.order || index + 1}</span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-text mb-1">{item.sentence || '-'}</h4>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
                      {item.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {item.duration} {t('agenda.minutes')}
                          </span>
                        </div>
                      )}
                      {item.createdByMemberId && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>
                            {t('agenda.createdBy')}: {item.createdByMember?.userInfo?.fullName || `Member ${item.createdByMemberId}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleConvertToTask(item)}
                      className="flex items-center gap-1 text-brand hover:text-brand/80 transition-colors cursor-pointer"
                      title={t('agenda.convertToTask') || 'Convert to Task'}
                    >
                      <CheckSquare className="h-4 w-4" />
                      <span className="text-sm">{t('agenda.convertToTask') || 'Convert to Task'}</span>
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex items-center gap-1 text-text-muted hover:text-text transition-colors cursor-pointer"
                      title={t('agenda.edit')}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="text-sm">{t('agenda.edit')}</span>
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="flex items-center gap-1 text-destructive hover:text-destructive/80 transition-colors cursor-pointer"
                      title={t('agenda.delete')}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="text-sm">{t('agenda.delete')}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <AgendaItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAgendaItem(null);
          refetch();
        }}
        meetingId={meetingId}
        agendaItem={selectedAgendaItem}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setAgendaItemToConvert(null);
        }}
        meetingId={meetingId}
        task={null}
        agendaItem={agendaItemToConvert}
        committeeId={committeeId}
      />

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          if (!deleteMutation.isPending) {
            setIsDeleteDialogOpen(false);
            setSelectedAgendaItem(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        title={t('agenda.deleteDialog.title')}
        message={t('agenda.deleteDialog.message', {
          sentence: selectedAgendaItem?.sentence || '',
        })}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
};

export default AgendaTab;
