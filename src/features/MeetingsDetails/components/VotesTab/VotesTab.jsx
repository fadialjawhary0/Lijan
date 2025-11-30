import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, MoreVertical, Play, Square, Edit, User, Clock, FileText, Vote as VoteIcon, ChevronDown, ChevronUp } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import { DropdownMenu, DropdownMenuItem } from '../../../../components/ui/DropdownMenu';
import EmptyState from '../../../../components/ui/EmptyState';
import { Vote } from 'lucide-react';
import { formatDate, formatDateTime } from '../../../../utils/dateUtils';
import Button from '../../../../components/ui/Button';
import DeleteDialog from '../../../../components/ui/DeleteDialog';
import VoteModal from './VoteModal';
import CastVoteModal from './CastVoteModal';
import { useGetAllMeetingVotesQuery, useDeleteMeetingVoteMutation, useUpdateMeetingVoteMutation } from '../../../../queries/votes';
import { useGetAllMeetingVotesCastsQuery } from '../../../../queries/votes';
import { useToast } from '../../../../context/ToasterContext';
import { isApiResponseSuccessful, getApiErrorMessage } from '../../../../utils/apiResponseHandler';
import { useCommittee } from '../../../../context/CommitteeContext';
import { useAuth } from '../../../../context/AuthContext';
import { useGetAllMembersQuery } from '../../../../queries/members';
import TableSkeleton from '../../../../components/skeletons/TableSkeleton';

