/**
 * Formats various entity types into FullCalendar event format
 */

export const formatCalendarEvents = ({ meetings = [], tasks = [], votes = [], announcements = [] }) => {
  const events = [];

  // Format meetings
  meetings.forEach(meeting => {
    const meetingId = meeting.id || meeting.Id;
    const date = meeting.date || meeting.Date;
    const startTime = meeting.startTime || meeting.StartTime;
    const endTime = meeting.endTime || meeting.EndTime;
    const englishName = meeting.englishName || meeting.EnglishName || '';
    const arabicName = meeting.arabicName || meeting.ArabicName || '';

    if (date) {
      try {
        // Format date properly (ensure it's in YYYY-MM-DD format)
        let dateStr;
        if (date instanceof Date) {
          dateStr = date.toISOString().split('T')[0];
        } else if (typeof date === 'string') {
          dateStr = date.split('T')[0];
        } else {
          return; // Skip invalid dates
        }

        // Format time properly (ensure HH:MM:SS format)
        const startTimeStr = startTime ? (startTime.includes(':') ? startTime : `${startTime}:00:00`).substring(0, 8) : null;
        const endTimeStr = endTime ? (endTime.includes(':') ? endTime : `${endTime}:00:00`).substring(0, 8) : null;

        const startDateTime = startTimeStr ? `${dateStr}T${startTimeStr}` : `${dateStr}T00:00:00`;
        const endDateTime = endTimeStr ? `${dateStr}T${endTimeStr}` : `${dateStr}T23:59:59`;

        events.push({
          id: `meeting-${meetingId}`,
          title: englishName || arabicName,
          start: startDateTime,
          end: endDateTime,
          allDay: !startTime && !endTime,
          backgroundColor: '#3b82f6', // Blue for meetings
          borderColor: '#2563eb',
          textColor: '#ffffff',
          extendedProps: {
            type: 'meeting',
            entityId: meetingId,
            entity: meeting,
          },
        });
      } catch (error) {
        console.warn('Error formatting meeting event:', error, meeting);
      }
    }
  });

  // Format tasks (due dates and start dates)
  tasks.forEach(task => {
    try {
      const taskId = task.id || task.Id;
      const startDate = task.startDate || task.StartDate;
      const endDate = task.endDate || task.EndDate;
      const englishName = task.englishName || task.EnglishName || '';
      const arabicName = task.arabicName || task.ArabicName || '';

      // Format dates properly
      const formatDate = date => {
        if (!date) return null;
        if (date instanceof Date) return date.toISOString().split('T')[0];
        if (typeof date === 'string') return date.split('T')[0];
        return null;
      };

      const formattedStartDate = formatDate(startDate);
      const formattedEndDate = formatDate(endDate);

      // Add due date event
      if (formattedEndDate) {
        events.push({
          id: `task-${taskId}-due`,
          title: `${englishName || arabicName} (Due)`,
          start: formattedEndDate,
          allDay: true,
          backgroundColor: '#10b981', // Green for tasks
          borderColor: '#059669',
          textColor: '#ffffff',
          extendedProps: {
            type: 'task',
            entityId: taskId,
            entity: task,
          },
        });
      }

      // Add start date event if different from end date
      if (formattedStartDate && formattedStartDate !== formattedEndDate) {
        events.push({
          id: `task-${taskId}-start`,
          title: `${englishName || arabicName} (Start)`,
          start: formattedStartDate,
          allDay: true,
          backgroundColor: '#34d399', // Lighter green for start dates
          borderColor: '#10b981',
          textColor: '#ffffff',
          extendedProps: {
            type: 'task',
            entityId: taskId,
            entity: task,
          },
        });
      }
    } catch (error) {
      console.warn('Error formatting task event:', error, task);
    }
  });

  // Format votes (deadlines)
  votes.forEach(vote => {
    try {
      const voteId = vote.id || vote.Id;
      const endDate = vote.endDate || vote.EndDate;
      const question = vote.question || vote.Question || '';

      if (endDate) {
        // Format date properly
        let dateStr;
        if (endDate instanceof Date) {
          dateStr = endDate.toISOString().split('T')[0];
        } else if (typeof endDate === 'string') {
          dateStr = endDate.split('T')[0];
        } else {
          return; // Skip invalid dates
        }

        events.push({
          id: `vote-${voteId}`,
          title: `${question} (Voting Deadline)`,
          start: dateStr,
          allDay: true,
          backgroundColor: '#ef4444', // Red for voting deadlines
          borderColor: '#dc2626',
          textColor: '#ffffff',
          extendedProps: {
            type: 'vote',
            entityId: voteId,
            entity: vote,
          },
        });
      }
    } catch (error) {
      console.warn('Error formatting vote event:', error, vote);
    }
  });

  // Format announcements/news (optional)
  announcements.forEach(announcement => {
    try {
      const announcementId = announcement.id || announcement.Id;
      const createdAt = announcement.createdAt || announcement.CreatedAt;
      const title = announcement.title || announcement.Title || '';

      if (createdAt) {
        // Format date properly
        let dateStr;
        if (createdAt instanceof Date) {
          dateStr = createdAt.toISOString().split('T')[0];
        } else if (typeof createdAt === 'string') {
          dateStr = createdAt.split('T')[0];
        } else {
          return; // Skip invalid dates
        }

        events.push({
          id: `announcement-${announcementId}`,
          title: title,
          start: dateStr,
          allDay: true,
          backgroundColor: '#fbbf24', // Yellow for news
          borderColor: '#f59e0b',
          textColor: '#000000',
          extendedProps: {
            type: 'announcement',
            entityId: announcementId,
            entity: announcement,
          },
        });
      }
    } catch (error) {
      console.warn('Error formatting announcement event:', error, announcement);
    }
  });

  return events;
};

