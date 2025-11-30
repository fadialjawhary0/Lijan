import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import { useCreateAgendaItemMutation, useUpdateAgendaItemMutation } from '../../../../queries/meetings';
import { useGetAllMembersQuery } from '../../../../queries/members';
import { useToast } from '../../../../context/ToasterContext';
import { isApiResponseSuccessful, getApiErrorMessage } from '../../../../utils/apiResponseHandler';
import { useCommittee } from '../../../../context/CommitteeContext';
import { useAuth } from '../../../../context/AuthContext';

const AgendaItemModal = ({ isOpen, onClose, meetingId, agendaItem = null }) => {
  const { t, i18n } = useTranslation('meetingDetails');
  const { t: tCommon } = useTranslation('common');
  const toast = useToast();
  const { selectedCommitteeId } = useCommittee();
  const { userId } = useAuth();
  const isRTL = i18n.dir() === 'rtl';
  const isEditMode = !!agendaItem;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      sentence: '',
      duration: '',
    },
  });

  const createMutation = useCreateAgendaItemMutation();
  const updateMutation = useUpdateAgendaItemMutation();

  const { data: membersData } = useGetAllMembersQuery(
    {
      CommitteeId: selectedCommitteeId ? parseInt(selectedCommitteeId) : undefined,
      IsActive: true,
      PageSize: 1000,
    },
    { enabled: !!selectedCommitteeId && !!userId }
  );

  const currentMemberId = useMemo(() => {
    if (!membersData?.data || !userId) return null;
    const member = membersData.data.find(m => m.userId === parseInt(userId));
    return member?.id || null;
  }, [membersData, userId]);

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && agendaItem) {
        reset({
          sentence: agendaItem.sentence || '',
          duration: agendaItem.duration?.toString() || '',
        });
      } else {
        reset({
          sentence: '',
          duration: '',
        });
      }
    }
  }, [isOpen, isEditMode, agendaItem, reset]);

  const onSubmit = async data => {
    try {
      const payload = {
        Sentence: data.sentence,
        MeetingId: parseInt(meetingId),
        Duration: data.duration ? parseInt(data.duration) : null,
      };

      let response;
      if (isEditMode) {
        payload.Id = agendaItem.id || agendaItem.Id;
        payload.Order = agendaItem.order || agendaItem.Order || 0;
        response = await updateMutation.mutateAsync(payload);
      } else {
        payload.CreatedByMemberId = currentMemberId ? parseInt(currentMemberId) : null;
        response = await createMutation.mutateAsync(payload);
      }

      if (isApiResponseSuccessful(response)) {
        toast.success(isEditMode ? t('agenda.updateSuccess') : t('agenda.createSuccess'));
        onClose();
        reset();
      } else {
        const errorMessage = getApiErrorMessage(response, tCommon('error') || 'An error occurred');
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Agenda item save error:', error);
      toast.error(error.message || tCommon('error') || 'An error occurred');
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? t('agenda.editItem') : t('agenda.addItem')} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">{t('agenda.sentence')}</label>
          <textarea
            {...register('sentence', {
              required: t('agenda.sentenceRequired') || 'Sentence is required',
            })}
            rows={4}
            className={`w-full px-3 py-2 border border-border rounded-lg bg-surface text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
              errors.sentence ? 'border-destructive' : ''
            } ${isRTL ? 'text-right' : 'text-left'}`}
            placeholder={t('agenda.sentencePlaceholder')}
            disabled={isLoading}
          />
          {errors.sentence && <p className="mt-1 text-sm text-destructive">{errors.sentence.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">{t('agenda.duration') || 'Duration (minutes)'}</label>
          <input
            {...register('duration', {
              min: { value: 1, message: t('agenda.durationMin') || 'Duration must be at least 1 minute' },
              pattern: { value: /^\d+$/, message: t('agenda.durationInvalid') || 'Duration must be a number' },
            })}
            type="number"
            min="1"
            className={`w-full px-3 py-2 border border-border rounded-lg bg-surface text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
              errors.duration ? 'border-destructive' : ''
            } ${isRTL ? 'text-right' : 'text-left'}`}
            placeholder={t('agenda.durationPlaceholder') || 'Enter duration in minutes'}
            disabled={isLoading}
          />
          {errors.duration && <p className="mt-1 text-sm text-destructive">{errors.duration.message}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            {tCommon('cancel')}
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? tCommon('saving') : isEditMode ? tCommon('update') : tCommon('create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AgendaItemModal;
