import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, CheckSquare, Vote, Newspaper, Users } from 'lucide-react';
import Card from '../../../components/ui/Card';

const CalendarFilters = ({ filters, onFilterChange, members = [] }) => {
  const { t, i18n } = useTranslation('calendar');
  const isRTL = i18n.dir() === 'rtl';

  const { showMeetings = true, showTasks = true, showVotes = true, showNews = true, memberId = '' } = filters;

  const handleToggle = filterType => {
    onFilterChange({
      ...filters,
      [filterType]: !filters[filterType],
    });
  };

  const handleMemberChange = e => {
    onFilterChange({
      ...filters,
      memberId: e.target.value,
    });
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-text mb-3">{t('filters.title')}</h3>

        {/* Event Type Filters */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-text-muted mb-2 block">{t('filters.eventTypes')}</label>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleToggle('showMeetings')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors cursor-pointer ${
                showMeetings
                  ? 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'bg-surface border-border text-text-muted hover:border-border-hover'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span className="text-sm">{t('filters.meetings')}</span>
            </button>

            <button
              onClick={() => handleToggle('showTasks')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors cursor-pointer ${
                showTasks
                  ? 'bg-green-500/10 border-green-500 text-green-600 dark:text-green-400'
                  : 'bg-surface border-border text-text-muted hover:border-border-hover'
              }`}
            >
              <CheckSquare className="h-4 w-4" />
              <span className="text-sm">{t('filters.tasks')}</span>
            </button>

            <button
              onClick={() => handleToggle('showVotes')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors cursor-pointer ${
                showVotes
                  ? 'bg-red-500/10 border-red-500 text-red-600 dark:text-red-400'
                  : 'bg-surface border-border text-text-muted hover:border-border-hover'
              }`}
            >
              <Vote className="h-4 w-4" />
              <span className="text-sm">{t('filters.votes')}</span>
            </button>

            <button
              onClick={() => handleToggle('showNews')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors cursor-pointer ${
                showNews
                  ? 'bg-yellow-500/10 border-yellow-500 text-yellow-600 dark:text-yellow-400'
                  : 'bg-surface border-border text-text-muted hover:border-border-hover'
              }`}
            >
              <Newspaper className="h-4 w-4" />
              <span className="text-sm">{t('filters.news')}</span>
            </button>
          </div>
        </div>

        {/* Member Filter */}
        {members.length > 0 && (
          <div>
            <label className="text-xs font-medium text-text-muted mb-2 block">{t('filters.member')}</label>
            <select
              value={memberId}
              onChange={handleMemberChange}
              className={`w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent cursor-pointer ${
                isRTL ? 'text-right' : 'text-left'
              }`}
            >
              <option value="">{t('filters.allMembers')}</option>
              {members.map(member => (
                <option key={member.id || member.Id} value={member.id || member.Id}>
                  {member.userInfo?.fullName || member.member?.userInfo?.fullName || `Member ${member.id || member.Id}`}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CalendarFilters;

