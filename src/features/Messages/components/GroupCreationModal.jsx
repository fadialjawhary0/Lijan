import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Users } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import { useGetAllMembersQuery } from '../../../queries/members';
import { useCreateMessageGroupMutation } from '../../../queries/messages';
import { useToast } from '../../../context/ToasterContext';
import { isApiResponseSuccessful, getApiErrorMessage } from '../../../utils/apiResponseHandler';

const GroupCreationModal = ({ isOpen, onClose, onSuccess, committeeId, currentMemberId }) => {
  const { t } = useTranslation('messages');
  const toast = useToast();
  const [groupName, setGroupName] = useState('');
  const [groupNameAr, setGroupNameAr] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);

  const { data: membersData } = useGetAllMembersQuery(
    {
      CommitteeId: committeeId,
      IsActive: true,
      PageSize: 1000,
    },
    { enabled: !!committeeId }
  );

  const members = membersData?.data || membersData?.Data || [];
  const availableMembers = useMemo(() => {
    return members.filter(m => (m.id || m.Id) !== currentMemberId);
  }, [members, currentMemberId]);

  const createGroupMutation = useCreateMessageGroupMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim() && !groupNameAr.trim()) {
      toast.error(t('groupNameRequired'));
      return;
    }

    if (selectedMemberIds.length === 0) {
      toast.error(t('selectAtLeastOneMember'));
      return;
    }

    const groupData = {
      EnglishName: groupName.trim() || null,
      ArabicName: groupNameAr.trim() || null,
      Description: description.trim() || null,
      CommitteeId: committeeId,
      CreatedByMemberId: currentMemberId,
      MemberIds: selectedMemberIds,
    };

    createGroupMutation.mutate(groupData, {
      onSuccess: (response) => {
        if (isApiResponseSuccessful(response)) {
          toast.success(t('groupCreated'));
          handleClose();
          onSuccess();
        } else {
          toast.error(getApiErrorMessage(response) || t('groupCreationFailed'));
        }
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error) || t('groupCreationFailed'));
      },
    });
  };

  const handleClose = () => {
    setGroupName('');
    setGroupNameAr('');
    setDescription('');
    setSelectedMemberIds([]);
    onClose();
  };

  const toggleMemberSelection = (memberId) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">{t('createGroup')}</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-[var(--color-background-hover)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('groupName')} (EN)</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder={t('enterGroupName')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('groupName')} (AR)</label>
            <input
              type="text"
              value={groupNameAr}
              onChange={(e) => setGroupNameAr(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder={t('enterGroupNameAr')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('description')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder={t('enterDescription')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('selectMembers')}</label>
            <div className="max-h-60 overflow-y-auto border border-[var(--color-border)] rounded-lg p-2 space-y-2">
              {availableMembers.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">{t('noMembersAvailable')}</p>
              ) : (
                availableMembers.map((member) => {
                  const memberId = member.id || member.Id;
                  const userName = member.userInfo?.fullName || member.userInfo?.FullName || member.userInfo?.username || member.userInfo?.Username || t('unknown');
                  const isSelected = selectedMemberIds.includes(memberId);

                  return (
                    <label
                      key={memberId}
                      className={`
                        flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors
                        ${isSelected ? 'bg-primary/10' : 'hover:bg-[var(--color-background-hover)]'}
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleMemberSelection(memberId)}
                        className="w-4 h-4 text-primary rounded focus:ring-primary/50"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{userName}</p>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-background-hover)] transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={createGroupMutation.isPending || (!groupName.trim() && !groupNameAr.trim()) || selectedMemberIds.length === 0}
              className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {createGroupMutation.isPending ? t('creating') : t('create')}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default GroupCreationModal;

