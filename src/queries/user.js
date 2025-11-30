import { useQuery } from '@tanstack/react-query';
import { API } from '../services/API';
import { buildQueryParams } from '../utils/queryParams';

export const useGetUserByIdQuery = (id, options = {}) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => API.get(`/auth-service/User/details?id=${id}`, { params: { systemId: 2 } }),
    staleTime: 1000 * 60 * 60 * 24, // Data is fresh for 24 hours
    cacheTime: 1000 * 60 * 60 * 24 * 7, // Keep in cache for 7 days
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    refetchOnMount: false, // Don't refetch when component mounts if data exists

    ...options,
  });
};

export const useGetAllUsersQuery = (filters = {}, options = {}) => {
  const params = buildQueryParams(filters);

  return useQuery({
    queryKey: ['users', params],
    queryFn: () => API.get('/auth-service/User', { params }),
    ...options,
  });
};

export const useGetUsersByIdsQuery = ids => {
  return useQuery({
    queryKey: ['users', ids],
    queryFn: () => API.get(`/auth-service/User/info`, { params: { UserId: ids } }),
  });
};

/**
 * Get brief users list with pagination
 * @param {Object} params - Query parameters (page, pageSize)
 * @param {Object} options - React Query options
 */
export const useGetBriefAllUsersQuery = (params = { page: 1, pageSize: 100 }, options = {}) => {
  return useQuery({
    queryKey: ['briefUsers', params],
    queryFn: () => API.get('/auth-service/User/brief', { params }),
    ...options,
  });
};
