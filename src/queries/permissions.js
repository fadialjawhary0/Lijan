import { useQuery } from '@tanstack/react-query';
import { API } from '../services/API';
import { buildQueryParams } from '../utils/queryParams';

/**
 * Get all permissions
 * @param {Object} filters - Optional filters
 * @param {Object} options - React Query options
 */
export const useGetAllPermissionsQuery = (filters = {}, options = {}) => {
  const params = buildQueryParams(filters);

  return useQuery({
    queryKey: ['permissions', params],
    queryFn: () => API.get('/committee-service/Permission', { params }),
    ...options,
  });
};

// Get permission by ID
export const useGetPermissionByIdQuery = (id, options = {}) => {
  return useQuery({
    queryKey: ['permission', id],
    queryFn: () => API.get('/committee-service/Permission/details', { params: { Id: id } }),
    enabled: !!id,
    ...options,
  });
};

