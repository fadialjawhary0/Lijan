import { useQuery } from '@tanstack/react-query';
import { API } from '../services/API';
import { buildQueryParams } from '../utils/queryParams';

export const useGetAllMeetingTypesQuery = (filters = {}, options = {}) => {
  const params = buildQueryParams(filters);

  return useQuery({
    queryKey: ['meetingTypes', params],
    queryFn: () => API.get('/committee-service/MeetingType', { params }),
    ...options,
  });
};

export const useGetMeetingTypeByIdQuery = (id, options = {}) => {
  return useQuery({
    queryKey: ['meetingType', id],
    queryFn: () => API.get('/committee-service/MeetingType/details', { params: { Id: id } }),
    enabled: !!id,
    ...options,
  });
};
