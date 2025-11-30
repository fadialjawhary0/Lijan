import { useQuery } from '@tanstack/react-query';
import { API } from '../services/API';
import { buildQueryParams } from '../utils/queryParams';

/**
 * Get all meeting statuses
 * @param {Object} filters - Optional filters
 * @param {Object} options - React Query options
 */
export const useGetAllMeetingStatusesQuery = (filters = {}, options = {}) => {
  const params = buildQueryParams(filters);

  return useQuery({
    queryKey: ['meetingStatuses', params],
    queryFn: () => API.get('/committee-service/MeetingStatus', { params }),
    ...options,
  });
};

// Get meeting status by ID
export const useGetMeetingStatusByIdQuery = (id, options = {}) => {
  return useQuery({
    queryKey: ['meetingStatus', id],
    queryFn: () => API.get('/committee-service/MeetingStatus/details', { params: { Id: id } }),
    enabled: !!id,
    ...options,
  });
};

