import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import { useBreadcrumbs } from '../../context';
import MeetingDetailsHeader from '../../features/MeetingsDetails/components/MeetingDetailsHeader';
import MeetingTabs from '../../features/MeetingsDetails/components/MeetingTabs';
import DetailsTab from '../../features/MeetingsDetails/components/DetailsTab/DetailsTab';
import AgendaTab from '../../features/MeetingsDetails/components/AgendaTab/AgendaTab';
import ParticipantsTab from '../../features/MeetingsDetails/components/ParticipantsTab/ParticipantsTab';
import AttachmentsTab from '../../features/MeetingsDetails/components/AttachmentsTab/AttachmentsTab';
import MinutesTab from '../../features/MeetingsDetails/components/MinutesTab/MinutesTab';
import DecisionsTab from '../../features/MeetingsDetails/components/DecisionsTab/DecisionsTab';
import TasksTab from '../../features/MeetingsDetails/components/TasksTab/TasksTab';
import VotesTab from '../../features/MeetingsDetails/components/VotesTab/VotesTab';
import { useGetMeetingByIdQuery } from '../../queries/meetings';

const MeetingsDetailsPage = () => {
  const { t, i18n } = useTranslation('meetingDetails');
  const { setBreadcrumbs } = useBreadcrumbs();
  const { meetingId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const isRTL = i18n.language === 'ar';

  const activeTab = searchParams.get('tab') || 'details';

  const { data: meetingResponse, isLoading } = useGetMeetingByIdQuery(meetingId);
  const meeting = meetingResponse?.data || meetingResponse?.Data || null;

  useEffect(() => {
    if (meeting) {
      setBreadcrumbs([
        { label: t('breadcrumbs.meetings'), href: '/meetings' },
        { label: isRTL ? meeting.arabicName : meeting.englishName, href: `/meetings/${meeting.id || meeting.Id}` },
      ]);
    }
  }, [setBreadcrumbs, i18n.language, t, meeting]);

  const handleTabChange = newTab => {
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      p.set('tab', newTab);
      return p;
    });
  };

  const renderTabContent = () => {
    if (!meeting) return null;

    switch (activeTab) {
      case 'details':
        return <DetailsTab meeting={meeting} />;
      case 'agenda':
        return <AgendaTab meeting={meeting} />;
      case 'participants':
        return <ParticipantsTab meeting={meeting} />;
      case 'attachments':
        return <AttachmentsTab meeting={meeting} />;
      case 'minutes':
        return <MinutesTab meeting={meeting} />;
      case 'decisions':
        return <DecisionsTab meeting={meeting} />;
      case 'tasks':
        return <TasksTab meeting={meeting} />;
      case 'votes':
        return <VotesTab meeting={meeting} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-1/2" />
        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="text-center py-12">
        <div className="text-text-muted text-lg">{t('meetingNotFound')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MeetingDetailsHeader meeting={meeting} />
      <MeetingTabs activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="min-h-0">{renderTabContent()}</div>
    </div>
  );
};

export default MeetingsDetailsPage;
