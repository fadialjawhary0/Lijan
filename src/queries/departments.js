import { useQuery } from '@tanstack/react-query';
import { API } from '../services/API';
import { buildQueryParams } from '../utils/queryParams';

/**
 * Get all departments
 * @param {Object} filters - Optional filters
 * @param {Object} options - React Query options
 */
export const useGetAllDepartmentsQuery = (filters = {}, options = {}) => {
  const params = buildQueryParams(filters);

  return useQuery({
    queryKey: ['departments', params],
    queryFn: () => API.get('/committee-service/Department', { params }),
    ...options,
  });
};

// Get department by ID
export const useGetDepartmentByIdQuery = (id, options = {}) => {
  return useQuery({
    queryKey: ['department', id],
    queryFn: () => API.get('/committee-service/Department/details', { params: { Id: id } }),
    enabled: !!id,
    ...options,
  });
};
