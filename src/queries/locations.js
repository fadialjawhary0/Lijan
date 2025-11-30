import { useQuery } from '@tanstack/react-query';
import { API } from '../services/API';
import { buildQueryParams } from '../utils/queryParams';

/**
 * Get all locations
 * @param {Object} filters - Optional filters
 * @param {Object} options - React Query options
 */
export const useGetAllLocationsQuery = (filters = {}, options = {}) => {
  const params = buildQueryParams(filters);

  return useQuery({
    queryKey: ['locations', params],
    queryFn: () => API.get('/committee-service/Location', { params }),
    ...options,
  });
};

// Get location by ID
export const useGetLocationByIdQuery = (id, options = {}) => {
  return useQuery({
    queryKey: ['location', id],
    queryFn: () => API.get('/committee-service/Location/details', { params: { Id: id } }),
    enabled: !!id,
    ...options,
  });
};

