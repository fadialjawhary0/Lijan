import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API } from '../services/API';
import { buildQueryParams } from '../utils/queryParams';

// ========== QUERIES ==========

/**
 * Get all meetings
 * @param {Object} filters - Optional filters
 * @param {Object} options - React Query options
 */
export const useGetAllMeetingsQuery = (filters = {}, options = {}) => {
  const params = buildQueryParams(filters);

  return useQuery({
    queryKey: ['meetings', params],
    queryFn: () => API.get('/committee-service/Meeting', { params }),
    ...options,
  });
};

// Get meeting by ID
export const useGetMeetingByIdQuery = (id, options = {}) => {
  return useQuery({
    queryKey: ['meeting', id],
    queryFn: () => API.get('/committee-service/Meeting/details', { params: { Id: id } }),
    enabled: !!id,
    ...options,
  });
};

/**
 * Get meetings by committee ID
 * @param {number} committeeId - Committee ID
 * @param {Object} filters - Optional filters (e.g., { UserId })
 * @param {Object} options - React Query options
 */
export const useGetMeetingsByCommitteeIdQuery = (committeeId, filters = {}, options = {}) => {
  const params = buildQueryParams({ CommitteeId: committeeId, ...filters });

  return useQuery({
    queryKey: ['meetings', 'by-committee', committeeId, filters],
    queryFn: () => API.get('/committee-service/Meeting/by-committee', { params }),
    enabled: !!committeeId,
    ...options,
  });
};

/**
 * Get agenda items by meeting ID
 * @param {number} meetingId - Meeting ID
 * @param {Object} options - React Query options
 */
export const useGetMeetingAgendaQuery = (meetingId, options = {}) => {
  return useQuery({
    queryKey: ['meeting-agenda', meetingId],
    queryFn: () => API.get('/committee-service/AgendaItem/by-meeting', { params: { MeetingId: meetingId } }),
    enabled: !!meetingId,
    ...options,
  });
};

/**
 * Get participants by meeting ID
 * @param {number} meetingId - Meeting ID
 * @param {Object} options - React Query options
 */
export const useGetMeetingParticipantsQuery = (meetingId, options = {}) => {
  return useQuery({
    queryKey: ['meeting-participants', meetingId],
    queryFn: () => API.get('/committee-service/MeetingMember', { params: { MeetingId: meetingId } }),
    enabled: !!meetingId,
    ...options,
  });
};

/**
 * Get attachments by meeting ID
 * @param {number} meetingId - Meeting ID
 * @param {Object} options - React Query options
 */
export const useGetMeetingAttachmentsQuery = (meetingId, options = {}) => {
  return useQuery({
    queryKey: ['meeting-attachments', meetingId],
    queryFn: () => API.get('/committee-service/RelatedAttachmentMeeting', { params: { MeetingId: meetingId } }),
    enabled: !!meetingId,
    ...options,
  });
};

// ========== MUTATIONS ==========

// Create a new meeting
export const useCreateMeetingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.post('/committee-service/Meeting/create', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      if (variables?.CommitteeId) {
        queryClient.invalidateQueries({ queryKey: ['meetings', 'by-committee', variables.CommitteeId] });
      }
    },
  });
};

// Update an existing meeting
export const useUpdateMeetingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.patch('/committee-service/Meeting/update', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      if (variables?.Id) queryClient.invalidateQueries({ queryKey: ['meeting', variables.Id] });
      if (variables?.CommitteeId) queryClient.invalidateQueries({ queryKey: ['meetings', 'by-committee', variables.CommitteeId] });
    },
  });
};

// Delete a meeting (soft delete)
export const useDeleteMeetingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.patch('/committee-service/Meeting/delete', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      if (variables?.Id) queryClient.invalidateQueries({ queryKey: ['meeting', variables.Id] });
    },
  });
};

// Generate Zoom meeting link
export const useGenerateZoomLinkMutation = () => {
  return useMutation({
    mutationFn: data => API.post('/committee-service/Meeting/generate-zoom-link', data),
  });
};

// ========== AGENDA ITEMS MUTATIONS ==========

// Create agenda item
export const useCreateAgendaItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.post('/committee-service/AgendaItem/create', data),
    onSuccess: (_, variables) => {
      if (variables?.MeetingId) {
        queryClient.invalidateQueries({ queryKey: ['meeting-agenda', variables.MeetingId] });
      }
    },
  });
};

// Update agenda item
export const useUpdateAgendaItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.patch('/committee-service/AgendaItem/update', data),
    onSuccess: (_, variables) => {
      if (variables?.MeetingId) {
        queryClient.invalidateQueries({ queryKey: ['meeting-agenda', variables.MeetingId] });
      }
    },
  });
};

// Delete agenda item
export const useDeleteAgendaItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.patch('/committee-service/AgendaItem/delete', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-agenda'] });
    },
  });
};

// ========== MEETING MEMBERS (PARTICIPANTS) MUTATIONS ==========

// Create meeting member
export const useCreateMeetingMemberMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.post('/committee-service/MeetingMember/create', data),
    onSuccess: (_, variables) => {
      if (variables?.MeetingId) {
        queryClient.invalidateQueries({ queryKey: ['meeting-participants', variables.MeetingId] });
      }
    },
  });
};

// Update meeting member
export const useUpdateMeetingMemberMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.patch('/committee-service/MeetingMember/update', data),
    onSuccess: (_, variables) => {
      if (variables?.MeetingId) {
        queryClient.invalidateQueries({ queryKey: ['meeting-participants', variables.MeetingId] });
      }
    },
  });
};

// Delete meeting member
export const useDeleteMeetingMemberMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.patch('/committee-service/MeetingMember/delete', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-participants'] });
    },
  });
};

// ========== RELATED ATTACHMENT MEETINGS MUTATIONS ==========

// Create related attachment meeting
export const useCreateRelatedAttachmentMeetingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.post('/committee-service/RelatedAttachmentMeeting/create', data),
    onSuccess: (_, variables) => {
      if (variables?.MeetingId) {
        queryClient.invalidateQueries({ queryKey: ['meeting-attachments', variables.MeetingId] });
      }
    },
  });
};

// Update related attachment meeting
export const useUpdateRelatedAttachmentMeetingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.patch('/committee-service/RelatedAttachmentMeeting/update', data),
    onSuccess: (_, variables) => {
      if (variables?.MeetingId) {
        queryClient.invalidateQueries({ queryKey: ['meeting-attachments', variables.MeetingId] });
      }
    },
  });
};

// Delete related attachment meeting
export const useDeleteRelatedAttachmentMeetingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.patch('/committee-service/RelatedAttachmentMeeting/delete', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-attachments'] });
    },
  });
};
