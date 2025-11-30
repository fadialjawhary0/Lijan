import { createEvents } from 'ics';

/**
 * Export calendar events to ICS format
 * @param {Array} events - Array of calendar events
 * @param {string} filename - Name of the ICS file
 */
export const exportToICS = (events, filename = 'calendar.ics') => {
  if (!events || events.length === 0) {
    console.warn('No events to export');
    return null;
  }

  const icsEvents = events.map(event => {
    const startDate = new Date(event.start);
    const endDate = event.end ? new Date(event.end) : event.allDay ? new Date(startDate.getTime() + 24 * 60 * 60 * 1000) : new Date(startDate.getTime() + 60 * 60 * 1000);

    const description = event.extendedProps?.entity?.description || 
                       event.extendedProps?.entity?.Description || 
                       event.extendedProps?.entity?.question ||
                       event.extendedProps?.entity?.Question || '';

    const location = event.extendedProps?.entity?.meetingLocation?.englishName ||
                    event.extendedProps?.entity?.meetingLocation?.EnglishName ||
                    event.extendedProps?.entity?.location ||
                    event.extendedProps?.entity?.Location || '';

    return {
      title: event.title,
      description: description,
      location: location,
      start: event.allDay
        ? [startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate()]
        : [startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate(), startDate.getHours(), startDate.getMinutes()],
      end: event.allDay
        ? [endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate()]
        : [endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate(), endDate.getHours(), endDate.getMinutes()],
      status: 'CONFIRMED',
      busyStatus: 'BUSY',
    };
  });

  const { error, value } = createEvents(icsEvents);

  if (error) {
    console.error('Error creating ICS file:', error);
    return null;
  }

  // Create blob and download
  const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);

  return value;
};

/**
 * Export a single event to ICS format
 * @param {Object} event - Calendar event object
 * @param {string} filename - Name of the ICS file
 */
export const exportEventToICS = (event, filename = 'event.ics') => {
  return exportToICS([event], filename);
};

