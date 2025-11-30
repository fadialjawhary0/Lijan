import { useQuery } from '@tanstack/react-query';
import { API } from '../services/API';
import { buildQueryParams } from '../utils/queryParams';

/**
 * Get all committee types
 * @param {Object} filters - Optional filters
 * @param {Object} options - React Query options
 */
export const useGetAllCommitteeTypesQuery = (filters = {}, options = {}) => {
  const params = buildQueryParams(filters);

  return useQuery({
    queryKey: ['committeeTypes', params],
    queryFn: () => API.get('/committee-service/CommitteeType', { params }),
    ...options,
  });
};

// Get committee type by ID
export const useGetCommitteeTypeByIdQuery = (id, options = {}) => {
  return useQuery({
    queryKey: ['committeeType', id],
    queryFn: () => API.get('/committee-service/CommitteeType/details', { params: { Id: id } }),
    enabled: !!id,
    ...options,
  });
};
