import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Users, User, MessageSquare } from 'lucide-react';
import Card from '../../../components/ui/Card';
import ConversationItem from './ConversationItem';
import TableSkeleton from '../../../components/skeletons/TableSkeleton';

const ConversationsSidebar = ({ conversations, selectedConversation, onSelectConversation, onCreateGroup, onNewMessage, currentMemberId, isLoading }) => {
  const { t } = useTranslation('messages');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const filteredConversations = conversations.filter(conv => {
    if (!searchTerm.trim()) return true;
    const search = searchTerm.toLowerCase();
    const name = (conv.name || conv.Name || '').toLowerCase();
    const lastMessage = (conv.lastMessage?.messageContent || conv.lastMessage?.MessageContent || '').toLowerCase();
    return name.includes(search) || lastMessage.includes(search);
  });

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{t('conversations')}</h2>
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)} 
              className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors" 
              title={t('newConversation')}
            >
              <Plus className="w-5 h-5" />
            </button>
            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg shadow-lg z-20">
                  <button
                    onClick={() => {
                      onNewMessage();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[var(--color-background-hover)] transition-colors text-left rounded-t-lg"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm">{t('newMessage')}</span>
                  </button>
                  <button
                    onClick={() => {
                      onCreateGroup();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[var(--color-background-hover)] transition-colors text-left rounded-b-lg"
                  >
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{t('createGroup')}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('searchConversations')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4">
            <TableSkeleton rows={5} />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>{t('noConversations')}</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {filteredConversations.map(conversation => (
              <ConversationItem
                key={conversation.conversationId || conversation.ConversationId}
                conversation={conversation}
                isSelected={
                  selectedConversation?.conversationId === conversation.conversationId || selectedConversation?.ConversationId === conversation.ConversationId
                }
                onClick={() => onSelectConversation(conversation)}
                currentMemberId={currentMemberId}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ConversationsSidebar;
