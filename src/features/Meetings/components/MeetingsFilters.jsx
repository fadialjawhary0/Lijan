import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X } from 'lucide-react';
import Card from '../../../components/ui/Card';
import { useDebounce } from '../../../hooks/useDebounce';

const MeetingsFilters = ({ filters, setFilters, types = [], statuses = [], organizers = [] }) => {
  const { t, i18n } = useTranslation('meetings');
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
      typeFilter: 'all',
      statusFilter: 'all',
      organizerFilter: 'all',
      locationFilter: 'all',
      dateFrom: '',
      dateTo: '',
    });
  };

  const hasActiveFilters =
    filters.searchTerm ||
    filters.typeFilter !== 'all' ||
    filters.statusFilter !== 'all' ||
    filters.organizerFilter !== 'all' ||
    filters.locationFilter !== 'all' ||
    filters.dateFrom ||
    filters.dateTo;

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
                setFilters(prev => ({ ...prev, searchTerm: '' }));
              }}
              className={`absolute top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text cursor-pointer ${isRTL ? 'left-3' : 'right-3'}`}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">{t('filters.type')}</label>
            <select
              value={filters.typeFilter || 'all'}
              onChange={e => handleFilterChange('typeFilter', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent cursor-pointer"
            >
              <option value="all">{t('filters.allTypes')}</option>
              {types.map(type => (
                <option key={type.id} value={type.id}>
                  {isRTL ? type.arabicName : type.englishName}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">{t('filters.status')}</label>
            <select
              value={filters.statusFilter || 'all'}
              onChange={e => handleFilterChange('statusFilter', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent cursor-pointer"
            >
              <option value="all">{t('filters.allStatuses')}</option>
              {statuses.map(status => (
                <option key={status.id} value={status.id}>
                  {isRTL ? status.arabicName : status.englishName}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">{t('filters.location')}</label>
            <select
              value={filters.locationFilter || 'all'}
              onChange={e => handleFilterChange('locationFilter', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent cursor-pointer"
            >
              <option value="all">{t('filters.allLocations')}</option>
              <option value="online">{t('online')}</option>
              <option value="onsite">{t('onsite')}</option>
            </select>
          </div>

          {/* Organizer Filter */}
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">{t('filters.organizer')}</label>
            <select
              value={filters.organizerFilter || 'all'}
              onChange={e => handleFilterChange('organizerFilter', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent cursor-pointer"
            >
              <option value="all">{t('filters.allOrganizers')}</option>
              {organizers.map(organizer => (
                <option key={organizer.id} value={organizer.id}>
                  {organizer.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">{t('filters.dateFrom')}</label>
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={e => handleFilterChange('dateFrom', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent cursor-pointer"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">{t('filters.dateTo')}</label>
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={e => handleFilterChange('dateTo', e.target.value)}
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

export default MeetingsFilters;
