import { useQuery } from '@tanstack/react-query';
import { API } from '../services/API';

export const useGetCalendarEventsQuery = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: ['calendarEvents', filters],
    queryFn: () => API.get('/committee-service/Calendar', { params: filters }),
    ...options,
  });
};
