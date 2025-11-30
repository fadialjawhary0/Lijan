import { useQuery } from '@tanstack/react-query';
import { API } from '../services/API';
import { buildQueryParams } from '../utils/queryParams';

/**
 * Get all roles
 * @param {Object} filters - Optional filters
 * @param {Object} options - React Query options
 */
export const useGetAllRolesQuery = (filters = {}, options = {}) => {
  const params = buildQueryParams(filters);

  return useQuery({
    queryKey: ['roles', params],
    queryFn: () => API.get('/committee-service/Role', { params }),
    ...options,
  });
};

// Get role by ID
export const useGetRoleByIdQuery = (id, options = {}) => {
  return useQuery({
    queryKey: ['role', id],
    queryFn: () => API.get('/committee-service/Role/details', { params: { Id: id } }),
    enabled: !!id,
    ...options,
  });
};

