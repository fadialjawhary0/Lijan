import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, Clock, Edit, Trash2, MoreVertical } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import { DropdownMenu, DropdownMenuItem } from './DropdownMenu';
import useCountdown from '../../hooks/useCountdown';
import { formatDate, isMeetingActive } from '../../utils/dateUtils';
import { useCommittee } from '../../context/CommitteeContext';

const CommitteeCard = ({ committee, onEdit, onDelete }) => {
  const { t, i18n } = useTranslation('home');
  const navigate = useNavigate();
  const { setSelectedCommitteeId } = useCommittee();
  const isRTL = i18n.dir() === 'rtl';

  const meetingActive = committee.isMeetingActive || (committee.nextMeetingDate && isMeetingActive(committee.nextMeetingDate));

  const countdown = useCountdown(meetingActive ? null : committee.nextMeetingDate);

  const handleCardClick = e => {
    if (e.target.closest('button')) {
      return;
    }
    const committeeId = String(committee.id || committee.Id);
    setSelectedCommitteeId(committeeId);
    navigate('/overview');
  };

  const formatCountdown = () => {
    if (meetingActive) {
      return t('meetingInProgress');
    }

    if (!committee.nextMeetingDate || countdown.total === 0) {
      return t('noUpcomingMeeting');
    }

    const parts = [];
    if (countdown.weeks > 0) parts.push(`${countdown.weeks} ${t('weeks')}`);
    if (countdown.days > 0) parts.push(`${countdown.days} ${t('days')}`);
    if (countdown.hours > 0 && countdown.weeks === 0) parts.push(`${countdown.hours} ${t('hours')}`);
    if (countdown.minutes > 0 && countdown.weeks === 0 && countdown.days === 0) parts.push(`${countdown.minutes} ${t('minutes')}`);
    if (countdown.seconds > 0 && countdown.weeks === 0 && countdown.days === 0 && countdown.hours === 0) {
      parts.push(`${countdown.seconds} ${t('seconds')}`);
    }

    return parts.length > 0 ? parts.join(' ') : t('noUpcomingMeeting');
  };

  const getStatusBadgeClasses = () => {
    const status = committee?.status || (committee?.isActive ? 'active' : 'archived');
    switch (status) {
      case 'active':
        return 'bg-[var(--color-green-100)] text-[var(--color-green-500)]';
      case 'archived':
        return 'bg-[var(--color-gray-200)] text-[var(--color-gray-600)]';
      case 'inactive':
      case 'suspended':
        return 'bg-[var(--color-red-100)] text-[var(--color-red-500)]';
      default:
        return 'bg-[var(--color-gray-200)] text-[var(--color-gray-600)]';
    }
  };

  const getStatusLabel = () => {
    const status = committee?.status || (committee?.isActive !== false ? 'active' : 'archived');
    return t(`status.${status}`) || status;
  };

  return (
    <Card className="p-6 card-hover cursor-pointer min-h-[280px]" onClick={handleCardClick}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-text truncate flex-1">{isRTL ? committee.arabicName : committee.englishName}</h3>
              <DropdownMenu
                trigger={
                  <button
                    type="button"
                    className="p-1 hover:bg-surface-hover rounded-lg transition-colors text-text-muted hover:text-text cursor-pointer"
                    aria-label={t('actions')}
                  >
                    <MoreVertical size={18} className="cursor-pointer" />
                  </button>
                }
              >
                {onEdit && (
                  <DropdownMenuItem
                    onClick={e => {
                      e.stopPropagation();
                      onEdit(committee);
                    }}
                    className="hover:bg-transparent"
                  >
                    <Edit size={16} className="text-text-muted" />
                    <span>{t('edit')}</span>
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={e => {
                      e.stopPropagation();
                      onDelete(committee);
                    }}
                    className="text-destructive hover:bg-transparent"
                  >
                    <Trash2 size={16} />
                    <span>{t('delete')}</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenu>
            </div>
            <p className="text-xs text-text-muted mb-2">
              {t('committeeCreatedOn')} {formatDate(committee.formationDate)}
            </p>
            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getStatusBadgeClasses()}`}>{getStatusLabel()}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Users className="h-4 w-4 shrink-0" />
            <span>
              {committee.memberCount} {t('members')}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>
              {t('upcomingMeetings')}: {committee.upcomingMeetings || 0}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>
              {t('completedMeetings')}: {committee.completedMeetings || 0}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm min-h-[20px]">
            {committee.nextMeetingDate ? (
              <>
                <Clock className={`h-4 w-4 shrink-0 ${meetingActive ? 'text-accent' : 'text-text-muted'}`} />
                <span className={meetingActive ? 'text-accent font-medium' : 'text-text-muted'}>{formatCountdown()}</span>
              </>
            ) : (
              <div className="h-5" /> // Placeholder to maintain height
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto pt-4 border-t border-border" onClick={e => e.stopPropagation()}>
          <Button
            variant="primary"
            size="sm"
            onClick={e => {
              e.stopPropagation();
              handleCardClick(e);
            }}
            className="w-full"
          >
            {t('viewDetails')}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CommitteeCard;
