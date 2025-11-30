import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X } from 'lucide-react';
import { useDebounce } from '../../../../hooks/useDebounce';

const TasksFilters = ({ filters, setFilters, taskStatuses = [], agendaItems = [], members = [], committeeId }) => {
  const { t, i18n } = useTranslation('meetingDetails');
  const isRTL = i18n.dir() === 'rtl';

  const [localSearchTerm, setLocalSearchTerm] = useState(filters.searchTerm || '');
  const debouncedSearchTerm = useDebounce(localSearchTerm, 500);

  useEffect(() => {
    setLocalSearchTerm(filters.searchTerm || '');
  }, [filters.searchTerm]);

  useEffect(() => {
    setFilters(prev => ({ ...prev, searchTerm: debouncedSearchTerm }));
  }, [debouncedSearchTerm, setFilters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setLocalSearchTerm('');
    setFilters({
      searchTerm: '',
      statusId: '',
      agendaItemId: '',
      memberId: '',
    });
  };

  const hasActiveFilters =
    filters.searchTerm ||
    filters.statusId ||
    filters.agendaItemId ||
    filters.memberId;

  return (
    <div className="mb-4 space-y-3">
      {/* Search Box */}
      <div className="relative">
        <Search className={`absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted ${isRTL ? 'right-3' : 'left-3'}`} />
        <input
          type="text"
          value={localSearchTerm}
          onChange={e => setLocalSearchTerm(e.target.value)}
          placeholder={t('tasks.searchPlaceholder') || 'Search tasks...'}
          className={`w-full pl-10 pr-10 py-2 border border-border rounded-lg bg-surface text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
            isRTL ? 'text-right' : 'text-left'
          }`}
        />
        {localSearchTerm && (
          <button
            onClick={() => {
              setLocalSearchTerm('');
              setFilters(prev => ({ ...prev, searchTerm: '' }));
            }}
            className={`absolute top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text cursor-pointer ${isRTL ? 'left-3' : 'right-3'}`}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status Filter */}
        <div className="flex-1 min-w-[150px]">
          <select
            value={filters.statusId || ''}
            onChange={e => handleFilterChange('statusId', e.target.value)}
            className={`w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent cursor-pointer ${
              isRTL ? 'text-right' : 'text-left'
            }`}
          >
            <option value="">{t('tasks.filters.allStatuses') || 'All Statuses'}</option>
            {taskStatuses.map(status => (
              <option key={status.id || status.Id} value={status.id || status.Id}>
                {isRTL ? status.arabicName : status.englishName}
              </option>
            ))}
          </select>
        </div>

        {/* Agenda Item Filter */}
        <div className="flex-1 min-w-[150px]">
          <select
            value={filters.agendaItemId || ''}
            onChange={e => handleFilterChange('agendaItemId', e.target.value)}
            className={`w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent cursor-pointer ${
              isRTL ? 'text-right' : 'text-left'
            }`}
          >
            <option value="">{t('tasks.filters.allAgendaItems') || 'All Agenda Items'}</option>
            {agendaItems.map(item => (
              <option key={item.id || item.Id} value={item.id || item.Id}>
                {item.sentence || item.Sentence || `Agenda Item ${item.id || item.Id}`}
              </option>
            ))}
          </select>
        </div>

        {/* Member Filter */}
        <div className="flex-1 min-w-[150px]">
          <select
            value={filters.memberId || ''}
            onChange={e => handleFilterChange('memberId', e.target.value)}
            className={`w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent cursor-pointer ${
              isRTL ? 'text-right' : 'text-left'
            }`}
            disabled={!committeeId}
          >
            <option value="">{t('tasks.filters.allMembers') || 'All Members'}</option>
            {members.map(member => (
              <option key={member.id || member.Id} value={member.id || member.Id}>
                {member.userInfo?.fullName || member.member?.userInfo?.fullName || `Member ${member.id || member.Id}`}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-2 px-3 py-2 text-sm text-text-muted hover:text-text transition-colors"
          >
            <X className="h-4 w-4" />
            <span>{t('tasks.filters.clear') || 'Clear Filters'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default TasksFilters;

