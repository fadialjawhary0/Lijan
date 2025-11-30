import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, MapPin, Video, ExternalLink } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import useCountdown from '../../../hooks/useCountdown';
import { formatDate } from '../../../utils/dateUtils';

const UpcomingMeetingWidget = ({ meeting }) => {
  const { t, i18n } = useTranslation('overview');
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

  const meetingDateTime = meeting.date && meeting.startTime ? `${meeting.date}T${meeting.startTime}` : null;
  const countdown = useCountdown(meetingDateTime);

  const formatCountdown = () => {
    if (!countdown || countdown.total === 0) {
      return t('meetingStartingSoon');
    }

    const parts = [];
    if (countdown.days > 0) parts.push(`${countdown.days} ${t('days')}`);
    if (countdown.hours > 0) parts.push(`${countdown.hours} ${t('hours')}`);
    if (countdown.minutes > 0 && countdown.days === 0) parts.push(`${countdown.minutes} ${t('minutes')}`);

    return parts.length > 0 ? parts.join(' ') : t('meetingStartingSoon');
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-text mb-1">
              {isRTL ? meeting.arabicName : meeting.englishName}
            </h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-text-muted">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(meeting.date)}</span>
              </div>
              {meeting.startTime && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    {meeting.startTime} - {meeting.endTime}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {meeting.status === 'online' ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">
                <Video className="h-3 w-3" />
                <span>{t('online')}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium">
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
            <p className="text-lg font-semibold text-text">{formatCountdown()}</p>
          </div>
        </div>

        {/* Agenda Preview */}
        {meeting.agenda && meeting.agenda.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-text mb-2">{t('agenda')}</h4>
            <ul className="space-y-2">
              {meeting.agenda.slice(0, 3).map(item => (
                <li key={item.id} className="flex items-start gap-2 text-sm text-text-muted">
                  <span className="text-brand mt-1">•</span>
                  <span>{isRTL ? item.arabicTitle : item.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-border">
          {meeting.status === 'online' && meeting.link && (
            <Button variant="primary" size="sm" className="flex-1 cursor-pointer" onClick={() => window.open(meeting.link, '_blank')}>
              <Video className="h-4 w-4" />
              {t('joinMeeting')}
            </Button>
          )}
          <Button variant="ghost" size="sm" className="cursor-pointer">
            {t('viewDetails')}
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default UpcomingMeetingWidget;

