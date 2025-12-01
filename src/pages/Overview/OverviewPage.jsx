import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useBreadcrumbs } from '../../context';
import { useCommittee } from '../../context/CommitteeContext';
import { useGetCommitteeByIdQuery } from '../../queries/committees';
import { useGetAllMeetingsQuery } from '../../queries/meetings';
import { isApiResponseSuccessful } from '../../utils/apiResponseHandler';
import CommitteeInfoSection from '../../features/Overview/components/CommitteeInfoSection';
import OverviewKPISection from '../../features/Overview/components/OverviewKPISection';
import UpcomingMeetingWidget from '../../features/Overview/components/UpcomingMeetingWidget';
import ActivityTimeline from '../../features/Overview/components/ActivityTimeline';
import QuickActions from '../../features/Overview/components/QuickActions';
import { MOCK_ACTIVITIES } from '../../features/Overview/constants/overview.const';
import TableSkeleton from '../../components/skeletons/TableSkeleton';

const calculateNextMeetingCountdown = (nextMeetingDate, nextMeetingStartTime, t) => {
  if (!nextMeetingDate) return '-';

  try {
    const now = new Date();
    const meetingDate = new Date(nextMeetingDate);

    if (nextMeetingStartTime) {
      const timeParts = nextMeetingStartTime.split(':');
      if (timeParts.length >= 2) {
        meetingDate.setHours(parseInt(timeParts[0], 10), parseInt(timeParts[1], 10), 0, 0);
      }
    } else {
      meetingDate.setHours(0, 0, 0, 0);
    }

    const diffMs = meetingDate - now;

    if (diffMs <= 0) return '-';

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days} ${t('days')}, ${hours} ${t('hours')}`;
    } else if (hours > 0) {
      return `${hours} ${t('hours')}, ${minutes} ${t('minutes')}`;
    } else {
      return `${minutes} ${t('minutes')}`;
    }
  } catch (error) {
    console.error('Error calculating countdown:', error);
    return '-';
  }
};

const OverviewPage = () => {
  const { t, i18n } = useTranslation('overview');
  const { setBreadcrumbs } = useBreadcrumbs();
  const { selectedCommitteeId } = useCommittee();

  const { data: committeeResponse, isLoading: isLoadingCommittee } = useGetCommitteeByIdQuery(selectedCommitteeId ? parseInt(selectedCommitteeId) : null, {
    enabled: !!selectedCommitteeId,
  });

  // Fetch upcoming meetings for the selected committee
  const { data: meetingsResponse, isLoading: isLoadingMeetings } = useGetAllMeetingsQuery(
    {
      CommitteeId: selectedCommitteeId ? parseInt(selectedCommitteeId) : null,
      Page: 1,
      PageSize: 100,
    },
    { enabled: !!selectedCommitteeId }
  );

  useEffect(() => {
    setBreadcrumbs([{ label: t('title'), href: '/overview' }]);
  }, [setBreadcrumbs, i18n.language, t]);

  const committeeData = useMemo(() => {
    if (!isApiResponseSuccessful(committeeResponse)) return null;
    return committeeResponse?.data?.Data || committeeResponse?.data || null;
  }, [committeeResponse]);

  const committeeInfo = useMemo(() => {
    if (!committeeData) return null;

    return {
      englishName: committeeData.englishName || committeeData.EnglishName,
      arabicName: committeeData.arabicName || committeeData.ArabicName,
      status: committeeData.isActive ? 'active' : 'archived',
      formationDate: committeeData.formationDate || committeeData.FormationDate,
      totalMembers: committeeData.totalMembers || committeeData.TotalMembers || 0,
      totalMeetings: committeeData.totalMeetings || committeeData.TotalMeetings || 0,
      chairperson: committeeData.chairperson || committeeData.Chairperson,
      viceChairperson: committeeData.viceChairperson || committeeData.ViceChairperson,
    };
  }, [committeeData]);

  const kpis = useMemo(() => {
    if (!committeeData) return null;

    const nextMeetingDate = committeeData.nextMeetingDate || committeeData.NextMeetingDate;
    const nextMeetingStartTime = committeeData.nextMeetingStartTime || committeeData.NextMeetingStartTime;

    return {
      meetingsThisMonth: committeeData.meetingsThisMonth || committeeData.MeetingsThisMonth || 0,
      activeVotes: committeeData.activeVotes || committeeData.ActiveVotes || 0,
      tasksInProgress: committeeData.tasksInProgress || committeeData.TasksInProgress || 0,
      tasksOverdue: committeeData.tasksOverdue || committeeData.TasksOverdue || 0,
      nextMeetingCountdown: calculateNextMeetingCountdown(nextMeetingDate, nextMeetingStartTime, t),
    };
  }, [committeeData, t]);

  // Get the next upcoming meeting from the meetings list
  const upcomingMeeting = useMemo(() => {
    if (!isApiResponseSuccessful(meetingsResponse)) return null;

    // Handle different response structures
    const meetingsData = meetingsResponse?.data?.Data || meetingsResponse?.data || [];
    const meetings = Array.isArray(meetingsData) ? meetingsData : [];

    if (meetings.length === 0) return null;

    const now = new Date();

    // Helper function to get meeting datetime
    const getMeetingDateTime = meeting => {
      const date = meeting.date || meeting.Date;
      if (!date) return null;

      const meetingDate = new Date(date);
      if (isNaN(meetingDate.getTime())) return null;

      const startTime = meeting.startTime || meeting.StartTime;
      if (startTime) {
        let hours = 0;
        let minutes = 0;

        if (typeof startTime === 'string') {
          // Handle TimeSpan format "HH:MM:SS" or "HH:MM"
          const timeParts = startTime.split(':');
          if (timeParts.length >= 2) {
            hours = parseInt(timeParts[0], 10) || 0;
            minutes = parseInt(timeParts[1], 10) || 0;
          }
        } else if (typeof startTime === 'object') {
          // Handle object format { hours, minutes }
          hours = startTime.hours || 0;
          minutes = startTime.minutes || 0;
        }

        meetingDate.setHours(hours, minutes, 0, 0);
      } else {
        // If no time, set to start of day
        meetingDate.setHours(0, 0, 0, 0);
      }

      return meetingDate;
    };

    // Filter and find the next upcoming meeting
    const upcomingMeetings = meetings
      .map(meeting => ({
        meeting,
        datetime: getMeetingDateTime(meeting),
      }))
      .filter(({ datetime }) => datetime && datetime > now)
      .sort((a, b) => a.datetime - b.datetime);

    // Return the first (earliest) upcoming meeting
    return upcomingMeetings.length > 0 ? upcomingMeetings[0].meeting : null;
  }, [meetingsResponse]);

  const activities = MOCK_ACTIVITIES;

  // Quick actions with correct routes
  const quickActions = useMemo(
    () => [
      {
        id: 1,
        label: 'Create Meeting',
        arabicLabel: 'إنشاء اجتماع',
        icon: 'Calendar',
        route: '/meetings/create',
      },
      {
        id: 2,
        label: 'Add Member',
        arabicLabel: 'إضافة عضو',
        icon: 'UserPlus',
        route: '/members',
      },
      {
        id: 3,
        label: 'Create Task',
        arabicLabel: 'إنشاء مهمة',
        icon: 'CheckSquare',
        route: '/tasks/create',
      },
      {
        id: 4,
        label: 'Create Vote',
        arabicLabel: 'إنشاء تصويت',
        icon: 'FileCheck',
        route: '/voting/create',
      },
      {
        id: 5,
        label: 'View Decisions',
        arabicLabel: 'عرض القرارات',
        icon: 'FileText',
        route: '/decisions',
      },
    ],
    []
  );

  if (isLoadingCommittee || isLoadingMeetings) {
    return (
      <div className="space-y-6">
        <TableSkeleton rows={3} />
      </div>
    );
  }

  if (!committeeInfo || !kpis) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-text-muted">{t('noCommitteeSelected')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Committee Info Section */}
      <CommitteeInfoSection committeeInfo={committeeInfo} />

      {/* KPIs Section */}
      <OverviewKPISection kpis={kpis} />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Meeting Widget */}
        <UpcomingMeetingWidget meeting={upcomingMeeting} />

        {/* Quick Actions */}
        <QuickActions actions={quickActions} />
      </div>

      {/* Activity Timeline */}
      <ActivityTimeline activities={activities} />
    </div>
  );
};

export default OverviewPage;
