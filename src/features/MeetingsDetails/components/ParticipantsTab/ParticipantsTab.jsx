import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, User, Trash2 } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import EmptyState from '../../../../components/ui/EmptyState';
import { Users } from 'lucide-react';
import { useGetMeetingParticipantsQuery, useDeleteMeetingMemberMutation } from '../../../../queries/meetings';
import ParticipantModal from './ParticipantModal';
import DeleteDialog from '../../../../components/ui/DeleteDialog';
import { useToast } from '../../../../context/ToasterContext';
import { isApiResponseSuccessful, getApiErrorMessage } from '../../../../utils/apiResponseHandler';

const ParticipantsTab = ({ meeting }) => {
  const { t, i18n } = useTranslation('meetingDetails');
  const { t: tCommon } = useTranslation('common');
  const toast = useToast();
  const isRTL = i18n.dir() === 'rtl';

  const meetingId = meeting?.id || meeting?.Id;
  const { data: participantsResponse, isLoading, refetch } = useGetMeetingParticipantsQuery(meetingId);
  const participants = participantsResponse?.data || participantsResponse?.Data || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);

  const deleteMutation = useDeleteMeetingMemberMutation();

  const getInitials = name => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleAdd = () => {
    setSelectedParticipant(null);
    setIsModalOpen(true);
  };

  const handleDelete = participant => {
    setSelectedParticipant(participant);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedParticipant) return;

    try {
      const response = await deleteMutation.mutateAsync({
        Id: selectedParticipant.id || selectedParticipant.Id,
      });

      if (isApiResponseSuccessful(response)) {
        toast.success(t('participants.deleteSuccess'));
        setIsDeleteDialogOpen(false);
        setSelectedParticipant(null);
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

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="border border-border rounded-lg p-4 bg-surface">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-48 animate-pulse"></div>
                </div>
                <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text">{t('participants.title')}</h3>
          <button onClick={handleAdd} className="text-sm text-brand hover:underline cursor-pointer">
            {t('participants.addParticipant')}
          </button>
        </div>

        {!participants || participants.length === 0 ? (
          <EmptyState title={t('participants.noParticipants')} message={t('participants.noParticipantsDescription')} icon={Users} />
        ) : (
          <div className="space-y-3">
            {participants.map(participant => {
              const memberName = participant.userInfo?.fullName || participant.member?.userInfo?.fullName || participant.memberId?.toString() || '-';
              return (
                <div key={participant.id} className="border border-border rounded-lg p-4 bg-surface hover:bg-surface-elevated transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                      <span className="text-brand font-semibold text-sm">{getInitials(memberName)}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-text">{memberName}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
                        {(participant.userInfo?.email || participant.member?.userInfo?.email) && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span>{participant.userInfo?.email || participant.member?.userInfo?.email}</span>
                          </div>
                        )}
                        {participant.member?.role && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{isRTL ? participant.member.role.arabicName : participant.member.role.englishName}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleDelete(participant)}
                        className="p-1 text-destructive hover:text-destructive/80 transition-colors cursor-pointer"
                        title={t('participants.delete')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <ParticipantModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedParticipant(null);
          refetch();
        }}
        meetingId={meetingId}
      />

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          if (!deleteMutation.isPending) {
            setIsDeleteDialogOpen(false);
            setSelectedParticipant(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        title={t('participants.deleteDialog.title')}
        message={t('participants.deleteDialog.message', {
          name: selectedParticipant?.userInfo?.fullName || selectedParticipant?.member?.userInfo?.fullName || selectedParticipant?.memberId || '',
        })}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
};

export default ParticipantsTab;
