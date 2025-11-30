import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API } from '../services/API';
import { buildQueryParams } from '../utils/queryParams';

/**
 * Get all committees
 * @param {Object} filters - Optional filters (e.g., { page, pageSize, searchTerm })
 * @param {Object} options - React Query options
 */
export const useGetAllCommitteesQuery = (filters = {}, options = {}) => {
  const params = buildQueryParams(filters);

  return useQuery({
    queryKey: ['committees', params],
    queryFn: () => API.get('/committee-service/Committee', { params }),
    ...options,
  });
};

// Get committee by ID
export const useGetCommitteeByIdQuery = (id, options = {}) => {
  return useQuery({
    queryKey: ['committee', id],
    queryFn: () => API.get('/committee-service/Committee/details', { params: { Id: id } }),
    enabled: !!id,
    ...options,
  });
};

// Get committee details with related data
export const useGetCommitteeDetailsQuery = (id, options = {}) => {
  return useQuery({
    queryKey: ['committee', 'details', id],
    queryFn: () => API.get('/committee-service/Committee/details-full', { params: { Id: id } }),
    enabled: !!id,
    ...options,
  });
};

// Get committees by user ID
export const useGetCommitteesByUserIdQuery = (userId, options = {}) => {
  return useQuery({
    queryKey: ['committees', 'by-user', userId],
    queryFn: () => API.get('/committee-service/Committee/by-user', { params: { UserId: userId } }),
    enabled: !!userId,
    ...options,
  });
};

// ========== MUTATIONS ==========

// Create a new committee
export const useCreateCommitteeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.post('/committee-service/Committee/create', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['committees'] });
    },
  });
};

// Update an existing committee
export const useUpdateCommitteeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.patch('/committee-service/Committee/update', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['committees'] });
      if (variables?.Id) {
        queryClient.invalidateQueries({ queryKey: ['committee', variables.Id] });
      }
    },
  });
};

// Delete a committee (soft delete)
export const useDeleteCommitteeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.patch('/committee-service/Committee/delete', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['committees'] });
      if (variables?.Id) {
        queryClient.invalidateQueries({ queryKey: ['committee', variables.Id] });
      }
    },
  });
};
