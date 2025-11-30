import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, Filter } from 'lucide-react';
import Card from '../../../components/ui/Card';
import { useDebounce } from '../../../hooks/useDebounce';

const NewsFilters = ({ filters, setFilters, committees = [], councils = [] }) => {
  const { t, i18n } = useTranslation('news');
  const isRTL = i18n.dir() === 'rtl';

  const [localSearchTerm, setLocalSearchTerm] = useState(filters.searchTerm || '');
  const [showFilters, setShowFilters] = useState(false);
  const debouncedSearchTerm = useDebounce(localSearchTerm, 500);

  useEffect(() => {
    setLocalSearchTerm(filters.searchTerm || '');
  }, [filters.searchTerm]);

  useEffect(() => {
    setFilters(prev => ({ ...prev, searchTerm: debouncedSearchTerm }));
  }, [debouncedSearchTerm, setFilters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value === 'all' ? undefined : value }));
  };

  const handleClearFilters = () => {
    setLocalSearchTerm('');
    setFilters({
      searchTerm: '',
      committeeId: undefined,
      councilId: undefined,
      isPublic: undefined,
    });
  };

  const hasActiveFilters =
    filters.searchTerm ||
    filters.committeeId !== undefined ||
    filters.councilId !== undefined ||
    filters.isPublic !== undefined;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className={`absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted ${isRTL ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            value={localSearchTerm}
            onChange={e => setLocalSearchTerm(e.target.value)}
            placeholder={t('filters.searchPlaceholder') || 'Search announcements...'}
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
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg bg-surface text-text hover:bg-surface-hover transition-colors"
        >
          <Filter className="h-4 w-4" />
          {t('filters.label') || 'Filters'}
          {hasActiveFilters && <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">!</span>}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Committee Filter */}
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">
                {t('filters.committee') || 'Committee'}
              </label>
              <select
                value={filters.committeeId || 'all'}
                onChange={e => handleFilterChange('committeeId', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent cursor-pointer"
              >
                <option value="all">{t('filters.all') || 'All'}</option>
                {committees.map(committee => (
                  <option key={committee.id || committee.Id} value={committee.id || committee.Id}>
                    {isRTL ? committee.arabicName || committee.name : committee.englishName || committee.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Council Filter */}
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">
                {t('filters.council') || 'Council'}
              </label>
              <select
                value={filters.councilId || 'all'}
                onChange={e => handleFilterChange('councilId', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent cursor-pointer"
              >
                <option value="all">{t('filters.all') || 'All'}</option>
                {councils.map(council => (
                  <option key={council.id || council.Id} value={council.id || council.Id}>
                    {isRTL ? council.arabicName || council.name : council.englishName || council.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Public/Private Filter */}
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">
                {t('filters.visibility') || 'Visibility'}
              </label>
              <select
                value={filters.isPublic !== undefined ? (filters.isPublic ? 'public' : 'private') : 'all'}
                onChange={e => {
                  const value = e.target.value;
                  handleFilterChange('isPublic', value === '' ? undefined : value === 'public');
                }}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent cursor-pointer"
              >
                <option value="all">{t('filters.all') || 'All'}</option>
                <option value="public">{t('filters.public') || 'Public'}</option>
                <option value="private">{t('filters.private') || 'Private'}</option>
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-muted hover:text-text transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
                {t('filters.clearAll') || 'Clear All'}
              </button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default NewsFilters;

