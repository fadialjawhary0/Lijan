import React from 'react';
import { ArrowLeft, ArrowRight, Edit, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../../utils/dateUtils';

const MeetingDetailsHeader = ({ meeting }) => {
  const { t, i18n } = useTranslation('meetingDetails');
  const navigate = useNavigate();
  const isRTL = i18n.dir() === 'rtl';

  const handleBackClick = () => {
    navigate('/meetings');
  };

  const getStatusBadge = status => {
    if (!status) return null;

    const color = status.color || '#6c757d';
    const statusName = isRTL ? status.arabicName : status.englishName;

    return (
      <span
        className="inline-block px-2 py-1 rounded-full text-sm font-semibold border"
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

  if (!meeting) return null;

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={handleBackClick} className="p-2">
          {isRTL ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
        </Button>
        <div>
          <h1 className="max-w-[700px] text-base sm:text-lg md:text-2xl">{isRTL ? meeting.arabicName : meeting.englishName}</h1>
          <div className="flex items-start sm:items-center flex-col sm:flex-row gap-2 mt-2">
            {getStatusBadge(meeting.status)}
            <p className="text-text-muted text-sm sm:text-base">
              {formatDate(meeting.date)} • {meeting.startTime} - {meeting.endTime}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center flex-col sm:flex-row gap-2 space-x-2">
        <Button variant="outline">
          <Download className="h-4 w-4" />
          {t('export')}
        </Button>
        <Button variant="primary">
          <Edit className="h-4 w-4" />
          {t('edit')}
        </Button>
      </div>
    </div>
  );
};

export default MeetingDetailsHeader;

