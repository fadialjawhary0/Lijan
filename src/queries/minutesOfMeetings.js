import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API } from '../services/API';

// ========== QUERIES ==========

/**
 * Get minutes of meeting by meeting ID
 */
export const useGetMinutesOfMeetingByMeetingIdQuery = (meetingId, options = {}) => {
  return useQuery({
    queryKey: ['minutesOfMeeting', 'by-meeting', meetingId],
    queryFn: () => API.get('/committee-service/MinutesOfMeeting/by-meeting', { params: { MeetingId: meetingId } }),
    enabled: !!meetingId,
    ...options,
  });
};

/**
 * Get minutes of meeting by ID
 */
export const useGetMinutesOfMeetingByIdQuery = (id, options = {}) => {
  return useQuery({
    queryKey: ['minutesOfMeeting', id],
    queryFn: () => API.get('/committee-service/MinutesOfMeeting/details', { params: { Id: id } }),
    enabled: !!id,
    ...options,
  });
};

/**
 * Get all versions of minutes of meeting by meeting ID
 */
export const useGetMinutesOfMeetingVersionsQuery = (meetingId, options = {}) => {
  return useQuery({
    queryKey: ['minutesOfMeetingVersions', meetingId],
    queryFn: () => API.get('/committee-service/MinutesOfMeeting/versions', { params: { MeetingId: meetingId } }),
    enabled: !!meetingId && (options.enabled !== false),
    ...options,
  });
};

/**
 * Get attachments for minutes of meeting
 */
export const useGetMinutesOfMeetingAttachmentsQuery = (minutesOfMeetingId, options = {}) => {
  return useQuery({
    queryKey: ['minutesOfMeetingAttachments', minutesOfMeetingId],
    queryFn: () => API.get('/committee-service/MinutesOfMeeting/attachments', { params: { MinutesOfMeetingId: minutesOfMeetingId } }),
    enabled: !!minutesOfMeetingId,
    ...options,
  });
};

// ========== MUTATIONS ==========

/**
 * Create minutes of meeting
 */
export const useCreateMinutesOfMeetingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.post('/committee-service/MinutesOfMeeting/create', data),
    onSuccess: (_, variables) => {
      if (variables?.MeetingId) {
        queryClient.invalidateQueries({ queryKey: ['minutesOfMeeting', 'by-meeting', variables.MeetingId] });
      }
    },
  });
};

/**
 * Update minutes of meeting
 */
export const useUpdateMinutesOfMeetingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.patch('/committee-service/MinutesOfMeeting/update', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['minutesOfMeeting', variables.Id] });
      if (variables?.MeetingId) {
        queryClient.invalidateQueries({ queryKey: ['minutesOfMeeting', 'by-meeting', variables.MeetingId] });
      }
    },
  });
};

/**
 * Publish minutes of meeting
 */
export const usePublishMinutesOfMeetingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.patch('/committee-service/MinutesOfMeeting/publish', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['minutesOfMeeting', variables.Id] });
      if (variables?.MeetingId) {
        queryClient.invalidateQueries({ queryKey: ['minutesOfMeeting', 'by-meeting', variables.MeetingId] });
      }
    },
  });
};

/**
 * Create attachment for minutes of meeting
 */
export const useCreateMinutesOfMeetingAttachmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.post('/committee-service/MinutesOfMeeting/attachments/create', data),
    onSuccess: (_, variables) => {
      if (variables?.MinutesOfMeetingId) {
        queryClient.invalidateQueries({ queryKey: ['minutesOfMeetingAttachments', variables.MinutesOfMeetingId] });
      }
    },
  });
};

/**
 * Download attachment
 */
export const downloadMinutesOfMeetingAttachment = async attachmentId => {
  const response = await API.get('/committee-service/MinutesOfMeeting/attachments/download', {
    params: { Id: attachmentId },
    responseType: 'blob',
  });
  return response;
};
