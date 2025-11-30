import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API } from '../services/API';
import { buildQueryParams } from '../utils/queryParams';

// ========== QUERIES ==========

/**
 * Get all announcements
 * @param {Object} filters - Optional filters
 * @param {Object} options - React Query options
 */
export const useGetAllAnnouncementsQuery = (filters = {}, options = {}) => {
  const params = buildQueryParams(filters);

  return useQuery({
    queryKey: ['announcements', params],
    queryFn: () => API.get('/committee-service/Announcement', { params }),
    ...options,
  });
};

/**
 * Get announcement by ID
 * @param {number} id - Announcement ID
 * @param {Object} options - React Query options
 */
export const useGetAnnouncementByIdQuery = (id, options = {}) => {
  return useQuery({
    queryKey: ['announcement', id],
    queryFn: () => API.get('/committee-service/Announcement/details', { params: { Id: id } }),
    enabled: !!id,
    ...options,
  });
};

/**
 * Extract image URL from a given URL
 * @param {string} url - The URL to extract image from
 * @param {Object} options - React Query options
 */
export const useExtractImageFromUrlQuery = (url, options = {}) => {
  return useQuery({
    queryKey: ['extract-image', url],
    queryFn: () => API.get('/committee-service/Announcement/extract-image', { params: { Url: url } }),
    enabled: !!url,
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
    ...options,
  });
};

// ========== MUTATIONS ==========

/**
 * Create a new announcement
 */
export const useCreateAnnouncementMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.post('/committee-service/Announcement/create', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
};

/**
 * Update an existing announcement
 */
export const useUpdateAnnouncementMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.patch('/committee-service/Announcement/update', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      if (variables?.Id) {
        queryClient.invalidateQueries({ queryKey: ['announcement', variables.Id] });
      }
    },
  });
};

/**
 * Delete an announcement (soft delete)
 */
export const useDeleteAnnouncementMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => API.patch('/committee-service/Announcement/delete', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      if (variables?.Id) {
        queryClient.invalidateQueries({ queryKey: ['announcement', variables.Id] });
      }
    },
  });
};
