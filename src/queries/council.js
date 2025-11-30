import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API } from '../services/API';
import { buildQueryParams } from '../utils/queryParams';

/**
 * Get all councils
 * @param {Object} filters - Optional filters (e.g., { page, pageSize, searchTerm })
 * @param {Object} options - React Query options
 */
export const useGetAllCouncilsQuery = (filters = {}, options = {}) => {
  const params = buildQueryParams(filters);

  return useQuery({
    queryKey: ['councils', params],
    queryFn: () => API.get('/committee-service/Council', { params }),
    ...options,
  });
};

// Get council by ID
export const useGetCouncilByIdQuery = (id, options = {}) => {
  return useQuery({
    queryKey: ['council', id],
    queryFn: () => API.get('/committee-service/Council/details', { params: { Id: id } }),
    enabled: !!id,
    ...options,
  });
};

// Get council details with related data
export const useGetCouncilDetailsQuery = (id, options = {}) => {
  return useQuery({
    queryKey: ['council', 'details', id],
    queryFn: () => API.get('/committee-service/Council/details-full', { params: { Id: id } }),
    enabled: !!id,
    ...options,
  });
};

// ========== MUTATIONS ==========

// Create a new council
export const useCreateCouncilMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.post('/committee-service/Council/create', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['councils'] });
    },
  });
};

// Update an existing council
export const useUpdateCouncilMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.patch('/committee-service/Council/update', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['councils'] });
      if (variables?.Id) {
        queryClient.invalidateQueries({ queryKey: ['council', variables.Id] });
      }
    },
  });
};

// Delete a council (soft delete)
export const useDeleteCouncilMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.patch('/committee-service/Council/delete', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['councils'] });
      if (variables?.Id) {
        queryClient.invalidateQueries({ queryKey: ['council', variables.Id] });
      }
    },
  });
};
