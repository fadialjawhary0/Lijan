import { useQuery } from '@tanstack/react-query';
import { API } from '../services/API';
import { buildQueryParams } from '../utils/queryParams';

/**
 * Get all role permissions
 * @param {Object} filters - Optional filters
 * @param {Object} options - React Query options
 */
export const useGetAllRolePermissionsQuery = (filters = {}, options = {}) => {
  const params = buildQueryParams(filters);

  return useQuery({
    queryKey: ['rolePermissions', params],
    queryFn: () => API.get('/committee-service/RolePermission', { params }),
    ...options,
  });
};

/**
 * Get role permissions by role ID
 * @param {number} roleId - The role ID
 * @param {Object} options - React Query options
 */
export const useGetRolePermissionsByRoleIdQuery = (roleId, options = {}) => {
  return useQuery({
    queryKey: ['rolePermissions', 'byRole', roleId],
    queryFn: () => API.get('/committee-service/RolePermission/by-role', { params: { RoleId: roleId } }),
    enabled: !!roleId,
    ...options,
  });
};

// Get role permission by ID
export const useGetRolePermissionByIdQuery = (id, options = {}) => {
  return useQuery({
    queryKey: ['rolePermission', id],
    queryFn: () => API.get('/committee-service/RolePermission/details', { params: { Id: id } }),
    enabled: !!id,
    ...options,
  });
};

