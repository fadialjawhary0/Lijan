import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API } from '../services/API';
import { buildQueryParams } from '../utils/queryParams';

/**
 * Get all committee tasks
 * @param {Object} filters - Optional filters
 * @param {Object} options - React Query options
 */
export const useGetAllCommitteeTasksQuery = (filters = {}, options = {}) => {
  const params = buildQueryParams(filters);

  return useQuery({
    queryKey: ['committeeTasks', params],
    queryFn: () => API.get('/committee-service/CommitteeTask', { params }),
    ...options,
  });
};

// Get committee task by ID
export const useGetCommitteeTaskByIdQuery = (id, options = {}) => {
  return useQuery({
    queryKey: ['committeeTask', id],
    queryFn: () => API.get('/committee-service/CommitteeTask/details', { params: { Id: id } }),
    enabled: !!id,
    ...options,
  });
};

// Get committee tasks by committee ID
export const useGetCommitteeTasksByCommitteeIdQuery = (committeeId, options = {}) => {
  return useQuery({
    queryKey: ['committeeTasks', 'by-committee', committeeId],
    queryFn: () => API.get('/committee-service/CommitteeTask/by-committee', { params: { CommitteeId: committeeId } }),
    enabled: !!committeeId,
    ...options,
  });
};

// ========== MUTATIONS ==========

// Create a new committee task
export const useCreateCommitteeTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.post('/committee-service/CommitteeTask/create', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['committeeTasks'] });
      if (variables?.CommitteeId) {
        queryClient.invalidateQueries({ queryKey: ['committeeTasks', 'by-committee', variables.CommitteeId] });
      }
    },
  });
};

// Update an existing committee task
export const useUpdateCommitteeTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.patch('/committee-service/CommitteeTask/update', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['committeeTasks'] });
      if (variables?.Id) {
        queryClient.invalidateQueries({ queryKey: ['committeeTask', variables.Id] });
      }
      if (variables?.CommitteeId) {
        queryClient.invalidateQueries({ queryKey: ['committeeTasks', 'by-committee', variables.CommitteeId] });
      }
    },
  });
};

// Delete a committee task (soft delete)
export const useDeleteCommitteeTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.patch('/committee-service/CommitteeTask/delete', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['committeeTasks'] });
      if (variables?.Id) {
        queryClient.invalidateQueries({ queryKey: ['committeeTask', variables.Id] });
      }
    },
  });
};
