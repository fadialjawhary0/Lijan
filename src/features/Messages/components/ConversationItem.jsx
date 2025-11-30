import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

const ConversationItem = ({ conversation, isSelected, onClick, currentMemberId }) => {
  const { t, i18n } = useTranslation('messages');
  const isRTL = i18n.language === 'ar';
  const locale = isRTL ? ar : enUS;

  const conversationId = conversation.conversationId || conversation.ConversationId;
  const conversationType = conversation.conversationType || conversation.ConversationType;
  const name = conversation.name || conversation.Name || t('unnamed');
  const unreadCount = conversation.unreadCount || conversation.UnreadCount || 0;
  const lastMessage = conversation.lastMessage || conversation.LastMessage;
  const lastMessageAt = conversation.lastMessageAt || conversation.LastMessageAt;
  const participants = conversation.participants || conversation.Participants || [];

  const getDisplayName = () => {
    if (conversationType === 'group') {
      return name;
    }
    // For direct messages, show the other person's name
    return name;
  };

  const getLastMessagePreview = () => {
    if (!lastMessage) return t('noMessages');
    const content = lastMessage.messageContent || lastMessage.MessageContent || '';
    return content.length > 50 ? `${content.substring(0, 50)}...` : content;
  };

  const getTimeAgo = () => {
    if (!lastMessageAt) return '';
    try {
      return formatDistanceToNow(new Date(lastMessageAt), { addSuffix: true, locale });
    } catch {
      return '';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        p-4 cursor-pointer transition-colors hover:bg-[var(--color-background-hover)]
        ${isSelected ? 'bg-primary/10 border-l-4 border-primary' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {conversationType === 'group' ? (
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-6 h-6 text-gray-600" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-sm truncate">{getDisplayName()}</h3>
            {lastMessageAt && (
              <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                {getTimeAgo()}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 truncate flex-1">
              {getLastMessagePreview()}
            </p>
            {unreadCount > 0 && (
              <span className="ml-2 flex-shrink-0 bg-primary text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;

