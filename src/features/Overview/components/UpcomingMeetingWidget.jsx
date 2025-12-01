import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Video, ExternalLink } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { formatDate, formatTime } from '../../../utils/dateUtils';

const UpcomingMeetingWidget = ({ meeting }) => {
  const { t, i18n } = useTranslation('overview');
  const navigate = useNavigate();
  const isRTL = i18n.dir() === 'rtl';

  if (!meeting) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted">{t('noUpcomingMeeting')}</p>
        </div>
      </Card>
    );
  }

  // Normalize meeting data (handle both camelCase and PascalCase)
  const meetingDate = meeting.date || meeting.Date;
  const startTime = meeting.startTime || meeting.StartTime;
  const endTime = meeting.endTime || meeting.EndTime;
  const englishName = meeting.englishName || meeting.EnglishName;
  const arabicName = meeting.arabicName || meeting.ArabicName;
  const link = meeting.link || meeting.Link;
  const meetingId = meeting.id || meeting.Id;

  // Determine if meeting is online (has link) or onsite
  const isOnline = !!link;

  // Calculate countdown using the same logic as OverviewPage (backend-style)
  const countdownText = useMemo(() => {
    if (!meetingDate) return '-';

    try {
      const now = new Date();
      const meetingDateTime = new Date(meetingDate);

      // Parse start time and add to date
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

        meetingDateTime.setHours(hours, minutes, 0, 0);
      } else {
        // Default to start of day if no time provided
        meetingDateTime.setHours(0, 0, 0, 0);
      }

      const diffMs = meetingDateTime.getTime() - now.getTime();

      if (diffMs <= 0) return '-';

      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      // Format similar to OverviewPage countdown logic
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
  }, [meetingDate, startTime, t]);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-text mb-1">{isRTL ? arabicName : englishName}</h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-text-muted">
              {meetingDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(meetingDate)}</span>
                </div>
              )}
              {startTime && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    {formatTime(startTime)}
                    {endTime && ` - ${formatTime(endTime)}`}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                <Video className="h-3 w-3" />
                <span>{t('online')}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 bg-surface-elevated text-text rounded-full text-xs font-medium">
                <MapPin className="h-3 w-3" />
                <span>{t('onsite')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Countdown */}
        <div className="flex items-center gap-2 p-3 bg-surface-elevated rounded-lg">
          <Clock className="h-5 w-5 text-brand" />
          <div>
            <p className="text-sm text-text-muted">{t('timeUntilMeeting')}</p>
            <p className="text-lg font-semibold text-text">{countdownText}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-border">
          {isOnline && link && (
            <Button variant="primary" size="sm" className="flex-1 cursor-pointer" onClick={() => window.open(link, '_blank')}>
              <Video className="h-4 w-4" />
              {t('joinMeeting')}
            </Button>
          )}
          {meetingId && (
            <Button variant="ghost" size="sm" className="cursor-pointer" onClick={() => navigate(`/meetings/${meetingId}`)}>
              {t('viewDetails')}
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default UpcomingMeetingWidget;
