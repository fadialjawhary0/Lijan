import { useQuery } from '@tanstack/react-query';
import { API } from '../services/API';
import { buildQueryParams } from '../utils/queryParams';

/**
 * Get all council types
 * @param {Object} filters - Optional filters (e.g., { page, pageSize, searchTerm })
 * @param {Object} options - React Query options
 */
export const useGetAllCouncilTypesQuery = (filters = {}, options = {}) => {
  const params = buildQueryParams(filters);

  return useQuery({
    queryKey: ['councilTypes', params],
    queryFn: () => API.get('/committee-service/CouncilType', { params }),
    ...options,
  });
};
