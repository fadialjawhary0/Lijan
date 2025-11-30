import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API } from '../services/API';
import { buildQueryParams } from '../utils/queryParams';

// ========== QUERIES ==========

/**
 * Get all members
 * @param {Object} filters - Optional filters
 * @param {Object} options - React Query options
 */
export const useGetAllMembersQuery = (filters = {}, options = {}) => {
  const params = buildQueryParams(filters);

  return useQuery({
    queryKey: ['members', params],
    queryFn: () => API.get('/committee-service/Member', { params }),
    ...options,
  });
};

// Get member by ID
export const useGetMemberByIdQuery = (id, options = {}) => {
  return useQuery({
    queryKey: ['member', id],
    queryFn: () => API.get('/committee-service/Member/details', { params: { Id: id } }),
    enabled: !!id,
    ...options,
  });
};

// Get members by committee ID (using GetAllMembersQuery with CommitteeId filter)
export const useGetMembersByCommitteeIdQuery = (committeeId, options = {}) => {
  return useGetAllMembersQuery(
    { CommitteeId: committeeId ? parseInt(committeeId) : undefined, Page: 1, PageSize: 1000 },
    { enabled: !!committeeId, ...options }
  );
};

// Get members by council ID (using GetAllMembersQuery with CouncilId filter)
export const useGetMembersByCouncilIdQuery = (councilId, options = {}) => {
  return useQuery({
    queryKey: ['members', 'by-council', councilId],
    queryFn: () => API.get('/committee-service/Member', { params: { CouncilId: councilId, Page: 1, PageSize: 1000 } }),
    enabled: !!councilId,
    ...options,
  });
};

// ========== MUTATIONS ==========

// Create a new member
export const useCreateMemberMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.post('/committee-service/Member/create', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      // Invalidate queries with CommitteeId filter
      if (variables?.CommitteeId) {
        queryClient.invalidateQueries({
          queryKey: ['members'],
          predicate: query => {
            const params = query.queryKey[1];
            return params?.CommitteeId === variables.CommitteeId;
          },
        });
      }
    },
  });
};

// Add members to committee
export const useAddMembersToCommitteeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.post('/committee-service/Member/add-to-committee', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      // Invalidate queries with CommitteeId filter
      if (variables?.Members?.[0]?.CommitteeId) {
        const committeeId = variables.Members[0].CommitteeId;
        queryClient.invalidateQueries({
          queryKey: ['members'],
          predicate: query => {
            const params = query.queryKey[1];
            return params?.CommitteeId === committeeId;
          },
        });
      }
    },
  });
};

// Update an existing member
export const useUpdateMemberMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.patch('/committee-service/Member/update', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      if (variables?.Id) {
        queryClient.invalidateQueries({ queryKey: ['member', variables.Id] });
      }
      // Invalidate queries with CommitteeId filter
      if (variables?.CommitteeId) {
        queryClient.invalidateQueries({
          queryKey: ['members'],
          predicate: query => {
            const params = query.queryKey[1];
            return params?.CommitteeId === variables.CommitteeId;
          },
        });
      }
    },
  });
};

// Delete a member (soft delete)
export const useDeleteMemberMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.patch('/committee-service/Member/delete', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      if (variables?.Id) {
        queryClient.invalidateQueries({ queryKey: ['member', variables.Id] });
      }
    },
  });
};

// Activate a member
export const useActivateMemberMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.patch('/committee-service/Member/activate', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
};

// Deactivate a member
export const useDeactivateMemberMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.patch('/committee-service/Member/deactivate', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
};
