import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import { useCreateMeetingMemberMutation } from '../../../../queries/meetings';
import { useGetAllMembersQuery } from '../../../../queries/members';
import { useToast } from '../../../../context/ToasterContext';
import { isApiResponseSuccessful, getApiErrorMessage } from '../../../../utils/apiResponseHandler';
import { useCommittee } from '../../../../context/CommitteeContext';

const ParticipantModal = ({ isOpen, onClose, meetingId }) => {
  const { t, i18n } = useTranslation('meetingDetails');
  const { t: tCommon } = useTranslation('common');
  const toast = useToast();
  const { selectedCommitteeId } = useCommittee();
  const isRTL = i18n.dir() === 'rtl';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      memberId: '',
    },
  });

  const createMutation = useCreateMeetingMemberMutation();

  // Fetch committee members
  const { data: membersData } = useGetAllMembersQuery(
    {
      CommitteeId: selectedCommitteeId ? parseInt(selectedCommitteeId) : undefined,
      IsActive: true,
      PageSize: 1000, // Get all active members
    },
    { enabled: !!selectedCommitteeId }
  );

  const members = useMemo(() => {
    return membersData?.data || [];
  }, [membersData]);

  useEffect(() => {
    if (isOpen) {
      reset({
        memberId: '',
      });
    }
  }, [isOpen, reset]);

  const onSubmit = async data => {
    try {
      const payload = {
        MemberId: parseInt(data.memberId),
        MeetingId: parseInt(meetingId),
      };

      const response = await createMutation.mutateAsync(payload);

      if (isApiResponseSuccessful(response)) {
        toast.success(t('participants.createSuccess'));
        onClose();
        reset();
      } else {
        const errorMessage = getApiErrorMessage(response, tCommon('error') || 'An error occurred');
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Participant save error:', error);
      toast.error(error.message || tCommon('error') || 'An error occurred');
    }
  };

  const isLoading = createMutation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('participants.addParticipant')} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">{t('participants.member')}</label>
          <select
            {...register('memberId', {
              required: t('participants.memberRequired') || 'Member is required',
            })}
            className={`w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent cursor-pointer ${
              errors.memberId ? 'border-destructive' : ''
            } ${isRTL ? 'text-right' : 'text-left'}`}
            disabled={isLoading || !selectedCommitteeId}
          >
            <option value="">{t('participants.selectMember') || 'Select a member'}</option>
            {members.map(member => (
              <option key={member.id} value={member.id}>
                {member.userInfo?.fullName || `Member ${member.id}`}
              </option>
            ))}
          </select>
          {errors.memberId && <p className="mt-1 text-sm text-destructive">{errors.memberId.message}</p>}
          {!selectedCommitteeId && <p className="mt-1 text-sm text-text-muted">{t('participants.noCommitteeSelected') || 'Please select a committee first'}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            {tCommon('cancel')}
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading || !selectedCommitteeId}>
            {isLoading ? tCommon('saving') : tCommon('create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ParticipantModal;
