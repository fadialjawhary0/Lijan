import { useQuery } from '@tanstack/react-query';
import { API } from '../services/API';
import { buildQueryParams } from '../utils/queryParams';

/**
 * Get all rooms
 * @param {Object} filters - Optional filters
 * @param {Object} options - React Query options
 */
export const useGetAllRoomsQuery = (filters = {}, options = {}) => {
  const params = buildQueryParams(filters);

  return useQuery({
    queryKey: ['rooms', params],
    queryFn: () => API.get('/committee-service/Room', { params }),
    ...options,
  });
};

// Get room by ID
export const useGetRoomByIdQuery = (id, options = {}) => {
  return useQuery({
    queryKey: ['room', id],
    queryFn: () => API.get('/committee-service/Room/details', { params: { Id: id } }),
    enabled: !!id,
    ...options,
  });
};

