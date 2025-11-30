import { useQuery } from '@tanstack/react-query';
import { API } from '../services/API';
import { buildQueryParams } from '../utils/queryParams';

/**
 * Get all attachment types
 * @param {Object} filters - Optional filters
 * @param {Object} options - React Query options
 */
export const useGetAllAttachmentTypesQuery = (filters = {}, options = {}) => {
  const params = buildQueryParams(filters);

  return useQuery({
    queryKey: ['attachmentTypes', params],
    queryFn: () => API.get('/committee-service/AttachmentType', { params }),
    ...options,
  });
};

/**
 * Get attachment type by ID
 * @param {number} id - Attachment type ID
 * @param {Object} options - React Query options
 */
export const useGetAttachmentTypeByIdQuery = (id, options = {}) => {
  return useQuery({
    queryKey: ['attachmentType', id],
    queryFn: () => API.get('/committee-service/AttachmentType/details', { params: { Id: id } }),
    enabled: !!id,
    ...options,
  });
};
