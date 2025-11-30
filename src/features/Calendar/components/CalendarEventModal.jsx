import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import { Calendar, CheckSquare, Vote, Newspaper, ExternalLink, Clock, MapPin, Users } from 'lucide-react';
import { formatDate, formatDateTime } from '../../../utils/dateUtils';

const CalendarEventModal = ({ isOpen, onClose, event }) => {
  const { t, i18n } = useTranslation('calendar');
  const navigate = useNavigate();
  const isRTL = i18n.dir() === 'rtl';

  if (!event) return null;

  // Handle both FullCalendar event structure and our custom structure
  // FullCalendar may pass extendedProps or flatten the properties
  const extendedProps = event.extendedProps || {};
  const type = extendedProps.type || event.type;
  const entityId = extendedProps.entityId || event.entityId;
  const meetingId = extendedProps.meetingId || event.meetingId;
  const entity = extendedProps.entity || event.entity;

  const handleViewDetails = () => {
    if (!type || !entityId) {
      console.error('Missing event type or entityId:', event);
      return;
    }

    onClose();
    
    switch (type) {
      case 'meeting':
        navigate(`/meetings/${entityId}`);
        break;
      case 'task':
        // If task belongs to a meeting, navigate to meeting details with tasks tab
        // Otherwise, navigate to task update page
        if (meetingId) {
          navigate(`/meetings/${meetingId}?tab=tasks`);
        } else {
          navigate(`/tasks/update/${entityId}`);
        }
        break;
      case 'vote':
        // If vote belongs to a meeting, navigate to meeting details with votes tab
        // Otherwise, navigate to voting page
        if (meetingId) {
          navigate(`/meetings/${meetingId}?tab=votes`);
        } else {
          navigate(`/voting`);
        }
        break;
      case 'announcement':
        navigate(`/news/${entityId}`);
        break;
      default:
        console.warn('Unknown event type:', type);
        break;
    }
  };

  const getEventIcon = () => {
    switch (type) {
      case 'meeting':
        return <Calendar className="h-5 w-5" />;
      case 'task':
        return <CheckSquare className="h-5 w-5" />;
      case 'vote':
        return <Vote className="h-5 w-5" />;
      case 'announcement':
        return <Newspaper className="h-5 w-5" />;
      default:
        return <Calendar className="h-5 w-5" />;
    }
  };

  const getEventTypeLabel = () => {
    switch (type) {
      case 'meeting':
        return t('eventTypes.meeting');
      case 'task':
        return t('eventTypes.task');
      case 'vote':
        return t('eventTypes.vote');
      case 'announcement':
        return t('eventTypes.announcement');
      default:
        return t('eventTypes.event');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={event.title} size="md">
      <div className="space-y-4">
        {/* Event Type Badge */}
        <div className="flex items-center gap-2">
          {getEventIcon()}
          <span className="text-sm font-medium text-text-muted">{getEventTypeLabel()}</span>
        </div>

        {/* Event Details */}
        <div className="space-y-3">
          {/* Date/Time */}
          <div className="flex items-start gap-3">
            <Clock className="h-4 w-4 text-text-muted mt-0.5" />
            <div>
              <p className="text-sm font-medium text-text-muted">{t('eventDetails.dateTime')}</p>
              <p className="text-sm text-text">
                {event.allDay ? formatDate(event.start) : formatDateTime(event.start)}
                {event.end && !event.allDay && ` - ${formatDateTime(event.end)}`}
              </p>
            </div>
          </div>

          {/* Meeting-specific details */}
          {type === 'meeting' && entity && (
            <>
              {entity.meetingLocation && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-text-muted mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-text-muted">{t('eventDetails.location')}</p>
                    <p className="text-sm text-text">
                      {isRTL ? entity.meetingLocation?.arabicName || entity.meetingLocation?.ArabicName : entity.meetingLocation?.englishName || entity.meetingLocation?.EnglishName}
                    </p>
                  </div>
                </div>
              )}
              {entity.link && (
                <div className="flex items-start gap-3">
                  <ExternalLink className="h-4 w-4 text-text-muted mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-text-muted">{t('eventDetails.link')}</p>
                    <a href={entity.link} target="_blank" rel="noopener noreferrer" className="text-sm text-brand hover:underline">
                      {entity.link}
                    </a>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Task-specific details */}
          {type === 'task' && entity && (
            <>
              {entity.member && (
                <div className="flex items-start gap-3">
                  <Users className="h-4 w-4 text-text-muted mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-text-muted">{t('eventDetails.assignedTo')}</p>
                    <p className="text-sm text-text">
                      {entity.member?.userInfo?.fullName || entity.member?.member?.userInfo?.fullName || '-'}
                    </p>
                  </div>
                </div>
              )}
              {entity.percentageComplete !== undefined && entity.percentageComplete !== null && (
                <div className="flex items-start gap-3">
                  <CheckSquare className="h-4 w-4 text-text-muted mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-text-muted">{t('eventDetails.progress')}</p>
                    <p className="text-sm text-text">{entity.percentageComplete}%</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Vote-specific details */}
          {type === 'vote' && entity && (
            <>
              {entity.choices && (
                <div className="flex items-start gap-3">
                  <Vote className="h-4 w-4 text-text-muted mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-text-muted">{t('eventDetails.choices')}</p>
                    <p className="text-sm text-text">
                      {entity.choices.length || entity.Choices?.length || 0} {t('eventDetails.choiceCount')}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="ghost" onClick={onClose}>
            {t('close')}
          </Button>
          <Button variant="primary" onClick={handleViewDetails}>
            {t('viewDetails')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CalendarEventModal;

