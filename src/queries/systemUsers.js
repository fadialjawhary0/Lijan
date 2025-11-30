import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API } from '../services/API';
import { buildQueryParams } from '../utils/queryParams';

// ========== QUERIES ==========

/**
 * Get all system users
 * @param {Object} filters - Optional filters
 * @param {Object} options - React Query options
 */
export const useGetAllSystemUsersQuery = (filters = {}, options = {}) => {
  const params = buildQueryParams(filters);

  return useQuery({
    queryKey: ['systemUsers', params],
    queryFn: () => API.get('/committee-service/SystemUser', { params }),
    ...options,
  });
};

// Get system user by ID
export const useGetSystemUserByIdQuery = (id, options = {}) => {
  return useQuery({
    queryKey: ['systemUser', id],
    queryFn: () => API.get('/committee-service/SystemUser/details', { params: { Id: id } }),
    enabled: !!id,
    ...options,
  });
};

// ========== MUTATIONS ==========

// Create a new system user
export const useCreateSystemUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.post('/committee-service/SystemUser/create', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemUsers'] });
    },
  });
};

// Update an existing system user
export const useUpdateSystemUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.patch('/committee-service/SystemUser/update', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['systemUsers'] });
      if (variables?.Id) {
        queryClient.invalidateQueries({ queryKey: ['systemUser', variables.Id] });
      }
    },
  });
};

// Delete a system user (soft delete)
export const useDeleteSystemUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.patch('/committee-service/SystemUser/delete', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['systemUsers'] });
      if (variables?.Id) {
        queryClient.invalidateQueries({ queryKey: ['systemUser', variables.Id] });
      }
    },
  });
};
