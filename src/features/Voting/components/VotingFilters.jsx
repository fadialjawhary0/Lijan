import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X } from 'lucide-react';
import Card from '../../../components/ui/Card';
import { useDebounce } from '../../../hooks/useDebounce';

const VotingFilters = ({
  searchTerm,
  setSearchTerm,
  meetingFilter,
  setMeetingFilter,
  statusFilter,
  setStatusFilter,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  meetings = [],
}) => {
  const { t, i18n } = useTranslation('voting');
  const isRTL = i18n.dir() === 'rtl';

  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const debouncedSearchTerm = useDebounce(localSearchTerm, 500);

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    setSearchTerm(debouncedSearchTerm);
  }, [debouncedSearchTerm, setSearchTerm]);

  const handleClearFilters = () => {
    setLocalSearchTerm('');
    setSearchTerm('');
    setMeetingFilter('all');
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = searchTerm || meetingFilter !== 'all' || statusFilter !== 'all' || dateFrom || dateTo;

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className={`absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted ${isRTL ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            value={localSearchTerm}
            onChange={e => setLocalSearchTerm(e.target.value)}
            placeholder={t('filters.searchPlaceholder')}
            className={`w-full pl-10 pr-10 py-2 border border-border rounded-lg bg-surface text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
              isRTL ? 'text-right' : 'text-left'
            }`}
          />
          {localSearchTerm && (
            <button
              onClick={() => {
                setLocalSearchTerm('');
                setSearchTerm('');
              }}
              className={`absolute top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text cursor-pointer ${isRTL ? 'left-3' : 'right-3'}`}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Meeting Filter */}
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">{t('filters.meeting')}</label>
            <select
              value={meetingFilter}
              onChange={e => setMeetingFilter(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent cursor-pointer"
            >
              <option value="all">{t('filters.allMeetings')}</option>
              {meetings.map(meeting => (
                <option key={meeting.id || meeting.Id} value={meeting.id || meeting.Id}>
                  {isRTL ? meeting.arabicName || meeting.ArabicName : meeting.englishName || meeting.EnglishName}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">{t('filters.status')}</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent cursor-pointer"
            >
              <option value="all">{t('filters.allStatuses')}</option>
              <option value="notStarted">{t('filters.notStarted')}</option>
              <option value="inProgress">{t('filters.inProgress')}</option>
              <option value="completed">{t('filters.completed')}</option>
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">{t('filters.dateFrom')}</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent cursor-pointer"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">{t('filters.dateTo')}</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent cursor-pointer"
            />
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="flex justify-end">
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-muted hover:text-text transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
              {t('filters.clearAll')}
            </button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default VotingFilters;

