import { useQuery } from '@tanstack/react-query';
import { API } from '../services/API';
import { buildQueryParams } from '../utils/queryParams';

/**
 * Get all buildings
 * @param {Object} filters - Optional filters
 * @param {Object} options - React Query options
 */
export const useGetAllBuildingsQuery = (filters = {}, options = {}) => {
  const params = buildQueryParams(filters);

  return useQuery({
    queryKey: ['buildings', params],
    queryFn: () => API.get('/committee-service/Building', { params }),
    ...options,
  });
};

// Get building by ID
export const useGetBuildingByIdQuery = (id, options = {}) => {
  return useQuery({
    queryKey: ['building', id],
    queryFn: () => API.get('/committee-service/Building/details', { params: { Id: id } }),
    enabled: !!id,
    ...options,
  });
};

