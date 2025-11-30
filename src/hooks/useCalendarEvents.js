import { useMemo } from 'react';
// import { useGetAllMeetingsQuery } from '../queries/meetings';
// import { useGetAllTasksQuery } from '../queries/tasks';
// import { useGetAllMeetingVotesQuery } from '../queries/votes';
// import { useGetAllAnnouncementsQuery } from '../queries/announcements';
import { useCommittee } from '../context/CommitteeContext';
// import { formatCalendarEvents } from '../utils/calendarEventFormatter';
import { useGetCalendarEventsQuery } from '../queries/calendar';

/**
 * Custom hook to fetch and format all calendar events
 * @param {Object} filters - Event type filters
 * @param {Object} options - React Query options
 */
export const useCalendarEvents = (filters = {}, options = {}) => {
  const { selectedCommitteeId } = useCommittee();

  const { showMeetings = true, showTasks = true, showVotes = true, showNews = true, memberId } = filters;

  // // Fetch meetings
  // const { data: meetingsData, isLoading: isLoadingMeetings } = useGetAllMeetingsQuery(
  //   {
  //     CommitteeId: selectedCommitteeId ? parseInt(selectedCommitteeId) : undefined,
  //     PageSize: 1000,
  //   },
  //   { enabled: !!selectedCommitteeId && showMeetings, ...options }
  // );

  // // Fetch tasks
  // const { data: tasksData, isLoading: isLoadingTasks } = useGetAllTasksQuery(
  //   {
  //     CommitteeId: selectedCommitteeId ? parseInt(selectedCommitteeId) : undefined,
  //     MemberId: memberId ? parseInt(memberId) : undefined,
  //     PageSize: 1000,
  //   },
  //   { enabled: !!selectedCommitteeId && showTasks, ...options }
  // );

  // // Fetch votes
  // const { data: votesData, isLoading: isLoadingVotes } = useGetAllMeetingVotesQuery(
  //   {
  //     CommitteeId: selectedCommitteeId ? parseInt(selectedCommitteeId) : undefined,
  //     PageSize: 1000,
  //   },
  //   { enabled: !!selectedCommitteeId && showVotes, ...options }
  // );

  // // Fetch announcements/news
  // const { data: announcementsData, isLoading: isLoadingAnnouncements } = useGetAllAnnouncementsQuery(
  //   {
  //     CommitteeId: selectedCommitteeId ? parseInt(selectedCommitteeId) : undefined,
  //     PageSize: 1000,
  //   },
  //   { enabled: !!selectedCommitteeId && showNews, ...options }
  // );

  // Use the unified calendar API endpoint
  const { data: calendarEventsData, isLoading: isLoadingCalendarEvents } = useGetCalendarEventsQuery(
    {
      CommitteeId: selectedCommitteeId ? parseInt(selectedCommitteeId) : undefined,
      MemberId: memberId ? parseInt(memberId) : undefined,
      IncludeMeetings: showMeetings,
      IncludeTasks: showTasks,
      IncludeVotes: showVotes,
      IncludeAnnouncements: showNews,
    },
    { enabled: !!selectedCommitteeId, ...options }
  );

  // The API returns CalendarEventDTO which is already formatted for FullCalendar
  const events = useMemo(() => {
    const apiData = calendarEventsData?.data || calendarEventsData?.Data || [];
    // Map the API response to FullCalendar format (API already returns correct format)
    return apiData.map(event => {
      const type = event.type || event.Type || '';
      const entityId = event.entityId || event.EntityId;
      const meetingId = event.meetingId || event.MeetingId;
      
      // Extract entityId from id if it's in format "type-id" or "type-id-suffix"
      let extractedEntityId = entityId;
      if (!extractedEntityId && event.id) {
        const idStr = event.id || event.Id || '';
        const match = idStr.match(/(?:meeting|task|vote|announcement)-(\d+)/);
        if (match) {
          extractedEntityId = parseInt(match[1]);
        }
      }
      
      // Extract type from id if not present
      let extractedType = type;
      if (!extractedType && event.id) {
        const idStr = event.id || event.Id || '';
        if (idStr.startsWith('meeting-')) extractedType = 'meeting';
        else if (idStr.startsWith('task-')) extractedType = 'task';
        else if (idStr.startsWith('vote-')) extractedType = 'vote';
        else if (idStr.startsWith('announcement-')) extractedType = 'announcement';
      }
      
      return {
        id: event.id || event.Id,
        title: event.title || event.Title,
        start: event.start || event.Start,
        end: event.end || event.End,
        allDay: event.allDay || event.AllDay,
        backgroundColor: event.backgroundColor || event.BackgroundColor,
        borderColor: event.borderColor || event.BorderColor,
        textColor: event.textColor || event.TextColor,
        extendedProps: {
          type: extractedType,
          entityId: extractedEntityId,
          meetingId: meetingId,
        },
      };
    });
  }, [calendarEventsData]);

  // const meetings = meetingsData?.data || meetingsData?.Data || [];
  // const tasks = tasksData?.data || tasksData?.Data || [];
  // const votes = votesData?.data || votesData?.Data || [];
  // const announcements = announcementsData?.data || announcementsData?.Data || [];

  // Format all events for FullCalendar
  // const events = useMemo(() => {
  //   return formatCalendarEvents({
  //     meetings: showMeetings ? meetings : [],
  //     tasks: showTasks ? tasks : [],
  //     votes: showVotes ? votes : [],
  //     announcements: showNews ? announcements : [],
  //   });
  // }, [meetings, tasks, votes, announcements, showMeetings, showTasks, showVotes, showNews]);

  // const isLoading = isLoadingMeetings || isLoadingTasks || isLoadingVotes || isLoadingAnnouncements;

  return {
    events,
    isLoading: isLoadingCalendarEvents,
    rawData: {
      // meetings,
      // tasks,
      // votes,
      // announcements,
    },
  };
};
