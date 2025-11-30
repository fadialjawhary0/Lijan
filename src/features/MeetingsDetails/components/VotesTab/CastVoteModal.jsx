import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import { useCreateMeetingVotesCastMutation, useGetAllMeetingVotesCastsQuery } from '../../../../queries/votes';
import { useToast } from '../../../../context/ToasterContext';
import { isApiResponseSuccessful, getApiErrorMessage } from '../../../../utils/apiResponseHandler';
import { CheckCircle } from 'lucide-react';

const CastVoteModal = ({ isOpen, onClose, vote, memberId }) => {
  const { t, i18n } = useTranslation('meetingDetails');
  const { t: tCommon } = useTranslation('common');
  const toast = useToast();
  const isRTL = i18n.dir() === 'rtl';

  const [selectedChoiceId, setSelectedChoiceId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const voteId = vote?.id || vote?.Id;

  // Check if user already voted
  const { data: existingCastResponse } = useGetAllMeetingVotesCastsQuery(
    {
      VoteId: voteId,
      MemberId: memberId,
      PageSize: 1,
    },
    { enabled: !!voteId && !!memberId && isOpen }
  );
  const existingCast = existingCastResponse?.data?.[0] || existingCastResponse?.Data?.[0];
  const hasExistingVote = !!existingCast;

  const createCastMutation = useCreateMeetingVotesCastMutation();

  useEffect(() => {
    if (isOpen && existingCast) {
      setSelectedChoiceId(existingCast.choiceId || existingCast.ChoiceId);
    } else if (isOpen) {
      setSelectedChoiceId(null);
    }
  }, [isOpen, existingCast]);

  const choices = vote?.choices || vote?.Choices || [];
  const question = vote?.question || vote?.Question || '';
  // const voteId = vote?.id || vote?.Id;

  const handleSubmit = async () => {
    if (!selectedChoiceId || !voteId || !memberId) {
      toast.error(t('votes.selectChoice') || 'Please select a choice');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createCastMutation.mutateAsync({
        VoteId: voteId,
        MemberId: memberId,
        ChoiceId: selectedChoiceId,
      });

      if (isApiResponseSuccessful(response)) {
        toast.success(hasExistingVote ? t('votes.updateVote') || 'Vote updated successfully' : t('votes.castSuccess') || 'Vote cast successfully');
        onClose();
        setSelectedChoiceId(null);
      } else {
        const errorMessage = getApiErrorMessage(response, tCommon('error') || 'An error occurred');
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Cast vote error:', error);
      toast.error(error.message || tCommon('error') || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('votes.castVote') || 'Cast Vote'} size="md">
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-text mb-2">{t('votes.question') || 'Question'}</h4>
          <p className="text-sm text-text-muted">{question}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-text mb-3">{t('votes.selectChoice') || 'Select Your Choice'}</h4>
          <div className="space-y-2">
            {choices.map(choice => {
              const choiceId = choice.id || choice.Id;
              const choiceText = choice.text || choice.Text || '';
              const isSelected = selectedChoiceId === choiceId;

              return (
                <button
                  key={choiceId}
                  onClick={() => setSelectedChoiceId(choiceId)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left cursor-pointer ${
                    isSelected ? 'border-brand bg-brand/10 text-brand' : 'border-border bg-surface hover:border-brand/50 text-text'
                  }`}
                  disabled={isSubmitting}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{choiceText}</span>
                    {isSelected && <CheckCircle className="h-5 w-5" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            {tCommon('cancel') || 'Cancel'}
          </Button>
          <Button type="button" variant="primary" onClick={handleSubmit} disabled={isSubmitting || !selectedChoiceId}>
            {isSubmitting ? t('votes.submitting') || 'Submitting...' : t('votes.submitVote') || 'Submit Vote'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CastVoteModal;
