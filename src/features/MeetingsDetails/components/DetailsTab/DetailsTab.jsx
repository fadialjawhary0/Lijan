import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, MapPin, Video, User, Link as LinkIcon, FileText } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import { formatDate } from '../../../../utils/dateUtils';

const DetailsTab = ({ meeting }) => {
  const { t, i18n } = useTranslation('meetingDetails');
  const isRTL = i18n.dir() === 'rtl';

  if (!meeting) return null;

  // Check if meeting type is physical
  const isPhysicalMeeting = meeting.meetingType?.englishName?.toLowerCase().includes('physical') || meeting.meetingType?.arabicName?.includes('حضوري');

  const getLocationDisplay = () => {
    if (meeting.link) {
      return (
        <div className="flex items-center gap-2 text-text mt-1">
          <Video className="h-4 w-4" />
          <span>{t('online')}</span>
        </div>
      );
    }

    if (meeting.location) {
      const locationName = isRTL ? meeting.location.arabicName : meeting.location.englishName;
      return (
        <div className="mt-1">
          <div className="flex items-center gap-2 text-text">
            <MapPin className="h-4 w-4" />
            <span>{locationName}</span>
          </div>
          {isPhysicalMeeting && (meeting.building || meeting.room) && (
            <div className="ml-6">
              {meeting.building && (
                <div className="text-sm text-text">
                  <span className="font-medium text-text-muted">{t('details.building')}: </span>
                  <span>{isRTL ? meeting.building.arabicName : meeting.building.englishName}</span>
                </div>
              )}
              {meeting.room && (
                <div className="text-sm text-text">
                  <span className="font-medium text-text-muted">{t('details.room')}: </span>
                  <span>{isRTL ? meeting.room.arabicName : meeting.room.englishName}</span>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-text mt-1">
        <MapPin className="h-4 w-4" />
        <span>-</span>
      </div>
    );
  };

  const getStatusBadge = () => {
    if (!meeting.status) return null;

    const color = meeting.status.color || '#6c757d';
    const statusName = isRTL ? meeting.status.arabicName : meeting.status.englishName;

    return (
      <span
        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border"
        style={{
          backgroundColor: `${color}20`,
          borderColor: color,
          color: color,
        }}
      >
        {statusName}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-text mb-4">{t('details.title')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-muted">{t('details.meetingTitle')}</label>
              <p className="text-text mt-1">{isRTL ? meeting.arabicName : meeting.englishName}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-text-muted">{t('details.meetingType')}</label>
              <p className="text-text mt-1">{meeting.meetingType ? (isRTL ? meeting.meetingType.arabicName : meeting.meetingType.englishName) : '-'}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-text-muted">{t('details.date')}</label>
              <div className="flex items-center gap-2 text-text mt-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(meeting.date)}</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-text-muted">{t('details.time')}</label>
              <div className="flex items-center gap-2 text-text mt-1">
                <Clock className="h-4 w-4" />
                <span>
                  {meeting.startTime} - {meeting.endTime}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-muted">{t('details.location')}</label>
              {getLocationDisplay()}
            </div>

            {meeting.link && (
              <div>
                <label className="text-sm font-medium text-text-muted">{t('details.meetingLink')}</label>
                <div className="flex items-center gap-2 text-text mt-1">
                  <LinkIcon className="h-4 w-4" />
                  <a href={meeting.link} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                    {meeting.link}
                  </a>
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-text-muted">{t('details.status')}</label>
              <div className="mt-1">{getStatusBadge()}</div>
            </div>

            <div>
              <label className="text-sm font-medium text-text-muted">{t('details.organizer')}</label>
              <div className="flex items-center gap-2 text-text mt-1">
                <User className="h-4 w-4" />
                <span>{meeting.createdByMember?.userInfo?.fullName || meeting.createdByMemberId || '-'}</span>
              </div>
            </div>

            {meeting.notes && (
              <div>
                <label className="text-sm font-medium text-text-muted">{t('details.notes')}</label>
                <div className="flex items-start gap-2 text-text mt-1">
                  <FileText className="h-4 w-4 mt-0.5" />
                  <p className="text-sm whitespace-pre-wrap">{meeting.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DetailsTab;
