import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, MoreVertical, Video, Play, FileText, Download, X, Calendar, MapPin, Clock, Users, FileCheck } from 'lucide-react';
import Card from '../../../components/ui/Card';
import { DropdownMenu, DropdownMenuItem } from '../../../components/ui/DropdownMenu';
import { formatDate, formatDateTime } from '../../../utils/dateUtils';
import TablePaginationRows from '../../../components/ui/TablePaginationRows';
import Pagination from '../../../components/ui/Pagination';
import EmptyState from '../../../components/ui/EmptyState';
import TableSkeleton from '../../../components/skeletons/TableSkeleton';
import { useCommittee } from '../../../context/CommitteeContext';

const MeetingsTable = ({
  meetings = [],
  isLoading = false,
  onEdit,
  onDelete,
  onCancel,
  onStartMeeting,
  onJoinMeeting,
  onPublishMinutes,
  onExport,
  page = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  totalCount = 0,
}) => {
  const { t, i18n } = useTranslation('meetings');
  const navigate = useNavigate();
  const { selectedCommitteeId } = useCommittee();
  const isRTL = i18n.dir() === 'rtl';

  const totalPages = Math.ceil(totalCount / pageSize);

  const getStatusBadge = status => {
    if (!status) return null;

    const color = status.color || '#6c757d';
    const statusName = isRTL ? status.arabicName : status.englishName;

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

  const getTypeBadge = meetingType => {
    if (!meetingType) return <span className="text-xs text-text-muted">-</span>;
    const typeName = isRTL ? meetingType.arabicName : meetingType.englishName;
    return <span className="text-xs text-text-muted">{typeName}</span>;
  };

  const getLocationDisplay = meeting => {
    if (meeting.link) {
      return (
        <div className="flex items-center gap-1 text-blue-500">
          <Video className="h-3 w-3" />
          <span className="text-xs">{t('online')}</span>
        </div>
      );
    }

    if (meeting.location) {
      const locationName = isRTL ? meeting.location.arabicName : meeting.location.englishName;
      return (
        <div className="flex items-center gap-1 text-text-muted">
          <MapPin className="h-3 w-3" />
          <span className="text-xs">{locationName}</span>
        </div>
      );
    }

    if (meeting.building && meeting.room) {
      const buildingName = isRTL ? meeting.building.arabicName : meeting.building.englishName;
      const roomName = isRTL ? meeting.room.arabicName : meeting.room.englishName;
      return (
        <div className="flex items-center gap-1 text-text-muted">
          <MapPin className="h-3 w-3" />
          <span className="text-xs">
            {buildingName} - {roomName}
          </span>
        </div>
      );
    }

    return <span className="text-xs text-text-muted">-</span>;
  };

  const handleView = meeting => {
    navigate(`/meetings/${meeting.id}`);
  };

  if (isLoading) {
    return (
      <Card className="bg-card-surface">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-border">
            <thead className="bg-surface-elevated border-b border-border">
              <tr>
                <th className={`px-4 py-3 text-left font-semibold text-text ${isRTL ? 'text-right' : 'text-left'}`}>{t('table.title')}</th>
                <th className={`px-4 py-3 text-left font-semibold text-text ${isRTL ? 'text-right' : 'text-left'}`}>{t('table.type')}</th>
                <th className={`px-4 py-3 text-left font-semibold text-text ${isRTL ? 'text-right' : 'text-left'}`}>{t('table.dateTime')}</th>
                <th className={`px-4 py-3 text-left font-semibold text-text ${isRTL ? 'text-right' : 'text-left'}`}>{t('table.location')}</th>
                <th className={`px-4 py-3 text-left font-semibold text-text ${isRTL ? 'text-right' : 'text-left'}`}>{t('table.status')}</th>
                <th className={`px-4 py-3 text-left font-semibold text-text ${isRTL ? 'text-right' : 'text-left'}`}>{t('table.metrics')}</th>
                <th className={`px-4 py-3 text-left font-semibold text-text ${isRTL ? 'text-right' : 'text-left'}`}>{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              <TableSkeleton columnNumbers={7} />
            </tbody>
          </table>
        </div>
      </Card>
    );
  }

  if (!meetings || meetings.length === 0) {
    return (
      <Card className="p-6">
        <EmptyState title={t('noMeetings')} message={t('noMeetingsDescription')} icon={Calendar} />
      </Card>
    );
  }

  return (
    <Card className="bg-card-surface">
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
          <thead className="bg-surface-elevated border-b border-border">
            <tr>
              <th className={`px-4 py-3 text-left font-semibold text-text whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>{t('table.title')}</th>
              <th className={`px-4 py-3 text-left font-semibold text-text whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>{t('table.type')}</th>
              <th className={`px-4 py-3 text-left font-semibold text-text whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>{t('table.dateTime')}</th>
              <th className={`px-4 py-3 text-left font-semibold text-text whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>{t('table.location')}</th>
              <th className={`px-4 py-3 text-left font-semibold text-text whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>{t('table.status')}</th>
              <th className={`px-4 py-3 text-left font-semibold text-text whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>{t('table.metrics')}</th>
              <th className={`px-4 py-3 text-left font-semibold text-text whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>{t('table.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {meetings.map(meeting => (
              <tr key={meeting.id} className="hover:bg-surface transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-text">{isRTL ? meeting.arabicName : meeting.englishName}</p>
                    {meeting.createdByMember?.userInfo?.fullName && (
                      <p className="text-xs text-text-muted mt-1">
                        {t('table.organizer')}: {meeting.createdByMember.userInfo.fullName}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">{getTypeBadge(meeting.meetingType)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-text-muted">
                    <Calendar className="h-3 w-3" />
                    <span className="text-xs">{formatDate(meeting.date)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-text-muted mt-1">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs">
                      {meeting.startTime} - {meeting.endTime}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">{getLocationDisplay(meeting)}</td>
                <td className="px-4 py-3">{getStatusBadge(meeting.status)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2 text-xs text-text-muted">
                    {/* Metrics can be added when API provides them */}
                    <span className="text-xs text-text-muted">-</span>
                  </div>
                </td>
                <td className="px-4 py-3">
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
                    <DropdownMenuItem
                      onClick={e => {
                        e.stopPropagation();
                        handleView(meeting);
                      }}
                      className="hover:bg-transparent"
                    >
                      <Eye size={16} className="text-text-muted" />
                      <span>{t('view')}</span>
                    </DropdownMenuItem>
                    {onEdit && (
                      <DropdownMenuItem
                        onClick={e => {
                          e.stopPropagation();
                          onEdit(meeting);
                        }}
                        className="hover:bg-transparent"
                      >
                        <Edit size={16} className="text-text-muted" />
                        <span>{t('edit')}</span>
                      </DropdownMenuItem>
                    )}
                    {meeting.link && meeting.status?.id === 1 && onJoinMeeting && (
                      <DropdownMenuItem
                        onClick={e => {
                          e.stopPropagation();
                          onJoinMeeting(meeting);
                        }}
                        className="hover:bg-transparent"
                      >
                        <Video size={16} className="text-text-muted" />
                        <span>{t('joinMeeting')}</span>
                      </DropdownMenuItem>
                    )}
                    {meeting.link && meeting.status?.id === 1 && onStartMeeting && (
                      <DropdownMenuItem
                        onClick={e => {
                          e.stopPropagation();
                          onStartMeeting(meeting);
                        }}
                        className="hover:bg-transparent"
                      >
                        <Play size={16} className="text-text-muted" />
                        <span>{t('startMeeting')}</span>
                      </DropdownMenuItem>
                    )}
                    {meeting.status?.id === 1 && onCancel && (
                      <DropdownMenuItem
                        onClick={e => {
                          e.stopPropagation();
                          onCancel(meeting);
                        }}
                        className="hover:bg-transparent"
                      >
                        <X size={16} className="text-text-muted" />
                        <span>{t('cancel')}</span>
                      </DropdownMenuItem>
                    )}
                    {onPublishMinutes && (
                      <DropdownMenuItem
                        onClick={e => {
                          e.stopPropagation();
                          onPublishMinutes(meeting);
                        }}
                        className="hover:bg-transparent"
                      >
                        <FileText size={16} className="text-text-muted" />
                        <span>{t('publishMinutes')}</span>
                      </DropdownMenuItem>
                    )}
                    {onExport && (
                      <DropdownMenuItem
                        onClick={e => {
                          e.stopPropagation();
                          onExport(meeting);
                        }}
                        className="hover:bg-transparent"
                      >
                        <Download size={16} className="text-text-muted" />
                        <span>{t('export')}</span>
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={e => {
                          e.stopPropagation();
                          onDelete(meeting);
                        }}
                        className="text-destructive hover:bg-transparent"
                      >
                        <Trash2 size={16} />
                        <span>{t('delete')}</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <TablePaginationRows pageSize={pageSize} handlePageSizeChange={onPageSizeChange} />
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      )}
    </Card>
  );
};

export default MeetingsTable;
