import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, useFieldArray } from 'react-hook-form';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import { useCreateMeetingVoteMutation, useUpdateMeetingVoteMutation } from '../../../../queries/votes';
import { useGetMeetingAgendaQuery } from '../../../../queries/meetings';
import { useToast } from '../../../../context/ToasterContext';
import { isApiResponseSuccessful, getApiErrorMessage } from '../../../../utils/apiResponseHandler';
import { Plus, X } from 'lucide-react';

const VoteModal = ({ isOpen, onClose, meetingId, vote = null, committeeId }) => {
  const { t, i18n } = useTranslation('meetingDetails');
  const { t: tCommon } = useTranslation('common');
  const toast = useToast();
  const isRTL = i18n.dir() === 'rtl';
  const isEditMode = !!vote;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      question: '',
      agendaItemId: '',
      startDate: '',
      endDate: '',
      choices: [{ text: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'choices',
  });

  const createMutation = useCreateMeetingVoteMutation();
  const updateMutation = useUpdateMeetingVoteMutation();

  // Fetch agenda items
  const { data: agendaData } = useGetMeetingAgendaQuery(meetingId);
  const agendaItems = agendaData?.data || agendaData?.Data || [];

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && vote) {
        const choices = vote.choices || vote.Choices || [];
        reset({
          question: vote.question || vote.Question || '',
          agendaItemId: vote.agendaItemId || vote.AgendaItemId || '',
          startDate: vote.startDate || vote.StartDate ? new Date(vote.startDate || vote.StartDate).toISOString().split('T')[0] : '',
          endDate: vote.endDate || vote.EndDate ? new Date(vote.endDate || vote.EndDate).toISOString().split('T')[0] : '',
          choices: choices.length > 0 ? choices.map(c => ({ text: c.text || c.Text || '' })) : [{ text: '' }],
        });
      } else {
        reset({
          question: '',
          agendaItemId: '',
          startDate: '',
          endDate: '',
          choices: [{ text: '' }],
        });
      }
    }
  }, [isOpen, isEditMode, vote, reset]);

  const onSubmit = async data => {
    try {
      const payload = {
        MeetingId: meetingId ? parseInt(meetingId) : null,
        Question: data.question || null,
        AgendaItemId: data.agendaItemId ? parseInt(data.agendaItemId) : null,
        StartDate: data.startDate ? new Date(data.startDate).toISOString() : null,
        EndDate: data.endDate ? new Date(data.endDate).toISOString() : null,
        CommitteeId: committeeId ? parseInt(committeeId) : null,
        IsStarted: false,
        IsEnded: false,
        Choices: data.choices.filter(c => c.text?.trim()).map(c => c.text.trim()),
      };

      let response;
      if (isEditMode) {
        payload.Id = vote.id || vote.Id;
        response = await updateMutation.mutateAsync(payload);
      } else {
        response = await createMutation.mutateAsync(payload);
      }

      if (isApiResponseSuccessful(response)) {
        toast.success(isEditMode ? t('votes.updateSuccess') || 'Vote updated successfully' : t('votes.createSuccess') || 'Vote created successfully');
        onClose();
        reset();
      } else {
        const errorMessage = getApiErrorMessage(response, tCommon('error') || 'An error occurred');
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Vote save error:', error);
      toast.error(error.message || tCommon('error') || 'An error occurred');
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? t('votes.editVote') || 'Edit Vote' : t('votes.createVote') || 'Create Vote'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">{t('votes.question') || 'Question'}</label>
          <textarea
            {...register('question', {
              required: t('votes.questionRequired') || 'Question is required',
            })}
            rows={3}
            className={`w-full px-3 py-2 border border-border rounded-lg bg-surface text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
              errors.question ? 'border-destructive' : ''
            } ${isRTL ? 'text-right' : 'text-left'}`}
            placeholder={t('votes.questionPlaceholder') || 'Enter the vote question...'}
            disabled={isLoading}
          />
          {errors.question && <p className="mt-1 text-sm text-destructive">{errors.question.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">{t('votes.agendaItem') || 'Agenda Item (Optional)'}</label>
          <select
            {...register('agendaItemId')}
            className={`w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent cursor-pointer ${
              errors.agendaItemId ? 'border-destructive' : ''
            } ${isRTL ? 'text-right' : 'text-left'}`}
            disabled={isLoading}
          >
            <option value="">{t('votes.selectAgendaItem') || 'Select agenda item (optional)'}</option>
            {agendaItems.map(item => (
              <option key={item.id || item.Id} value={item.id || item.Id}>
                {item.sentence || item.Sentence || `Agenda Item ${item.id || item.Id}`}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">{t('votes.startDate') || 'Start Date'}</label>
            <input
              {...register('startDate')}
              type="date"
              className={`w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent cursor-pointer ${
                errors.startDate ? 'border-destructive' : ''
              }`}
              disabled={isLoading}
            />
            {errors.startDate && <p className="mt-1 text-sm text-destructive">{errors.startDate.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">{t('votes.endDate') || 'End Date'}</label>
            <input
              {...register('endDate')}
              type="date"
              className={`w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent cursor-pointer ${
                errors.endDate ? 'border-destructive' : ''
              }`}
              disabled={isLoading}
            />
            {errors.endDate && <p className="mt-1 text-sm text-destructive">{errors.endDate.message}</p>}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-text-muted">{t('votes.choices') || 'Choices'}</label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => append({ text: '' })}
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-1" />
              {t('votes.addChoice') || 'Add Choice'}
            </Button>
          </div>
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <input
                  {...register(`choices.${index}.text`, {
                    required: t('votes.choiceRequired') || 'Choice text is required',
                  })}
                  type="text"
                  className={`flex-1 px-3 py-2 border border-border rounded-lg bg-surface text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                    errors.choices?.[index]?.text ? 'border-destructive' : ''
                  } ${isRTL ? 'text-right' : 'text-left'}`}
                  placeholder={t('votes.choicePlaceholder') || `Choice ${index + 1}`}
                  disabled={isLoading}
                />
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-2 text-destructive hover:text-destructive/80 transition-colors"
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {errors.choices && <p className="mt-1 text-sm text-destructive">{t('votes.atLeastOneChoice') || 'At least one choice is required'}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            {tCommon('cancel') || 'Cancel'}
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? (tCommon('saving') || 'Saving...') : isEditMode ? (tCommon('update') || 'Update') : (tCommon('create') || 'Create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default VoteModal;

