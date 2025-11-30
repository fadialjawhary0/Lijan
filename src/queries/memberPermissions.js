import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API } from '../services/API';
import { buildQueryParams } from '../utils/queryParams';

/**
 * Get all member permissions
 * @param {Object} filters - Optional filters
 * @param {Object} options - React Query options
 */
export const useGetAllMemberPermissionsQuery = (filters = {}, options = {}) => {
  const params = buildQueryParams(filters);

  return useQuery({
    queryKey: ['memberPermissions', params],
    queryFn: () => API.get('/committee-service/MemberRolePermissions', { params }),
    ...options,
  });
};

/**
 * Get member permissions by member ID
 * @param {number} memberId - The member ID
 * @param {Object} options - React Query options
 */
export const useGetMemberPermissionsByMemberIdQuery = (memberId, options = {}) => {
  return useQuery({
    queryKey: ['memberPermissions', 'byMember', memberId],
    queryFn: () => API.get('/committee-service/MemberRolePermission', { params: { MemberId: memberId } }),
    enabled: !!memberId,
    ...options,
  });
};

// Get member permission by ID
export const useGetMemberPermissionByIdQuery = (id, options = {}) => {
  return useQuery({
    queryKey: ['memberPermission', id],
    queryFn: () => API.get('/committee-service/MemberRolePermission/details', { params: { Id: id } }),
    enabled: !!id,
    ...options,
  });
};

// Create member permission
export const useCreateMemberPermissionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.post('/committee-service/MemberRolePermission/create', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memberPermissions'] });
    },
  });
};

// Update member permission
export const useUpdateMemberPermissionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.patch('/committee-service/MemberRolePermission/update', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memberPermissions'] });
    },
  });
};

// Delete member permission
export const useDeleteMemberPermissionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.patch('/committee-service/MemberPermission/delete', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memberPermissions'] });
    },
  });
};
