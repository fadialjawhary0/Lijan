import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Smile } from 'lucide-react';

const REACTION_TYPES = [
  { type: 'like', emoji: '👍', label: 'Like' },
  { type: 'heart', emoji: '❤️', label: 'Heart' },
  { type: 'dislike', emoji: '👎', label: 'Dislike' },
  { type: 'smile', emoji: '😊', label: 'Smile' },
  { type: 'sad', emoji: '😢', label: 'Sad' },
  { type: 'crying', emoji: '😭', label: 'Crying' },
  { type: 'laugh', emoji: '😂', label: 'Laugh' },
  { type: 'angry', emoji: '😠', label: 'Angry' },
  { type: 'surprised', emoji: '😲', label: 'Surprised' },
  { type: 'fire', emoji: '🔥', label: 'Fire' },
];

const ReactionPicker = ({ onSelectReaction, currentMemberId, messageReactions = [] }) => {
  const { t } = useTranslation('messages');
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = event => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleReactionClick = reactionType => {
    // Check if current user already has this reaction
    const existingReaction = messageReactions.find(r => (r.memberId || r.MemberId) === currentMemberId && (r.reactionType || r.ReactionType) === reactionType);

    if (existingReaction) {
      // Remove reaction
      onSelectReaction(reactionType, 'remove');
    } else {
      // Add reaction
      onSelectReaction(reactionType, 'add');
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={pickerRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="p-1 rounded hover:bg-[var(--color-background-hover)] transition-colors" title={t('addReaction')}>
        <Smile className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg shadow-lg p-2 z-50 flex gap-1">
          {REACTION_TYPES.map(reaction => {
            const hasReaction = messageReactions.some(
              r => (r.memberId || r.MemberId) === currentMemberId && (r.reactionType || r.ReactionType) === reaction.type
            );

            return (
              <button
                key={reaction.type}
                onClick={() => handleReactionClick(reaction.type)}
                className={`
                  p-2 rounded-lg text-xl hover:bg-[var(--color-background-hover)] transition-colors
                  ${hasReaction ? 'bg-primary/20 ring-2 ring-primary' : ''}
                `}
                title={t(`reactions.${reaction.type}`) || reaction.label}
              >
                {reaction.emoji}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReactionPicker;
