import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useBreadcrumbs } from '../../context';
import { useCommittee } from '../../context/CommitteeContext';
import VotingHeader from '../../features/Voting/components/VotingHeader';
import VotingFilters from '../../features/Voting/components/VotingFilters';
import VotingCard from '../../features/Voting/components/VotingCard';
import DeleteDialog from '../../components/ui/DeleteDialog';
import CastVoteModal from '../../features/MeetingsDetails/components/VotesTab/CastVoteModal';
import { useGetAllMeetingVotesQuery, useDeleteMeetingVoteMutation, useUpdateMeetingVoteMutation } from '../../queries/votes';
import { useGetAllMeetingVotesCastsQuery } from '../../queries/votes';
import { useGetAllMeetingsQuery } from '../../queries/meetings';
import { useGetAllMembersQuery } from '../../queries/members';
import { useToast } from '../../context/ToasterContext';
import { isApiResponseSuccessful, getApiErrorMessage } from '../../utils/apiResponseHandler';
import { useAuth } from '../../context/AuthContext';
import EmptyState from '../../components/ui/EmptyState';
import { Vote } from 'lucide-react';
import TableSkeleton from '../../components/skeletons/TableSkeleton';
import Card from '../../components/ui/Card';

const VotingPage = () => {
  const { t, i18n } = useTranslation('voting');
  const navigate = useNavigate();
  const { setBreadcrumbs } = useBreadcrumbs();
  const { selectedCommitteeId } = useCommittee();
  const { userId } = useAuth();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [meetingFilter, setMeetingFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [voteToDelete, setVoteToDelete] = useState(null);
  const [castVoteModalOpen, setCastVoteModalOpen] = useState(false);
  const [selectedVote, setSelectedVote] = useState(null);

  useEffect(() => {
    setBreadcrumbs([{ label: t('title'), href: '/voting' }]);
  }, [setBreadcrumbs, i18n.language, t]);

  // Fetch all meetings for the committee
  const { data: meetingsData } = useGetAllMeetingsQuery(
    {
      CommitteeId: selectedCommitteeId ? parseInt(selectedCommitteeId) : undefined,
      PageSize: 1000,
    },
    { enabled: !!selectedCommitteeId }
  );
  const meetings = meetingsData?.data || meetingsData?.Data || [];

  // Fetch current user's member ID
  const { data: membersData } = useGetAllMembersQuery(
    {
      CommitteeId: selectedCommitteeId ? parseInt(selectedCommitteeId) : undefined,
      IsActive: true,
      PageSize: 1000,
    },
    { enabled: !!selectedCommitteeId && !!userId }
  );
  const currentMemberId = useMemo(() => {
    if (!membersData?.data || !userId) return null;
    const member = membersData.data.find(m => m.userId === parseInt(userId));
    return member?.id || null;
  }, [membersData, userId]);

  // Build API filters
  const apiFilters = useMemo(() => {
    const filters = {
      CommitteeId: selectedCommitteeId ? parseInt(selectedCommitteeId) : undefined,
      PageSize: 1000,
    };

    if (searchTerm?.trim()) {
      filters.SearchTerm = searchTerm.trim();
    }
    if (meetingFilter !== 'all') {
      filters.MeetingId = parseInt(meetingFilter);
    }

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    return filters;
  }, [selectedCommitteeId, searchTerm, meetingFilter]);

  // Fetch votes
  const { data: votesResponse, isLoading, refetch } = useGetAllMeetingVotesQuery(apiFilters, {
    enabled: !!selectedCommitteeId,
  });
  const allVotes = votesResponse?.data || votesResponse?.Data || [];

  // Fetch all vote casts
  const voteIds = useMemo(() => allVotes.map(v => v.id || v.Id).filter(Boolean), [allVotes]);
  const { data: allCastsResponse } = useGetAllMeetingVotesCastsQuery(
    {
      PageSize: 1000,
    },
    { enabled: voteIds.length > 0 }
  );
  const allCasts = allCastsResponse?.data || allCastsResponse?.Data || [];

  // Calculate vote results
  const voteResults = useMemo(() => {
    const results = {};
    allVotes.forEach(vote => {
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
  }, [allVotes, allCasts]);

  // Client-side filtering
  const filteredVotes = useMemo(() => {
    let filtered = [...allVotes];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(vote => {
        const isStarted = vote.isStarted || vote.IsStarted;
        const isEnded = vote.isEnded || vote.IsEnded;
        if (statusFilter === 'notStarted') return !isStarted && !isEnded;
        if (statusFilter === 'inProgress') return isStarted && !isEnded;
        if (statusFilter === 'completed') return isEnded;
        return true;
      });
    }

    // Date filters
    if (dateFrom) {
      filtered = filtered.filter(vote => {
        const voteDate = vote.startDate || vote.StartDate;
        if (!voteDate) return false;
        return new Date(voteDate) >= new Date(dateFrom);
      });
    }
    if (dateTo) {
      filtered = filtered.filter(vote => {
        const voteDate = vote.endDate || vote.EndDate || vote.startDate || vote.StartDate;
        if (!voteDate) return false;
        return new Date(voteDate) <= new Date(dateTo);
      });
    }

    return filtered;
  }, [allVotes, statusFilter, dateFrom, dateTo]);

  const deleteMutation = useDeleteMeetingVoteMutation();
  const updateMutation = useUpdateMeetingVoteMutation();

  // Reset filters when filters change
  useEffect(() => {
    // Reset any pagination if needed
  }, [searchTerm, meetingFilter, statusFilter, dateFrom, dateTo]);

  const handleCreateVote = () => {
    navigate('/voting/create');
  };

  const handleEdit = vote => {
    const voteId = vote.id || vote.Id;
    navigate(`/voting/update/${voteId}`);
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
        toast.success(t('deleteSuccess'));
        setDeleteDialogOpen(false);
        setVoteToDelete(null);
        refetch();
      } else {
        const errorMessage = getApiErrorMessage(response, t('error'));
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message || t('error'));
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
        toast.success(t('startSuccess'));
        refetch();
      } else {
        const errorMessage = getApiErrorMessage(response, t('error'));
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Start vote error:', error);
      toast.error(error.message || t('error'));
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
        toast.success(t('endSuccess'));
        refetch();
      } else {
        const errorMessage = getApiErrorMessage(response, t('error'));
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('End vote error:', error);
      toast.error(error.message || t('error'));
    }
  };

  const handleCastVote = vote => {
    setSelectedVote(vote);
    setCastVoteModalOpen(true);
  };

  // Check if user can cast vote (vote is started and not ended)
  const canCastVote = useMemo(() => {
    return vote => {
      const isStarted = vote.isStarted || vote.IsStarted;
      const isEnded = vote.isEnded || vote.IsEnded;
      return isStarted && !isEnded && currentMemberId;
    };
  }, [currentMemberId]);

  // Check if user can manage vote (for now, all committee members can manage)
  const canManage = useMemo(() => {
    return () => {
      return !!selectedCommitteeId && !!currentMemberId;
    };
  }, [selectedCommitteeId, currentMemberId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <TableSkeleton columnNumbers={1} />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <VotingHeader totalCount={filteredVotes.length} onCreateVote={handleCreateVote} />

      <VotingFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        meetingFilter={meetingFilter}
        setMeetingFilter={setMeetingFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        meetings={meetings}
      />

      {!filteredVotes || filteredVotes.length === 0 ? (
        <EmptyState title={t('noVotes')} message={t('noVotesDescription')} icon={Vote} />
      ) : (
        <div className="space-y-4">
          {filteredVotes.map(vote => {
            const voteId = vote.id || vote.Id;
            const results = voteResults[voteId] || { casts: [], choiceCounts: {}, totalVotes: 0, choices: [] };

            return (
              <VotingCard
                key={voteId}
                vote={vote}
                results={results}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStartVote={handleStartVote}
                onEndVote={handleEndVote}
                onCastVote={handleCastVote}
                canCastVote={canCastVote(vote)}
                canManage={canManage()}
              />
            );
          })}
        </div>
      )}

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
        title={t('deleteDialog.title')}
        message={t('deleteDialog.message', {
          question: voteToDelete?.question || voteToDelete?.Question || '',
        })}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default VotingPage;
