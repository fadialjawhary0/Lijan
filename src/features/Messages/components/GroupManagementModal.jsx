import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Users, UserMinus, UserPlus, Crown } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import { useGetMessageGroupByIdQuery } from '../../../queries/messages';
import { useGetAllMembersQuery } from '../../../queries/members';
import { useAddGroupMemberMutation, useRemoveGroupMemberMutation } from '../../../queries/messages';
import { useToast } from '../../../context/ToasterContext';
import { isApiResponseSuccessful, getApiErrorMessage } from '../../../utils/apiResponseHandler';

const GroupManagementModal = ({ isOpen, onClose, group, onSuccess, currentMemberId }) => {
  const { t } = useTranslation('messages');
  const toast = useToast();
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');

  const groupId = group?.groupId || group?.GroupId || group?.id || group?.Id;
  const committeeId = group?.committeeId || group?.CommitteeId;

  const { data: groupData, refetch: refetchGroup } = useGetMessageGroupByIdQuery(groupId, {
    enabled: !!groupId && isOpen,
  });

  const groupDetails = groupData?.data || groupData?.Data || group;

  const { data: membersData } = useGetAllMembersQuery(
    {
      CommitteeId: committeeId,
      IsActive: true,
      PageSize: 1000,
    },
    { enabled: !!committeeId }
  );

  const allMembers = membersData?.data || membersData?.Data || [];
  const groupMembers = groupDetails?.members || groupDetails?.Members || [];

  const availableMembers = useMemo(() => {
    const groupMemberIds = groupMembers.map(m => m.memberId || m.MemberId);
    return allMembers.filter(m => {
      const memberId = m.id || m.Id;
      return !groupMemberIds.includes(memberId);
    });
  }, [allMembers, groupMembers]);

  const isAdmin = useMemo(() => {
    if (!currentMemberId || !groupMembers.length) return false;
    return groupMembers.some(m => (m.memberId || m.MemberId) === currentMemberId && (m.isAdmin || m.IsAdmin));
  }, [currentMemberId, groupMembers]);

  const addMemberMutation = useAddGroupMemberMutation();
  const removeMemberMutation = useRemoveGroupMemberMutation();

  const handleAddMember = async () => {
    if (!selectedMemberId) {
      toast.error(t('selectMember'));
      return;
    }

    addMemberMutation.mutate(
      {
        MessageGroupId: groupId,
        MemberId: parseInt(selectedMemberId),
        AddedByMemberId: currentMemberId,
      },
      {
        onSuccess: (response) => {
          if (isApiResponseSuccessful(response)) {
            toast.success(t('memberAdded'));
            setSelectedMemberId('');
            setShowAddMember(false);
            refetchGroup();
            onSuccess();
          } else {
            toast.error(getApiErrorMessage(response) || t('failedToAddMember'));
          }
        },
        onError: (error) => {
          toast.error(getApiErrorMessage(error) || t('failedToAddMember'));
        },
      }
    );
  };

  const handleRemoveMember = async (memberId) => {
    if (!isAdmin && memberId !== currentMemberId) {
      toast.error(t('onlyAdminsCanRemove'));
      return;
    }

    removeMemberMutation.mutate(
      {
        MessageGroupId: groupId,
        MemberId: memberId,
        RemovedByMemberId: currentMemberId,
      },
      {
        onSuccess: (response) => {
          if (isApiResponseSuccessful(response)) {
            toast.success(t('memberRemoved'));
            refetchGroup();
            onSuccess();
          } else {
            toast.error(getApiErrorMessage(response) || t('failedToRemoveMember'));
          }
        },
        onError: (error) => {
          toast.error(getApiErrorMessage(error) || t('failedToRemoveMember'));
        },
      }
    );
  };

  const getMemberName = (member) => {
    return member?.member?.fullName || member?.Member?.FullName ||
           member?.member?.username || member?.Member?.Username ||
           t('unknown');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{groupDetails?.englishName || groupDetails?.EnglishName || groupDetails?.arabicName || groupDetails?.ArabicName || t('groupManagement')}</h2>
              <p className="text-sm text-gray-500">{groupMembers.length} {t('members')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--color-background-hover)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Group Members List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">{t('groupMembers')}</h3>
              {isAdmin && (
                <button
                  onClick={() => setShowAddMember(!showAddMember)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  {t('addMember')}
                </button>
              )}
            </div>

            {/* Add Member Form */}
            {showAddMember && isAdmin && (
              <div className="mb-4 p-3 bg-[var(--color-background-hover)] rounded-lg">
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-primary/50 mb-2"
                >
                  <option value="">{t('selectMember')}</option>
                  {availableMembers.map((member) => {
                    const memberId = member.id || member.Id;
                    const userName = member.userInfo?.fullName || member.userInfo?.FullName || member.userInfo?.username || member.userInfo?.Username || t('unknown');
                    return (
                      <option key={memberId} value={memberId}>
                        {userName}
                      </option>
                    );
                  })}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddMember}
                    disabled={!selectedMemberId || addMemberMutation.isPending}
                    className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {addMemberMutation.isPending ? t('adding') : t('add')}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddMember(false);
                      setSelectedMemberId('');
                    }}
                    className="px-3 py-1.5 text-sm rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-background-hover)] transition-colors"
                  >
                    {t('cancel')}
                  </button>
                </div>
              </div>
            )}

            {/* Members List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {groupMembers.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">{t('noMembers')}</p>
              ) : (
                groupMembers.map((member) => {
                  const memberId = member.memberId || member.MemberId;
                  const isMemberAdmin = member.isAdmin || member.IsAdmin;
                  const canRemove = isAdmin || memberId === currentMemberId;
                  const isCurrentUser = memberId === currentMemberId;

                  return (
                    <div
                      key={memberId}
                      className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-background-hover)]"
                    >
                      <div className="flex items-center gap-3">
                        {isMemberAdmin && <Crown className="w-4 h-4 text-yellow-500" />}
                        <div>
                          <p className="text-sm font-medium">
                            {getMemberName(member)}
                            {isCurrentUser && <span className="ml-2 text-xs text-gray-500">({t('you')})</span>}
                          </p>
                          {isMemberAdmin && (
                            <p className="text-xs text-gray-500">{t('admin')}</p>
                          )}
                        </div>
                      </div>
                      {canRemove && !isMemberAdmin && (
                        <button
                          onClick={() => handleRemoveMember(memberId)}
                          disabled={removeMemberMutation.isPending}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                          title={t('removeMember')}
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default GroupManagementModal;

