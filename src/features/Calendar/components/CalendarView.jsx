import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import Card from '../../../components/ui/Card';

const CalendarView = ({ events, onEventClick, view, onViewChange, height = 'auto' }) => {
  const { t, i18n } = useTranslation('calendar');
  const calendarRef = useRef(null);
  const isRTL = i18n.dir() === 'rtl';

  useEffect(() => {
    if (calendarRef.current && view) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView(view);
    }
  }, [view]);

  const handleEventClick = info => {
    if (onEventClick) {
      onEventClick({
        id: info.event.id,
        title: info.event.title,
        start: info.event.start,
        end: info.event.end,
        allDay: info.event.allDay,
        ...info.event.extendedProps,
      });
    }
  };

  const handleViewChange = info => {
    if (onViewChange) {
      onViewChange(info.view.type);
    }
  };

  return (
    <Card className="p-4">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView={view || 'dayGridMonth'}
        events={events}
        eventClick={handleEventClick}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
        }}
        buttonText={{
          today: t('buttons.today'),
          month: t('buttons.month'),
          week: t('buttons.week'),
          day: t('buttons.day'),
          list: t('buttons.list'),
        }}
        height={height}
        locale={isRTL ? 'ar' : 'en'}
        direction={isRTL ? 'rtl' : 'ltr'}
        firstDay={isRTL ? 6 : 0} // Saturday for Arabic, Sunday for English
        weekNumbers={false}
        weekNumberCalculation="ISO"
        dayHeaderFormat={{ weekday: 'short' }}
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          meridiem: 'short',
        }}
        views={{
          dayGridMonth: {
            dayHeaderFormat: { weekday: 'short' },
          },
          timeGridWeek: {
            slotMinTime: '00:00:00',
            slotMaxTime: '24:00:00',
          },
          timeGridDay: {
            slotMinTime: '00:00:00',
            slotMaxTime: '24:00:00',
          },
        }}
        eventDisplay="block"
        eventTextColor="#ffffff"
        nowIndicator={true}
        dayMaxEvents={true}
        moreLinkClick="popover"
        eventDidMount={info => {
          // Add custom styling or tooltips
          info.el.setAttribute('title', info.event.title);
        }}
        datesSet={handleViewChange}
        className="calendar-container"
      />
    </Card>
  );
};

export default CalendarView;

