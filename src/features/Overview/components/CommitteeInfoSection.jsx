import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Calendar, User, UserCheck, FileText } from 'lucide-react';
import Card from '../../../components/ui/Card';
import { formatDate } from '../../../utils/dateUtils';

const CommitteeInfoSection = ({ committeeInfo }) => {
  const { t, i18n } = useTranslation('overview');
  const isRTL = i18n.dir() === 'rtl';

  const getStatusBadgeClasses = () => {
    switch (committeeInfo?.status) {
      case 'active':
        return 'bg-green-500/10 border border-green-500 text-green-500 ';

      case 'archived':
        return 'bg-[var(--color-gray-200)] dark:bg-gray-700 text-[var(--color-gray-600)] dark:text-gray-300';
      case 'expired':
        return 'bg-[var(--color-red-100)] dark:bg-red-900/20 text-[var(--color-red-500)] dark:text-red-400';
      default:
        return 'bg-[var(--color-gray-200)] dark:bg-gray-700 text-[var(--color-gray-600)] dark:text-gray-300';
    }
  };

  const getStatusLabel = () => {
    return committeeInfo?.status ? t(`status.${committeeInfo.status}`) : 'N/A';
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-text mb-2">{isRTL ? committeeInfo?.arabicName : committeeInfo?.englishName}</h2>
            <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${getStatusBadgeClasses()}`}>{getStatusLabel()}</span>
          </div>
        </div>

        {/* Description */}
        {committeeInfo?.description && (
          <div>
            <p className="text-text-muted leading-relaxed">{isRTL ? committeeInfo?.arabicDescription : committeeInfo?.description}</p>
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Formation Date */}
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-brand shrink-0" />
            <div>
              <p className="text-sm text-text-muted">{t('formationDate')}</p>
              <p className="text-sm font-medium text-text">{formatDate(committeeInfo?.formationDate)}</p>
            </div>
          </div>

          {/* Total Members */}
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-brand shrink-0" />
            <div>
              <p className="text-sm text-text-muted">{t('totalMembers')}</p>
              <p className="text-sm font-medium text-text">{committeeInfo?.totalMembers || 0}</p>
            </div>
          </div>

          {/* Total Meetings */}
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-brand shrink-0" />
            <div>
              <p className="text-sm text-text-muted">{t('totalMeetings')}</p>
              <p className="text-sm font-medium text-text">{committeeInfo?.totalMeetings || 0}</p>
            </div>
          </div>

          {/* Chairperson */}
          {committeeInfo?.chairperson && (
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-brand shrink-0" />
              <div>
                <p className="text-sm text-text-muted">{t('chairperson')}</p>
                <p className="text-sm font-medium text-text">
                  {committeeInfo.chairperson.userInfo?.fullName || 
                   committeeInfo.chairperson.userInfo?.FullName || 
                   committeeInfo.chairperson.userInfo?.username ||
                   committeeInfo.chairperson.userInfo?.Username ||
                   (isRTL ? committeeInfo.chairperson.role?.arabicName : committeeInfo.chairperson.role?.englishName) ||
                   '-'}
                </p>
              </div>
            </div>
          )}

          {/* Vice Chairperson */}
          {committeeInfo?.viceChairperson && (
            <div className="flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-brand shrink-0" />
              <div>
                <p className="text-sm text-text-muted">{t('viceChairperson')}</p>
                <p className="text-sm font-medium text-text">
                  {committeeInfo.viceChairperson.userInfo?.fullName || 
                   committeeInfo.viceChairperson.userInfo?.FullName || 
                   committeeInfo.viceChairperson.userInfo?.username ||
                   committeeInfo.viceChairperson.userInfo?.Username ||
                   (isRTL ? committeeInfo.viceChairperson.role?.arabicName : committeeInfo.viceChairperson.role?.englishName) ||
                   '-'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CommitteeInfoSection;
