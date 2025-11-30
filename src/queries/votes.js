import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API } from '../services/API';
import { buildQueryParams } from '../utils/queryParams';

// ========== QUERIES ==========

/**
 * Get all meeting votes
 * @param {Object} filters - Optional filters
 * @param {Object} options - React Query options
 */
export const useGetAllMeetingVotesQuery = (filters = {}, options = {}) => {
  const params = buildQueryParams(filters);

  return useQuery({
    queryKey: ['meetingVotes', params],
    queryFn: () => API.get('/committee-service/MeetingVote', { params }),
    ...options,
  });
};

// Get meeting vote by ID
export const useGetMeetingVoteByIdQuery = (id, options = {}) => {
  return useQuery({
    queryKey: ['meetingVote', id],
    queryFn: () => API.get('/committee-service/MeetingVote/details', { params: { Id: id } }),
    enabled: !!id,
    ...options,
  });
};

/**
 * Get all meeting votes casts
 * @param {Object} filters - Optional filters
 * @param {Object} options - React Query options
 */
export const useGetAllMeetingVotesCastsQuery = (filters = {}, options = {}) => {
  const params = buildQueryParams(filters);

  return useQuery({
    queryKey: ['meetingVotesCasts', params],
    queryFn: () => API.get('/committee-service/MeetingVotesCast', { params }),
    ...options,
  });
};

// ========== MUTATIONS ==========

// Create a new meeting vote
export const useCreateMeetingVoteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.post('/committee-service/MeetingVote/create', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meetingVotes'] });
      if (variables?.MeetingId) {
        queryClient.invalidateQueries({ queryKey: ['meetingVotes', 'by-meeting', variables.MeetingId] });
      }
    },
  });
};

// Update an existing meeting vote
export const useUpdateMeetingVoteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.patch('/committee-service/MeetingVote/update', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meetingVotes'] });
      if (variables?.Id) {
        queryClient.invalidateQueries({ queryKey: ['meetingVote', variables.Id] });
      }
      if (variables?.MeetingId) {
        queryClient.invalidateQueries({ queryKey: ['meetingVotes', 'by-meeting', variables.MeetingId] });
      }
    },
  });
};

// Delete a meeting vote (soft delete)
export const useDeleteMeetingVoteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.patch('/committee-service/MeetingVote/delete', { Id: data }),
    onSuccess: (_, voteId) => {
      queryClient.invalidateQueries({ queryKey: ['meetingVotes'] });
      if (voteId) {
        queryClient.invalidateQueries({ queryKey: ['meetingVote', voteId] });
      }
    },
  });
};

// Create a meeting vote cast (submit a vote)
export const useCreateMeetingVotesCastMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.post('/committee-service/MeetingVotesCast/create', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meetingVotesCasts'] });
      if (variables?.VoteId) {
        queryClient.invalidateQueries({ queryKey: ['meetingVotesCasts', 'by-vote', variables.VoteId] });
        queryClient.invalidateQueries({ queryKey: ['meetingVote', variables.VoteId] });
        queryClient.invalidateQueries({ queryKey: ['meetingVotes'] });
      }
    },
  });
};

