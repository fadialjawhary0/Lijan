import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API } from '../services/API';
import { buildQueryParams } from '../utils/queryParams';

// ========== QUERIES ==========

export const useGetConversationsQuery = (filters = {}, options = {}) => {
  const params = buildQueryParams(filters);

  return useQuery({
    queryKey: ['conversations', params],
    queryFn: () => API.get('/committee-service/Message/conversations', { params }),
    ...options,
  });
};

export const useGetConversationMessagesQuery = (filters = {}, options = {}) => {
  const params = buildQueryParams(filters);

  return useQuery({
    queryKey: ['conversation-messages', params],
    queryFn: () => API.get('/committee-service/Message/conversation-messages', { params }),
    ...options,
  });
};

export const useGetMessageGroupByIdQuery = (id, options = {}) => {
  return useQuery({
    queryKey: ['message-group', id],
    queryFn: () => API.get(`/committee-service/Message/group/${id}`),
    enabled: !!id,
    ...options,
  });
};

export const useGetAllMessagesQuery = (filters = {}, options = {}) => {
  const params = buildQueryParams(filters);

  return useQuery({
    queryKey: ['messages', params],
    queryFn: () => API.get('/committee-service/Message', { params }),
    ...options,
  });
};

export const useGetMessageByIdQuery = (id, options = {}) => {
  return useQuery({
    queryKey: ['message', id],
    queryFn: () => API.get('/committee-service/Message/details', { params: { Id: id } }),
    enabled: !!id,
    ...options,
  });
};

// ========== MUTATIONS ==========

export const useCreateMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.post('/committee-service/Message/create', data),
    onSuccess: (response, variables) => {
      // Invalidate conversations and messages queries
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation-messages'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
};

export const useCreateMessageGroupMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.post('/committee-service/Message/group/create', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['message-group'] });
    },
  });
};

export const useAddGroupMemberMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.post('/committee-service/Message/group/add-member', data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['message-group', variables.MessageGroupId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

export const useRemoveGroupMemberMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.post('/committee-service/Message/group/remove-member', data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['message-group', variables.MessageGroupId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

export const useMarkMessagesAsReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.post('/committee-service/Message/mark-read', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation-messages'] });
    },
  });
};

export const useUpdateMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.patch('/committee-service/Message/update', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversation-messages'] });
    },
  });
};

export const useDeleteMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.patch('/committee-service/Message/delete', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversation-messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

/**
 * Upload audio file for a message
 */
export const useUploadAudioMutation = () => {
  return useMutation({
    mutationFn: async ({ file, durationSeconds }) => {
      const formData = new FormData();
      formData.append('file', file, 'audio-message.webm');
      if (durationSeconds) {
        formData.append('durationSeconds', durationSeconds.toString());
      }

      const response = await API.post('/committee-service/MessageFile/upload-audio', formData);
      return response;
    },
  });
};

export const useAddMessageReactionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.post('/committee-service/Message/reaction/add', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation-messages'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
};

export const useRemoveMessageReactionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.post('/committee-service/Message/reaction/remove', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation-messages'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
};
