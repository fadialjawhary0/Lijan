import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { X, User, Search } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import { useGetAllMembersQuery } from '../../../queries/members';

const NewMessageModal = ({ isOpen, onClose, onSelectMember, committeeId, currentMemberId }) => {
  const { t } = useTranslation('messages');
  const [searchTerm, setSearchTerm] = useState('');

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
    return members.filter(m => {
      const memberId = m.id || m.Id;
      return memberId !== currentMemberId;
    });
  }, [members, currentMemberId]);

  const filteredMembers = useMemo(() => {
    if (!searchTerm.trim()) return availableMembers;
    const search = searchTerm.toLowerCase();
    return availableMembers.filter(member => {
      const userName = (member.userInfo?.fullName || member.userInfo?.FullName || member.userInfo?.username || member.userInfo?.Username || '').toLowerCase();
      const email = (member.userInfo?.email || member.userInfo?.Email || '').toLowerCase();
      return userName.includes(search) || email.includes(search);
    });
  }, [availableMembers, searchTerm]);

  const handleSelectMember = member => {
    const memberId = member.id || member.Id;
    onSelectMember(memberId, member);
    handleClose();
  };

  const handleClose = () => {
    setSearchTerm('');
    onClose();
  };

  const getMemberName = member => {
    return member.userInfo?.fullName || member.userInfo?.FullName || member.userInfo?.username || member.userInfo?.Username || t('unknown');
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">{t('newMessage')}</h2>
          </div>
          <button onClick={handleClose} className="p-2 rounded-lg hover:bg-[var(--color-background-hover)] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('searchMembers')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* Members List */}
        <div className="max-h-96 overflow-y-auto space-y-2">
          {filteredMembers.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>{t('noMembersFound')}</p>
            </div>
          ) : (
            filteredMembers.map(member => {
              const memberId = member.id || member.Id;
              const userName = getMemberName(member);
              const email = member.userInfo?.email || member.userInfo?.Email || '';

              return (
                <button
                  key={memberId}
                  onClick={() => handleSelectMember(member)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--color-background-hover)] transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{userName}</p>
                    {email && <p className="text-xs text-gray-500 truncate">{email}</p>}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
};

export default NewMessageModal;
