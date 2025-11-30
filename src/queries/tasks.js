import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API } from '../services/API';
import { buildQueryParams } from '../utils/queryParams';

// ========== QUERIES ==========

/**
 * Get all tasks
 * @param {Object} filters - Optional filters
 * @param {Object} options - React Query options
 */
export const useGetAllTasksQuery = (filters = {}, options = {}) => {
  const params = buildQueryParams(filters);

  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => API.get('/committee-service/Task', { params }),
    ...options,
  });
};

// Get task by ID
export const useGetTaskByIdQuery = (id, options = {}) => {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => API.get('/committee-service/Task/details', { params: { Id: id } }),
    enabled: !!id,
    ...options,
  });
};

// Get tasks by committee ID
export const useGetTasksByCommitteeIdQuery = (committeeId, options = {}) => {
  return useQuery({
    queryKey: ['tasks', 'by-committee', committeeId],
    queryFn: () => API.get('/committee-service/Task/by-committee', { params: { CommitteeId: committeeId } }),
    enabled: !!committeeId,
    ...options,
  });
};

// Get tasks by meeting ID
export const useGetTasksByMeetingIdQuery = (meetingId, options = {}) => {
  return useQuery({
    queryKey: ['tasks', 'by-meeting', meetingId],
    queryFn: () => API.get('/committee-service/Task', { params: { MeetingId: meetingId, PageSize: 1000 } }),
    enabled: !!meetingId,
    ...options,
  });
};

// Get all task statuses
export const useGetAllTaskStatusesQuery = (options = {}) => {
  return useQuery({
    queryKey: ['taskStatuses'],
    queryFn: () => API.get('/committee-service/TaskStatus', { params: { PageSize: 100 } }),
    ...options,
  });
};

// ========== MUTATIONS ==========

// Create a new task
export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.post('/committee-service/Task/create', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (variables?.MeetingId) {
        queryClient.invalidateQueries({ queryKey: ['tasks', 'by-meeting', variables.MeetingId] });
      }
      if (variables?.CommitteeId) {
        queryClient.invalidateQueries({ queryKey: ['tasks', 'by-committee', variables.CommitteeId] });
      }
    },
  });
};

// Update an existing task
export const useUpdateTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.patch('/committee-service/Task/update', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (variables?.Id) {
        queryClient.invalidateQueries({ queryKey: ['task', variables.Id] });
      }
      if (variables?.MeetingId) {
        queryClient.invalidateQueries({ queryKey: ['tasks', 'by-meeting', variables.MeetingId] });
      }
    },
  });
};

// Delete a task (soft delete)
export const useDeleteTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.patch('/committee-service/Task/delete', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (variables?.Id) {
        queryClient.invalidateQueries({ queryKey: ['task', variables.Id] });
      }
      // Invalidate all meeting tasks queries since we don't know which meeting
      queryClient.invalidateQueries({ queryKey: ['tasks', 'by-meeting'] });
    },
  });
};

// Assign RACI roles to task members
export const useAssignTaskRACIMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.post('/committee-service/Task/assign-raci', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (variables?.TaskId) {
        queryClient.invalidateQueries({ queryKey: ['task', variables.TaskId] });
        queryClient.invalidateQueries({ queryKey: ['taskRACI', variables.TaskId] });
      }
      if (variables?.MeetingId) {
        queryClient.invalidateQueries({ queryKey: ['tasks', 'by-meeting', variables.MeetingId] });
      }
    },
  });
};

// Add a note to a task
export const useAddTaskNoteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.post('/committee-service/Task/add-note', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (variables?.TaskId) {
        queryClient.invalidateQueries({ queryKey: ['task', variables.TaskId] });
      }
    },
  });
};

// Add or update consultant comment for a task
export const useAddTaskConsultantCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.post('/committee-service/Task/add-consultant-comment', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (variables?.TaskId) {
        queryClient.invalidateQueries({ queryKey: ['task', variables.TaskId] });
      }
    },
  });
};
