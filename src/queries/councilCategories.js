import { useQuery } from '@tanstack/react-query';
import { API } from '../services/API';
import { buildQueryParams } from '../utils/queryParams';

/**
 * Get all council categories
 * @param {Object} filters - Optional filters (e.g., { page, pageSize, searchTerm })
 * @param {Object} options - React Query options
 */
export const useGetAllCouncilCategoriesQuery = (filters = {}, options = {}) => {
  const params = buildQueryParams(filters);

  return useQuery({
    queryKey: ['councilCategories', params],
    queryFn: () => API.get('/committee-service/CouncilCategories', { params }),
    ...options,
  });
};