const VotesTab = ({ meeting }) => {
  const { t, i18n } = useTranslation('meetingDetails');
  const { t: tCommon } = useTranslation('common');
  const toast = useToast();
  const isRTL = i18n.dir() === 'rtl';
  const { selectedCommitteeId } = useCommittee();
  const { userId } = useAuth();

  const meetingId = meeting?.id || meeting?.Id;
  const meetingCommitteeId = meeting?.committeeId || meeting?.CommitteeId;
  const committeeId = meetingCommitteeId || selectedCommitteeId;

  const [expandedVoteId, setExpandedVoteId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [voteToDelete, setVoteToDelete] = useState(null);
  const [voteModalOpen, setVoteModalOpen] = useState(false);
  const [castVoteModalOpen, setCastVoteModalOpen] = useState(false);
  const [selectedVote, setSelectedVote] = useState(null);
  const [voteToEdit, setVoteToEdit] = useState(null);

  // Fetch votes for this meeting
  const {
    data: votesResponse,
    isLoading,
    refetch,
  } = useGetAllMeetingVotesQuery(
    {
      MeetingId: meetingId ? parseInt(meetingId) : undefined,
      PageSize: 1000,
    },
    { enabled: !!meetingId }
  );
  const votes = votesResponse?.data || votesResponse?.Data || [];

  // Fetch current user's member ID
  const { data: membersData } = useGetAllMembersQuery(
    {
      CommitteeId: committeeId ? parseInt(committeeId) : undefined,
      IsActive: true,
      PageSize: 1000,
    },
    { enabled: !!committeeId && !!userId }
  );
  const currentMemberId = useMemo(() => {
    if (!membersData?.data || !userId) return null;
    const member = membersData.data.find(m => m.userId === parseInt(userId));
    return member?.id || null;
  }, [membersData, userId]);

  const deleteMutation = useDeleteMeetingVoteMutation();
  const updateMutation = useUpdateMeetingVoteMutation();

  // Fetch all vote casts for this meeting's votes
  const voteIds = useMemo(() => votes.map(v => v.id || v.Id).filter(Boolean), [votes]);
  const { data: allCastsResponse } = useGetAllMeetingVotesCastsQuery(
    {
      PageSize: 1000,
    },
    { enabled: voteIds.length > 0 }
  );
  const allCasts = allCastsResponse?.data || allCastsResponse?.Data || [];

  // Calculate vote results (for in-progress votes, use backend data for ended votes)
  const voteResults = useMemo(() => {
    const results = {};
    votes.forEach(vote => {
      const voteId = vote.id || vote.Id;
      const isEnded = vote.isEnded || vote.IsEnded;
      const casts = allCasts.filter(cast => (cast.voteId || cast.VoteId) === voteId);
      const choices = vote.choices || vote.Choices || [];

      // For ended votes, use backend-provided vote counts if available
      if (isEnded && choices.some(c => c.voteCount !== undefined || c.VoteCount !== undefined)) {
        results[voteId] = {
          casts,
          choiceCounts: {},
          totalVotes: casts.length,
          choices: choices.map(choice => ({
            ...choice,
            count: choice.voteCount || choice.VoteCount || 0,
            percentage: choice.percentage || 0,
            voteCount: choice.voteCount || choice.VoteCount || 0,
            isWinner: choice.isWinner || choice.IsWinner || false,
          })),
        };
      } else {
        // For in-progress votes, calculate from casts
        const choiceCounts = {};
        choices.forEach(choice => {
          const choiceId = choice.id || choice.Id;
          choiceCounts[choiceId] = casts.filter(cast => (cast.choiceId || cast.ChoiceId) === choiceId).length;
        });

        const totalVotes = casts.length;
        results[voteId] = {
          casts,
          choiceCounts,
          totalVotes,
          choices: choices.map(choice => ({
            ...choice,
            count: choiceCounts[choice.id || choice.Id] || 0,
            percentage: totalVotes > 0 ? Math.round(((choiceCounts[choice.id || choice.Id] || 0) / totalVotes) * 100) : 0,
            voteCount: choiceCounts[choice.id || choice.Id] || 0,
            isWinner: false,
          })),
        };
      }
    });
    return results;
  }, [votes, allCasts]);

  const getStatusBadge = vote => {
    const isStarted = vote.isStarted || vote.IsStarted;
    const isEnded = vote.isEnded || vote.IsEnded;

    if (isEnded) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 border border-green-500 text-green-500">
          {t('votes.status.completed') || 'Completed'}
        </span>
      );
    }
    if (isStarted) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 border border-blue-500 text-blue-500">
          {t('votes.status.inProgress') || 'In Progress'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-500/10 border border-gray-500 text-gray-500">
        {t('votes.status.notStarted') || 'Not Started'}
      </span>
    );
  };

  const handleAdd = () => {
    setVoteToEdit(null);
    setVoteModalOpen(true);
  };

  const handleEdit = vote => {
    setVoteToEdit(vote);
    setVoteModalOpen(true);
  };

  const handleDelete = vote => {
    setVoteToDelete(vote);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!voteToDelete) return;

    try {
      const voteId = voteToDelete.id || voteToDelete.Id;
      const response = await deleteMutation.mutateAsync(voteId);

      if (isApiResponseSuccessful(response)) {
        toast.success(t('votes.deleteSuccess') || 'Vote deleted successfully');
        setDeleteDialogOpen(false);
        setVoteToDelete(null);
        refetch();
      } else {
        const errorMessage = getApiErrorMessage(response, tCommon('error') || 'An error occurred');
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message || tCommon('error') || 'An error occurred');
    }
  };

  const handleStartVote = async vote => {
    try {
      const voteId = vote.id || vote.Id;
      const response = await updateMutation.mutateAsync({
        Id: voteId,
        MeetingId: vote.meetingId || vote.MeetingId,
        Question: vote.question || vote.Question,
        StartDate: vote.startDate || vote.StartDate,
        EndDate: vote.endDate || vote.EndDate,
        AgendaItemId: vote.agendaItemId || vote.AgendaItemId,
        CommitteeId: vote.committeeId || vote.CommitteeId,
        IsStarted: true,
        IsEnded: false,
        Choices: (vote.choices || vote.Choices || []).map(c => c.text || c.Text).filter(Boolean),
      });

      if (isApiResponseSuccessful(response)) {
        toast.success(t('votes.startSuccess') || 'Vote started successfully');
        refetch();
      } else {
        const errorMessage = getApiErrorMessage(response, tCommon('error') || 'An error occurred');
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Start vote error:', error);
      toast.error(error.message || tCommon('error') || 'An error occurred');
    }
  };

  const handleEndVote = async vote => {
    try {
      const voteId = vote.id || vote.Id;
      const response = await updateMutation.mutateAsync({
        Id: voteId,
        MeetingId: vote.meetingId || vote.MeetingId,
        Question: vote.question || vote.Question,
        StartDate: vote.startDate || vote.StartDate,
        EndDate: vote.endDate || vote.EndDate,
        AgendaItemId: vote.agendaItemId || vote.AgendaItemId,
        CommitteeId: vote.committeeId || vote.CommitteeId,
        IsStarted: true,
        IsEnded: true,
        Choices: (vote.choices || vote.Choices || []).map(c => c.text || c.Text).filter(Boolean),
      });

      if (isApiResponseSuccessful(response)) {
        toast.success(t('votes.endSuccess') || 'Vote ended successfully');
        refetch();
      } else {
        const errorMessage = getApiErrorMessage(response, tCommon('error') || 'An error occurred');
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('End vote error:', error);
      toast.error(error.message || tCommon('error') || 'An error occurred');
    }
  };

  const handleCastVote = vote => {
    setSelectedVote(vote);
    setCastVoteModalOpen(true);
  };

  const toggleExpand = voteId => {
    setExpandedVoteId(expandedVoteId === voteId ? null : voteId);
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text">{t('votes.title')}</h3>
        </div>
        <TableSkeleton columnNumbers={1} />
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text">{t('votes.title')}</h3>
          <button onClick={handleAdd} className="text-sm text-brand hover:underline cursor-pointer">
            {t('votes.createVote') || 'Create Vote'}
          </button>
        </div>

        {!votes || votes.length === 0 ? (
          <EmptyState title={t('votes.noVotes')} message={t('votes.noVotesDescription')} icon={Vote} />
        ) : (
          <div className="space-y-4">
            {votes.map(vote => {
              const voteId = vote.id || vote.Id;
              const isExpanded = expandedVoteId === voteId;
              const isStarted = vote.isStarted || vote.IsStarted;
              const isEnded = vote.isEnded || vote.IsEnded;
              const results = voteResults[voteId] || { casts: [], choiceCounts: {}, totalVotes: 0, choices: [] };
              const choices = vote.choices || vote.Choices || [];
              const question = vote.question || vote.Question || '';

              // Use backend vote counts if available (for ended votes)
              const backendChoices = choices.map(choice => {
                const choiceId = choice.id || choice.Id;
                const backendChoice = results.choices.find(c => (c.id || c.Id) === choiceId);
                return {
                  ...choice,
                  count: backendChoice?.voteCount || backendChoice?.count || 0,
                  percentage: backendChoice?.percentage || 0,
                  isWinner: backendChoice?.isWinner || (isEnded && (vote.winnerChoiceId || vote.WinnerChoiceId) === choiceId),
                };
              });

              return (
                <div key={voteId} className="border border-border rounded-lg p-4 bg-surface hover:bg-surface-elevated transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-text">{question}</h4>
                        {getStatusBadge(vote)}
                      </div>

                      {vote.agendaItem && (
                        <div className="flex items-center gap-1 text-xs text-text-muted mb-2">
                          <FileText className="h-3 w-3" />
                          <span>
                            {t('votes.agendaItem')}:{' '}
                            {vote.agendaItem.sentence || vote.agendaItem.Sentence || `Agenda Item ${vote.agendaItemId || vote.AgendaItemId}`}
                          </span>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
                        {vote.startDate && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {t('votes.startDate')}: {formatDate(vote.startDate)}
                            </span>
                          </div>
                        )}
                        {vote.endDate && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {t('votes.endDate')}: {formatDate(vote.endDate)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>
                            {results.totalVotes} {t('votes.votes')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <VoteIcon className="h-3 w-3" />
                          <span>
                            {choices.length} {t('votes.choices')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {isStarted && !isEnded && (
                        <Button variant="primary" onClick={() => handleCastVote(vote)} size="sm" className="cursor-pointer">
                          <VoteIcon size={16} />
                          {t('votes.castVote') || 'Cast Vote'}
                        </Button>
                      )}

                      <DropdownMenu
                        trigger={
                          <button
                            type="button"
                            className="p-1 hover:bg-surface-hover rounded-lg transition-colors text-text-muted hover:text-text cursor-pointer"
                            aria-label={t('votes.actions')}
                          >
                            <MoreVertical size={18} className="cursor-pointer" />
                          </button>
                        }
                      >
                        {!isStarted && !isEnded && (
                          <DropdownMenuItem onClick={() => handleEdit(vote)} className="hover:bg-transparent cursor-pointer">
                            <Edit size={16} className="text-text-muted" />
                            <span>{t('votes.edit') || 'Edit'}</span>
                          </DropdownMenuItem>
                        )}
                        {!isStarted && (
                          <DropdownMenuItem onClick={() => handleStartVote(vote)} className="hover:bg-transparent cursor-pointer">
                            <Play size={16} className="text-text-muted" />
                            <span>{t('votes.startVote') || 'Start Vote'}</span>
                          </DropdownMenuItem>
                        )}
                        {isStarted && !isEnded && (
                          <DropdownMenuItem onClick={() => handleEndVote(vote)} className="hover:bg-transparent cursor-pointer">
                            <Square size={16} className="text-text-muted" />
                            <span>{t('votes.endVote') || 'End Vote'}</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleDelete(vote)} className="text-destructive hover:bg-transparent cursor-pointer">
                          <Trash2 size={16} />
                          <span>{t('votes.delete') || 'Delete'}</span>
                        </DropdownMenuItem>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Choices and Results */}
                  {(isStarted || isEnded) && backendChoices.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <h5 className="text-sm font-medium text-text mb-3">{t('votes.results') || 'Results'}</h5>
                      <div className="space-y-2">
                        {backendChoices.map(choice => {
                          const choiceText = choice.text || choice.Text || '';
                          const choiceId = choice.id || choice.Id;
                          const isWinner = choice.isWinner || false;
                          const voteCount = choice.count || 0;
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
                                  {/* {isWinner && <span className="text-xs font-semibold text-green-600 shrink-0">{t('votes.winner') || 'Winner'}</span>} */}
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
                  {isExpanded && results.casts.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <h5 className="text-sm font-medium text-text mb-2">{t('votes.votersList') || 'Voters List'}</h5>
                      <div className="space-y-1">
                        {results.casts.map(cast => {
                          const memberName = cast.member?.fullName || `Member ${cast.memberId || cast.MemberId}`;
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

                  <button onClick={() => toggleExpand(voteId)} className="mt-3 text-xs text-brand hover:underline cursor-pointer">
                    {isExpanded ? t('votes.hideDetails') || 'Hide Details' : t('votes.showDetails') || 'Show Details'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <VoteModal
        isOpen={voteModalOpen}
        onClose={() => {
          setVoteModalOpen(false);
          setVoteToEdit(null);
          refetch();
        }}
        meetingId={meetingId}
        vote={voteToEdit}
        committeeId={committeeId}
      />

      <CastVoteModal
        isOpen={castVoteModalOpen}
        onClose={() => {
          setCastVoteModalOpen(false);
          setSelectedVote(null);
          refetch();
        }}
        vote={selectedVote}
        memberId={currentMemberId}
      />

      <DeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          if (!deleteMutation.isPending) {
            setDeleteDialogOpen(false);
            setVoteToDelete(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        title={t('votes.deleteDialog.title') || 'Delete Vote'}
        message={t('votes.deleteDialog.message', {
          question: voteToDelete?.question || voteToDelete?.Question || '',
        })}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
};

export default VotesTab;
