import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import { useDebounce } from '../../../hooks/useDebounce';
import { useGetAllDepartmentsQuery } from '../../../queries/departments';
import { useGetAllCommitteeTypesQuery } from '../../../queries/committeeTypes';
import { useGetAllCommitteeCategoriesQuery } from '../../../queries/committeeCategories';

const HomeFilters = ({ searchTerm, onSearchChange, filters, onFilterChange, onClearFilters, showFilters = false, onToggleFilters }) => {
  const { t, i18n } = useTranslation('home');
  const isRTL = i18n.dir() === 'rtl';
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const debouncedSearchTerm = useDebounce(localSearchTerm, 300);

  // Fetch filter options
  const { data: departmentsData } = useGetAllDepartmentsQuery({ page: 1, pageSize: 100 });
  const { data: typesData } = useGetAllCommitteeTypesQuery({ page: 1, pageSize: 100 });
  const { data: categoriesData } = useGetAllCommitteeCategoriesQuery({ page: 1, pageSize: 100 });

  const departments = departmentsData?.data || [];
  const types = typesData?.data || [];
  const categories = categoriesData?.data || [];

  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      onSearchChange(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const hasActiveFilters = filters.IsActive !== undefined || filters.DepartmentId || filters.TypeId || filters.CategoryId;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className={`absolute top-1/2 transform -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} text-text-muted`} size={18} />
          <input
            type="text"
            value={localSearchTerm}
            onChange={e => setLocalSearchTerm(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className={`w-full pl-10 pr-10 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
              isRTL ? 'text-right' : 'text-left'
            }`}
          />
          {localSearchTerm && (
            <button
              onClick={() => {
                setLocalSearchTerm('');
                onSearchChange('');
              }}
              className={`absolute top-1/2 transform -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'} text-text-muted hover:text-text`}
            >
              <X size={18} />
            </button>
          )}
        </div>
        <Button variant="outline" onClick={onToggleFilters} className="flex items-center gap-2">
          <Filter size={16} />
          {t('filtersLabel')}
          {hasActiveFilters && <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">!</span>}
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">{t('filters.status')}</label>
              <select
                value={filters.IsActive !== undefined ? (filters.IsActive ? 'active' : 'inactive') : ''}
                onChange={e => {
                  const value = e.target.value;
                  onFilterChange('IsActive', value === '' ? undefined : value === 'active');
                }}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">{t('filters.all')}</option>
                <option value="active">{t('status.active')}</option>
                <option value="inactive">{t('status.inactive')}</option>
              </select>
            </div>

            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">{t('filters.department')}</label>
              <select
                value={filters.DepartmentId || ''}
                onChange={e => onFilterChange('DepartmentId', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">{t('filters.all')}</option>
                {departments.map(dept => (
                  <option key={dept.id || dept.Id} value={dept.id || dept.Id}>
                    {i18n.language === 'ar' ? dept.arabicName || dept.ArabicName : dept.englishName || dept.EnglishName}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">{t('filters.type')}</label>
              <select
                value={filters.TypeId || ''}
                onChange={e => onFilterChange('TypeId', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">{t('filters.all')}</option>
                {types.map(type => (
                  <option key={type.id || type.Id} value={type.id || type.Id}>
                    {i18n.language === 'ar' ? type.arabicName || type.ArabicName : type.englishName || type.EnglishName}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">{t('filters.category')}</label>
              <select
                value={filters.CategoryId || ''}
                onChange={e => onFilterChange('CategoryId', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">{t('filters.all')}</option>
                {categories.map(category => (
                  <option key={category.id || category.Id} value={category.id || category.Id}>
                    {i18n.language === 'ar' ? category.arabicName || category.ArabicName : category.englishName || category.EnglishName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
              <Button variant="ghost" size="sm" onClick={onClearFilters}>
                <X size={16} />
                {t('clearFilters')}
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default HomeFilters;
