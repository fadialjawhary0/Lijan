import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useBreadcrumbs } from '../../context';
import { useCommittee } from '../../context/CommitteeContext';
import { useAuth } from '../../context/AuthContext';
import {
  useGetConversationsQuery,
  useGetConversationMessagesQuery,
  useCreateMessageMutation,
  useMarkMessagesAsReadMutation,
  useUploadAudioMutation,
  useAddMessageReactionMutation,
  useRemoveMessageReactionMutation,
} from '../../queries/messages';
import { useGetAllMembersQuery } from '../../queries/members';
import ConversationsSidebar from '../../features/Messages/components/ConversationsSidebar';
import ChatArea from '../../features/Messages/components/ChatArea';
import GroupCreationModal from '../../features/Messages/components/GroupCreationModal';
import GroupManagementModal from '../../features/Messages/components/GroupManagementModal';
import NewMessageModal from '../../features/Messages/components/NewMessageModal';
import { useToast } from '../../context/ToasterContext';
import { isApiResponseSuccessful, getApiErrorMessage } from '../../utils/apiResponseHandler';
import { MessageCircleIcon } from 'lucide-react';

const MessagesPage = () => {
  const { t, i18n } = useTranslation('messages');
  const { setBreadcrumbs } = useBreadcrumbs();
  const { selectedCommitteeId } = useCommittee();
  const { userId } = useAuth();
  const toast = useToast();
  const isRTL = i18n.language === 'ar';

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isGroupCreationModalOpen, setIsGroupCreationModalOpen] = useState(false);
  const [isGroupManagementModalOpen, setIsGroupManagementModalOpen] = useState(false);
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setBreadcrumbs([{ label: t('title'), href: '/messages' }]);
  }, [setBreadcrumbs, i18n.language, t]);

  // Fetch members to get current member ID
  const { data: membersData } = useGetAllMembersQuery(
    {
      CommitteeId: selectedCommitteeId ? parseInt(selectedCommitteeId) : undefined,
      IsActive: true,
      PageSize: 1000,
    },
    { enabled: !!selectedCommitteeId }
  );

  const currentMemberId = useMemo(() => {
    if (!membersData?.data || !userId) return null;
    const member = membersData.data.find(m => (m.userId || m.UserId) === parseInt(userId));
    return member?.id || member?.Id || null;
  }, [membersData, userId]);

  // Fetch conversations
  const {
    data: conversationsData,
    isLoading: isLoadingConversations,
    refetch: refetchConversations,
  } = useGetConversationsQuery(
    {
      CommitteeId: selectedCommitteeId ? parseInt(selectedCommitteeId) : undefined,
      MemberId: currentMemberId,
    },
    { enabled: !!selectedCommitteeId && !!currentMemberId, refetchInterval: 30000 } // Poll every 30 seconds
  );

  const conversations = conversationsData?.data || conversationsData?.Data || [];

  // Fetch messages for selected conversation
  const conversationMessagesParams = useMemo(() => {
    if (!selectedConversation || !currentMemberId) return null;

    if (selectedConversation.conversationType === 'group') {
      return {
        GroupId: selectedConversation.groupId || selectedConversation.GroupId,
        CurrentMemberId: currentMemberId,
        Page: 1,
        PageSize: 100,
      };
    } else {
      return {
        OtherMemberId: selectedConversation.otherMemberId || selectedConversation.OtherMemberId,
        CurrentMemberId: currentMemberId,
        Page: 1,
        PageSize: 100,
      };
    }
  }, [selectedConversation, currentMemberId]);

  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    refetch: refetchMessages,
  } = useGetConversationMessagesQuery(
    conversationMessagesParams || {},
    { enabled: !!conversationMessagesParams, refetchInterval: 10000 } // Poll every 10 seconds for active conversation
  );

  const messages = messagesData?.data || messagesData?.Data || [];

  // Mutations
  const createMessageMutation = useCreateMessageMutation();
  const markAsReadMutation = useMarkMessagesAsReadMutation();
  const uploadAudioMutation = useUploadAudioMutation();
  const addReactionMutation = useAddMessageReactionMutation();
  const removeReactionMutation = useRemoveMessageReactionMutation();

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversation && currentMemberId && messages.length > 0) {
      const params =
        selectedConversation.conversationType === 'group'
          ? { GroupId: selectedConversation.groupId || selectedConversation.GroupId, MemberId: currentMemberId }
          : { OtherMemberId: selectedConversation.otherMemberId || selectedConversation.OtherMemberId, MemberId: currentMemberId };

      markAsReadMutation.mutate(params, {
        onSuccess: () => {
          refetchConversations();
        },
      });
    }
  }, [selectedConversation, messages.length]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async messageContent => {
    if (!messageContent?.trim() || !currentMemberId || !selectedConversation) return;

    const messageData = {
      Message: messageContent.trim(),
      SenderId: currentMemberId,
      CommitteeId: selectedCommitteeId ? parseInt(selectedCommitteeId) : undefined,
    };

    if (selectedConversation.conversationType === 'group') {
      messageData.MessageGroupId = selectedConversation.groupId || selectedConversation.GroupId;
    } else {
      messageData.ReceiverId = selectedConversation.otherMemberId || selectedConversation.OtherMemberId;
    }

    createMessageMutation.mutate(messageData, {
      onSuccess: () => {
        refetchMessages();
        refetchConversations();
      },
      onError: error => {
        toast.error(getApiErrorMessage(error) || t('errors.sendFailed'));
      },
    });
  };

  const handleSendAudio = async audioResult => {
    if (!audioResult || !currentMemberId || !selectedConversation) return;

    try {
      // Upload audio file first
      const uploadResult = await uploadAudioMutation.mutateAsync({
        file: audioResult.blob,
        durationSeconds: audioResult.duration,
      });

      const uploadData = uploadResult?.data || uploadResult?.Data || uploadResult;
      if (!uploadData?.filePath) {
        toast.error(t('audioUploadFailed'));
        return;
      }

      // Create message with audio file info
      const messageData = {
        Message: null, // Audio-only message
        SenderId: currentMemberId,
        CommitteeId: selectedCommitteeId ? parseInt(selectedCommitteeId) : undefined,
        AudioFilePath: uploadData.filePath,
        AudioFileName: uploadData.fileName,
        AudioFileSize: uploadData.fileSize,
        AudioDurationSeconds: uploadData.durationSeconds || audioResult.duration,
      };

      if (selectedConversation.conversationType === 'group') {
        messageData.MessageGroupId = selectedConversation.groupId || selectedConversation.GroupId;
      } else {
        messageData.ReceiverId = selectedConversation.otherMemberId || selectedConversation.OtherMemberId;
      }

      createMessageMutation.mutate(messageData, {
        onSuccess: () => {
          refetchMessages();
          refetchConversations();
        },
        onError: error => {
          toast.error(getApiErrorMessage(error) || t('errors.sendFailed'));
        },
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error) || t('audioUploadFailed'));
    }
  };

  const handleCreateGroup = () => {
    setIsGroupCreationModalOpen(true);
  };

  const handleNewMessage = () => {
    setIsNewMessageModalOpen(true);
  };

  const handleSelectMemberForMessage = (memberId, member) => {
    // Create a conversation object for the selected member
    const userName = member.userInfo?.fullName || member.userInfo?.FullName || member.userInfo?.username || member.userInfo?.Username || t('unknown');

    const newConversation = {
      conversationId: `user-${memberId}`,
      conversationType: 'direct',
      name: userName,
      otherMemberId: memberId,
      unreadCount: 0,
      participants: member.userInfo ? [member.userInfo] : [],
    };

    setSelectedConversation(newConversation);
    setIsNewMessageModalOpen(false);
  };

  const handleGroupCreated = () => {
    setIsGroupCreationModalOpen(false);
    refetchConversations();
  };

  const handleManageGroup = group => {
    setSelectedGroup(group);
    setIsGroupManagementModalOpen(true);
  };

  const handleGroupUpdated = () => {
    setIsGroupManagementModalOpen(false);
    setSelectedGroup(null);
    refetchConversations();
    if (selectedConversation?.conversationType === 'group') {
      refetchMessages();
    }
  };

  const handleReactionClick = async (messageId, reactionType, action) => {
    if (!currentMemberId) return;

    try {
      const reactionData = {
        MessageId: messageId,
        MemberId: currentMemberId,
        ReactionType: reactionType,
      };

      if (action === 'add') {
        await addReactionMutation.mutateAsync(reactionData);
      } else {
        await removeReactionMutation.mutateAsync(reactionData);
      }

      refetchMessages();
    } catch (error) {
      toast.error(getApiErrorMessage(error) || t('reactionError'));
    }
  };

  return (
    <div className="flex h-[calc(100vh-200px)] gap-4">
      {/* Conversations Sidebar */}
      <div className={`w-80 shrink-0 ${isRTL ? 'order-2' : 'order-1'}`}>
        <ConversationsSidebar
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={setSelectedConversation}
          onCreateGroup={handleCreateGroup}
          onNewMessage={handleNewMessage}
          currentMemberId={currentMemberId}
          isLoading={isLoadingConversations}
        />
      </div>

      {/* Chat Area */}
      <div className={`flex-1 ${isRTL ? 'order-1' : 'order-2'}`}>
        {selectedConversation ? (
          <ChatArea
            conversation={selectedConversation}
            messages={messages}
            isLoading={isLoadingMessages}
            onSendMessage={handleSendMessage}
            onSendAudio={handleSendAudio}
            onManageGroup={handleManageGroup}
            currentMemberId={currentMemberId}
            messagesEndRef={messagesEndRef}
            onReactionClick={handleReactionClick}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-glass rounded-lg">
            <div className="text-center">
              <div className="text-4xl mb-4">
                <MessageCircleIcon className="w-10 h-10 text-text-muted mx-auto" />
              </div>
              <p className="text-lg text-gray-500">{t('selectConversation')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <NewMessageModal
        isOpen={isNewMessageModalOpen}
        onClose={() => setIsNewMessageModalOpen(false)}
        onSelectMember={handleSelectMemberForMessage}
        committeeId={selectedCommitteeId ? parseInt(selectedCommitteeId) : undefined}
        currentMemberId={currentMemberId}
      />

      <GroupCreationModal
        isOpen={isGroupCreationModalOpen}
        onClose={() => setIsGroupCreationModalOpen(false)}
        onSuccess={handleGroupCreated}
        committeeId={selectedCommitteeId ? parseInt(selectedCommitteeId) : undefined}
        currentMemberId={currentMemberId}
      />

      {selectedGroup && (
        <GroupManagementModal
          isOpen={isGroupManagementModalOpen}
          onClose={() => {
            setIsGroupManagementModalOpen(false);
            setSelectedGroup(null);
          }}
          group={selectedGroup}
          onSuccess={handleGroupUpdated}
          currentMemberId={currentMemberId}
        />
      )}
    </div>
  );
};

export default MessagesPage;
