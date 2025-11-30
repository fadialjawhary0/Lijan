import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Trash2, MoreVertical, Play, Square, Edit, User, Clock, FileText, Vote as VoteIcon } from 'lucide-react';
import Card from '../../../components/ui/Card';
import { DropdownMenu, DropdownMenuItem } from '../../../components/ui/DropdownMenu';
import Button from '../../../components/ui/Button';
import { formatDate } from '../../../utils/dateUtils';

const VotingCard = ({ vote, results, onEdit, onDelete, onStartVote, onEndVote, onCastVote, canCastVote, canManage }) => {
  const { t, i18n } = useTranslation('voting');
  const navigate = useNavigate();
  const isRTL = i18n.dir() === 'rtl';
  const [isExpanded, setIsExpanded] = useState(false);

  const voteId = vote.id || vote.Id;
  const question = vote.question || vote.Question || '';
  const isStarted = vote.isStarted || vote.IsStarted;
  const isEnded = vote.isEnded || vote.IsEnded;
  const choices = vote.choices || vote.Choices || [];
  const meetingId = vote.meetingId || vote.MeetingId;
  const meetingName = vote.meeting?.englishName || vote.meeting?.EnglishName || vote.meeting?.arabicName || vote.meeting?.ArabicName || '';
  const agendaItem = vote.agendaItem;

  const getStatusBadge = () => {
    if (isEnded) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 border border-green-500 text-green-500">
          {t('status.completed')}
        </span>
      );
    }
    if (isStarted) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 border border-blue-500 text-blue-500">
          {t('status.inProgress')}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-500/10 border border-gray-500 text-gray-500">
        {t('status.notStarted')}
      </span>
    );
  };

  const handleViewMeeting = e => {
    e.stopPropagation();
    if (meetingId) {
      navigate(`/meetings/${meetingId}`);
    }
  };

  return (
    <Card className="p-4 hover:bg-surface-elevated transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-text">{question}</h4>
            {getStatusBadge()}
          </div>

          {meetingId && (
            <div className="flex items-center gap-1 text-xs text-text-muted mb-2">
              <Clock className="h-3 w-3" />
              <button onClick={handleViewMeeting} className="text-brand hover:underline cursor-pointer">
                {meetingName || `Meeting ${meetingId}`}
              </button>
            </div>
          )}

          {agendaItem && (
            <div className="flex items-center gap-1 text-xs text-text-muted mb-2">
              <FileText className="h-3 w-3" />
              <span>{agendaItem.sentence || agendaItem.Sentence || `Agenda Item ${vote.agendaItemId || vote.AgendaItemId}`}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
            {vote.startDate && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>
                  {t('startDate')}: {formatDate(vote.startDate)}
                </span>
              </div>
            )}
            {vote.endDate && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>
                  {t('endDate')}: {formatDate(vote.endDate)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>
                {results?.totalVotes || 0} {t('votes')}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <VoteIcon className="h-3 w-3" />
              <span>
                {choices.length} {t('choices')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {isStarted && !isEnded && canCastVote && (
            <Button variant="primary" onClick={() => onCastVote(vote)} size="sm" className="cursor-pointer">
              <VoteIcon size={16} />
              {t('castVote')}
            </Button>
          )}

          {canManage && (
            <DropdownMenu
              trigger={
                <button
                  type="button"
                  className="p-1 hover:bg-surface-hover rounded-lg transition-colors text-text-muted hover:text-text cursor-pointer"
                  aria-label={t('actions')}
                >
                  <MoreVertical size={18} className="cursor-pointer" />
                </button>
              }
            >
              {!isStarted && !isEnded && (
                <DropdownMenuItem onClick={() => onEdit(vote)} className="hover:bg-transparent cursor-pointer">
                  <Edit size={16} className="text-text-muted" />
                  <span>{t('edit')}</span>
                </DropdownMenuItem>
              )}
              {!isStarted && (
                <DropdownMenuItem onClick={() => onStartVote(vote)} className="hover:bg-transparent cursor-pointer">
                  <Play size={16} className="text-text-muted" />
                  <span>{t('startVote')}</span>
                </DropdownMenuItem>
              )}
              {isStarted && !isEnded && (
                <DropdownMenuItem onClick={() => onEndVote(vote)} className="hover:bg-transparent cursor-pointer">
                  <Square size={16} className="text-text-muted" />
                  <span>{t('endVote')}</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDelete(vote)} className="text-destructive hover:bg-transparent cursor-pointer">
                <Trash2 size={16} />
                <span>{t('delete')}</span>
              </DropdownMenuItem>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Choices and Results */}
      {(isStarted || isEnded) && results?.choices && results.choices.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <h5 className="text-sm font-medium text-text mb-3">{t('results')}</h5>
          <div className="space-y-2">
            {results.choices.map(choice => {
              const choiceText = choice.text || choice.Text || '';
              const choiceId = choice.id || choice.Id;
              const isWinner = choice.isWinner || false;
              const voteCount = choice.count || choice.voteCount || 0;
              const percentage = choice.percentage || 0;

              return (
                <div
                  key={choiceId}
                  className={`w-full p-3 rounded-lg border-2 transition-all ${
                    isWinner ? 'border-green-500 bg-green-500/10' : 'border-border bg-surface'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className={`text-sm font-medium min-w-0 ${isWinner ? 'text-green-600' : 'text-text'}`}>{choiceText}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-xs whitespace-nowrap ${isWinner ? 'text-green-600 font-semibold' : 'text-text-muted'}`}>
                        {voteCount} ({percentage}%)
                      </span>
                      <div className="w-24 h-2 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div className={`h-full transition-all ${isWinner ? 'bg-green-500' : 'bg-brand'}`} style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Vote Casts List */}
      {isExpanded && results?.casts && results.casts.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <h5 className="text-sm font-medium text-text mb-2">{t('votersList')}</h5>
          <div className="space-y-1">
            {results.casts.map(cast => {
              const memberName = cast.member?.fullName || cast.member?.userInfo?.fullName || `Member ${cast.memberId || cast.MemberId}`;
              const choiceId = cast.choiceId || cast.ChoiceId;
              const selectedChoice = choices.find(c => (c.id || c.Id) === choiceId);
              const choiceText = selectedChoice?.text || selectedChoice?.Text || '-';

              return (
                <div key={cast.id || cast.Id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-text-muted" />
                    <span className="text-text">{memberName}</span>
                  </div>
                  <span className="text-text-muted">{choiceText}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {results?.casts && results.casts.length > 0 && (
        <button onClick={() => setIsExpanded(!isExpanded)} className="mt-3 text-xs text-brand hover:underline cursor-pointer">
          {isExpanded ? t('hideDetails') : t('showDetails')}
        </button>
      )}
    </Card>
  );
};

export default VotingCard;

