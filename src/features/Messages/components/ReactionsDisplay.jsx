import React from 'react';
import { useTranslation } from 'react-i18next';

const REACTION_EMOJIS = {
  like: '👍',
  heart: '❤️',
  dislike: '👎',
  smile: '😊',
  sad: '😢',
  crying: '😭',
  laugh: '😂',
  angry: '😠',
  surprised: '😲',
  fire: '🔥',
};

const ReactionsDisplay = ({ reactions = [], currentMemberId, onReactionClick }) => {
  const { t } = useTranslation('messages');

  if (!reactions || reactions.length === 0) {
    return null;
  }

  // Group reactions by type
  const reactionsByType = reactions.reduce((acc, reaction) => {
    const type = reaction.reactionType || reaction.ReactionType;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(reaction);
    return acc;
  }, {});

  const handleReactionClick = reactionType => {
    if (onReactionClick) {
      // Check if current user has this reaction
      const userReaction = reactions.find(r => (r.memberId || r.MemberId) === currentMemberId && (r.reactionType || r.ReactionType) === reactionType);

      if (userReaction) {
        onReactionClick(reactionType, 'remove');
      } else {
        onReactionClick(reactionType, 'add');
      }
    }
  };

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {Object.entries(reactionsByType).map(([type, typeReactions]) => {
        const emoji = REACTION_EMOJIS[type] || '👍';
        const count = typeReactions.length;
        const hasUserReaction = typeReactions.some(r => (r.memberId || r.MemberId) === currentMemberId);

        return (
          <button
            key={type}
            onClick={() => handleReactionClick(type)}
            className={`
              px-2 py-1 rounded-full text-xs flex items-center gap-1
              border transition-colors
              ${
                hasUserReaction
                  ? 'bg-primary/20 border-primary text-primary'
                  : 'bg-[var(--color-background-hover)] border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-background-hover)]'
              }
            `}
            title={typeReactions.map(r => r.member?.fullName || r.Member?.FullName || r.member?.username || r.Member?.Username || t('unknown')).join(', ')}
          >
            <span>{emoji}</span>
            <span>{count}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ReactionsDisplay;
