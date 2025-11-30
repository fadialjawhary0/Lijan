import React from 'react';
import { useTranslation } from 'react-i18next';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import AudioPlayer from './AudioPlayer';
import ReactionsDisplay from './ReactionsDisplay';
import ReactionPicker from './ReactionPicker';
import { buildApiUrl } from '../../../utils/apiUrl';

const MessageList = ({ messages, currentMemberId, messagesEndRef, onReactionClick }) => {
  const { t, i18n } = useTranslation('messages');
  const isRTL = i18n.language === 'ar';
  const locale = isRTL ? ar : enUS;

  const formatMessageTime = date => {
    if (!date) return '';
    try {
      const messageDate = new Date(date);
      if (isToday(messageDate)) {
        return format(messageDate, 'HH:mm', { locale });
      } else if (isYesterday(messageDate)) {
        return t('yesterday');
      } else {
        return format(messageDate, 'dd/MM/yyyy HH:mm', { locale });
      }
    } catch {
      return '';
    }
  };

  const groupMessagesByDate = messages => {
    const groups = [];
    let currentGroup = null;

    messages.forEach(message => {
      const messageDate = message.created || message.Created;
      if (!messageDate) return;

      const date = new Date(messageDate);
      const dateKey = format(date, 'yyyy-MM-dd');

      if (!currentGroup || currentGroup.dateKey !== dateKey) {
        if (currentGroup) groups.push(currentGroup);
        currentGroup = {
          dateKey,
          date: date,
          messages: [],
        };
      }

      currentGroup.messages.push(message);
    });

    if (currentGroup) groups.push(currentGroup);
    return groups;
  };

  const formatGroupDate = date => {
    try {
      if (isToday(date)) {
        return t('today');
      } else if (isYesterday(date)) {
        return t('yesterday');
      } else {
        return format(date, 'EEEE, dd MMMM yyyy', { locale });
      }
    } catch {
      return format(date, 'dd/MM/yyyy', { locale });
    }
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="space-y-4">
      {messageGroups.map((group, groupIndex) => (
        <div key={group.dateKey}>
          {/* Date Separator */}
          <div className="flex items-center justify-center my-4">
            <div className="px-3 py-1 bg-[var(--color-background-hover)] rounded-full text-xs text-gray-500">{formatGroupDate(group.date)}</div>
          </div>

          {/* Messages */}
          {group.messages.map((message, messageIndex) => {
            const senderId = message.senderId || message.SenderId;
            const isOwnMessage = senderId === currentMemberId;
            const sender = message.sender || message.Sender;
            const senderName = sender?.fullName || sender?.FullName || sender?.username || sender?.Username || t('unknown');
            const content = message.messageContent || message.MessageContent || '';
            const createdAt = message.created || message.Created;
            const audioFileUrl = message.audioFileUrl || message.AudioFileUrl;
            const audioFileName = message.audioFileName || message.AudioFileName;
            const audioDuration = message.audioDurationSeconds || message.AudioDurationSeconds;
            const hasAudio = !!audioFileUrl;
            const reactions = message.reactions || message.Reactions || [];

            // Build full audio URL
            const fullAudioUrl = audioFileUrl ? buildApiUrl(audioFileUrl) : null;

            return (
              <div key={message.id || message.Id || `${groupIndex}-${messageIndex}`} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2`}>
                <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                  {!isOwnMessage && <div className="text-xs text-gray-500 mb-1 px-2">{senderName}</div>}
                  <div
                    className={`
                      px-4 py-2 rounded-lg
                      ${isOwnMessage ? 'bg-primary text-white rounded-br-sm' : 'bg-[var(--color-background-hover)] text-[var(--color-text)] rounded-bl-sm'}
                    `}
                  >
                    {hasAudio && (
                      <div className="mb-2">
                        <AudioPlayer audioUrl={fullAudioUrl} fileName={audioFileName} duration={audioDuration} isOwnMessage={isOwnMessage} />
                      </div>
                    )}
                    {content && <p className="text-sm whitespace-pre-wrap break-words">{content}</p>}
                    <div className="flex items-center justify-between mt-2">
                      <ReactionsDisplay
                        reactions={reactions}
                        currentMemberId={currentMemberId}
                        onReactionClick={onReactionClick ? (type, action) => onReactionClick(message.id || message.Id, type, action) : undefined}
                      />
                      <div className={`text-xs ${isOwnMessage ? 'text-white/70' : 'text-gray-500'}`}>{formatMessageTime(createdAt)}</div>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <ReactionPicker
                        onSelectReaction={onReactionClick ? (type, action) => onReactionClick(message.id || message.Id, type, action) : undefined}
                        currentMemberId={currentMemberId}
                        messageReactions={reactions}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
