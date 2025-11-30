import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useBreadcrumbs } from '../../context';
import { useCommittee } from '../../context/CommitteeContext';
import { useGetAllMembersQuery } from '../../queries/members';
import { useCalendarEvents } from '../../hooks/useCalendarEvents';
import CalendarView from '../../features/Calendar/components/CalendarView';
import CalendarFilters from '../../features/Calendar/components/CalendarFilters';
import CalendarEventModal from '../../features/Calendar/components/CalendarEventModal';
import CalendarSync from '../../features/Calendar/components/CalendarSync';
import CalendarSkeleton from '../../components/skeletons/CalendarSkeleton';

const CalendarPage = () => {
  const { t, i18n } = useTranslation('calendar');
  const { setBreadcrumbs } = useBreadcrumbs();
  const { selectedCommitteeId } = useCommittee();

  const [view, setView] = useState('dayGridMonth');
  const [filters, setFilters] = useState({
    showMeetings: true,
    showTasks: true,
    showVotes: true,
    showNews: true,
    memberId: '',
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  useEffect(() => {
    setBreadcrumbs([{ label: t('title'), href: '/calendar' }]);
  }, [setBreadcrumbs, i18n.language, t]);

  // Fetch members for member filter
  const { data: membersData } = useGetAllMembersQuery(
    {
      CommitteeId: selectedCommitteeId ? parseInt(selectedCommitteeId) : undefined,
      IsActive: true,
      PageSize: 1000,
    },
    { enabled: !!selectedCommitteeId }
  );
  const members = membersData?.data || membersData?.Data || [];

  // Fetch calendar events
  const { events, isLoading } = useCalendarEvents(filters, {
    enabled: !!selectedCommitteeId,
  });

  const handleEventClick = event => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const handleViewChange = newView => {
    setView(newView);
  };

  const handleFilterChange = newFilters => {
    setFilters(newFilters);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-base sm:text-lg md:text-2xl font-semibold text-text">{t('title')}</h1>
        </div>

        {/* Calendar Skeleton */}
        <CalendarSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-base sm:text-lg md:text-2xl font-semibold text-text">{t('title')}</h1>
      </div>

      {/* Filters and Sync Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters */}
        <div className="lg:col-span-1 space-y-4">
          <CalendarFilters filters={filters} onFilterChange={handleFilterChange} members={members} />
          <CalendarSync events={events} />
        </div>

        {/* Calendar View */}
        <div className="lg:col-span-3">
          <CalendarView events={events} onEventClick={handleEventClick} view={view} onViewChange={handleViewChange} height="auto" />
        </div>
      </div>

      {/* Event Details Modal */}
      <CalendarEventModal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} event={selectedEvent} />
    </div>
  );
};

export default CalendarPage;
