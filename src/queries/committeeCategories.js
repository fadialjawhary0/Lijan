import { useQuery } from '@tanstack/react-query';
import { API } from '../services/API';
import { buildQueryParams } from '../utils/queryParams';

/**
 * Get all committee categories
 * @param {Object} filters - Optional filters
 * @param {Object} options - React Query options
 */
export const useGetAllCommitteeCategoriesQuery = (filters = {}, options = {}) => {
  const params = buildQueryParams(filters);

  return useQuery({
    queryKey: ['committeeCategories', params],
    queryFn: () => API.get('/committee-service/CommitteeCategory', { params }),
    ...options,
  });
};

// Get committee category by ID
export const useGetCommitteeCategoryByIdQuery = (id, options = {}) => {
  return useQuery({
    queryKey: ['committeeCategory', id],
    queryFn: () => API.get('/committee-service/CommitteeCategory/details', { params: { Id: id } }),
    enabled: !!id,
    ...options,
  });
};
