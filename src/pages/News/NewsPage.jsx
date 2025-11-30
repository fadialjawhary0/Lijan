import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useBreadcrumbs } from '../../context';
import { useCommittee } from '../../context/CommitteeContext';
import NewsHeader from '../../features/News/components/NewsHeader';
import NewsFilters from '../../features/News/components/NewsFilters';
import NewsCard from '../../features/News/components/NewsCard';
import { useGetAllAnnouncementsQuery, useGetAllCommitteesQuery, useGetAllCouncilsQuery } from '../../queries';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { Newspaper } from 'lucide-react';

const NewsPage = () => {
  const { t, i18n } = useTranslation('news');
  const { setBreadcrumbs } = useBreadcrumbs();
  const { selectedCommitteeId } = useCommittee();

  const [filters, setFilters] = useState({
    searchTerm: '',
    committeeId: undefined,
    councilId: undefined,
    isPublic: undefined,
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Fetch committees and councils for filters
  const { data: committeesData } = useGetAllCommitteesQuery({ Page: 1, PageSize: 100 });
  const { data: councilsData } = useGetAllCouncilsQuery({ Page: 1, PageSize: 100 });

  const committees = committeesData?.data || [];
  const councils = councilsData?.data || [];

  // Build query parameters
  const announcementsQueryParams = useMemo(() => {
    const params = {
      Page: page,
      PageSize: pageSize,
      SearchTerm: filters.searchTerm || undefined,
      CommitteeId: filters.committeeId || selectedCommitteeId ? parseInt(filters.committeeId || selectedCommitteeId) : undefined,
      CouncilId: filters.councilId ? parseInt(filters.councilId) : undefined,
      IsPublic: filters.isPublic !== undefined ? filters.isPublic : undefined,
    };

    // Remove undefined values
    Object.keys(params).forEach(key => {
      if (params[key] === undefined) {
        delete params[key];
      }
    });

    return params;
  }, [page, pageSize, filters, selectedCommitteeId]);

  const { data: announcementsData, isLoading: isLoadingAnnouncements, refetch: refetchAnnouncements } = useGetAllAnnouncementsQuery(announcementsQueryParams);

  const announcements = announcementsData?.data || [];
  const totalCount = announcementsData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  useEffect(() => {
    setBreadcrumbs([{ label: t('title') || 'News', href: '/news' }]);
  }, [setBreadcrumbs, i18n.language, t]);

  useEffect(() => {
    setPage(1);
  }, [filters.searchTerm, filters.committeeId, filters.councilId, filters.isPublic]);

  const handlePageChange = newPage => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = e => {
    setPage(1);
    setPageSize(parseInt(e.target.value));
  };

  return (
    <div className="space-y-6">
      <NewsHeader totalCount={totalCount} />

      {/* Filters */}
      <NewsFilters filters={filters} setFilters={setFilters} committees={committees} councils={councils} />

      {/* Loading State */}
      {isLoadingAnnouncements && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(pageSize)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-surface rounded-lg overflow-hidden">
                <div className="h-48 bg-surface-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-surface-muted rounded w-3/4" />
                  <div className="h-4 bg-surface-muted rounded w-full" />
                  <div className="h-4 bg-surface-muted rounded w-5/6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoadingAnnouncements && announcements.length === 0 && (
        <EmptyState
          icon={Newspaper}
          title={t('emptyState.title') || 'No announcements found'}
          description={t('emptyState.description') || 'There are no announcements to display at the moment.'}
        />
      )}

      {/* News Cards Grid */}
      {!isLoadingAnnouncements && announcements.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {announcements.map(announcement => (
              <NewsCard key={announcement.id || announcement.Id} announcement={announcement} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-muted">
                  {t('pagination.showing') || 'Showing'} {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, totalCount)} {t('pagination.of') || 'of'}{' '}
                  {totalCount}
                </span>
                <select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="px-3 py-1.5 border border-border rounded-lg bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value={6}>6 {t('pagination.perPage') || 'per page'}</option>
                  <option value={12}>12 {t('pagination.perPage') || 'per page'}</option>
                  <option value={24}>24 {t('pagination.perPage') || 'per page'}</option>
                  <option value={48}>48 {t('pagination.perPage') || 'per page'}</option>
                </select>
              </div>
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NewsPage;
