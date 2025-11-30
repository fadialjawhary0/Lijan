import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircleIcon, Settings, Users } from 'lucide-react';
import Card from '../../../components/ui/Card';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TableSkeleton from '../../../components/skeletons/TableSkeleton';

const ChatArea = ({ conversation, messages, isLoading, onSendMessage, onSendAudio, onManageGroup, currentMemberId, messagesEndRef, onReactionClick }) => {
  const { t } = useTranslation('messages');

  const conversationType = conversation.conversationType || conversation.ConversationType;
  const name = conversation.name || conversation.Name || t('unnamed');
  const isGroup = conversationType === 'group';
  const groupId = conversation.groupId || conversation.GroupId;

  return (
    <Card className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            {isGroup ? <Users className="w-5 h-5 text-primary" /> : <div className="w-5 h-5 rounded-full bg-gray-400" />}
          </div>
          <div>
            <h2 className="font-semibold">{name}</h2>
            {isGroup && (
              <p className="text-xs text-gray-500">
                {conversation.participants?.length || conversation.Participants?.length || 0} {t('members')}
              </p>
            )}
          </div>
        </div>
        {isGroup && (
          <button
            onClick={() => onManageGroup(conversation)}
            className="p-2 rounded-lg hover:bg-[var(--color-background-hover)] transition-colors"
            title={t('manageGroup')}
          >
            <Settings className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="space-y-4">
            <TableSkeleton rows={5} />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">
                <MessageCircleIcon className="w-10 h-10 text-text-muted mx-auto" />
              </div>
              <p>{t('noMessages')}</p>
            </div>
          </div>
        ) : (
          <MessageList messages={messages} currentMemberId={currentMemberId} messagesEndRef={messagesEndRef} onReactionClick={onReactionClick} />
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-[var(--color-border)]">
        <MessageInput onSendMessage={onSendMessage} onSendAudio={onSendAudio} />
      </div>
    </Card>
  );
};

export default ChatArea;
