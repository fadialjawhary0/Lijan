import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Plus, Building2, Users } from 'lucide-react';
import { useBreadcrumbs } from '../../context';
import KPISection from '../../features/Home/components/KPISection';
import CouncilsSection from '../../features/Home/components/CouncilsSection';
import StandaloneCommitteesSection from '../../features/Home/components/StandaloneCommitteesSection';
import HomeFilters from '../../features/Home/components/HomeFilters';
import { MOCK_KPIS } from '../../constants/committees.mock';
import { useToast } from '../../context/ToasterContext';
import Button from '../../components/ui/Button';
import DeleteDialog from '../../components/ui/DeleteDialog';
import { useGetAllCommitteesQuery, useDeleteCommitteeMutation } from '../../queries/committees';
import { useGetAllCouncilsQuery, useDeleteCouncilMutation } from '../../queries/council';
import { useAuth } from '../../context/AuthContext';
import { isApiResponseSuccessful, getApiErrorMessage } from '../../utils/apiResponseHandler';

const HomePage = () => {
  const { setBreadcrumbs } = useBreadcrumbs();
  const { t, i18n } = useTranslation('home');
  const { t: tCommon } = useTranslation('common');
  const toast = useToast();
  const navigate = useNavigate();
  const { userId } = useAuth();

  // State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(null);

  // Pagination
  const [councilsPage, setCouncilsPage] = useState(1);
  const [councilsPageSize] = useState(10);
  const [committeesPage, setCommitteesPage] = useState(1);
  const [committeesPageSize] = useState(12);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    IsActive: undefined,
    DepartmentId: undefined,
    TypeId: undefined,
    CategoryId: undefined,
  });

  // Queries
  const councilsQueryParams = {
    Page: councilsPage,
    PageSize: councilsPageSize,
    SearchTerm: searchTerm || undefined,
    IsActive: filters.IsActive,
    DepartmentId: filters.DepartmentId,
    UserId: userId || undefined,
  };

  // Get all committees, then filter client-side for standalone ones
  const committeesQueryParams = {
    Page: committeesPage,
    PageSize: committeesPageSize * 2, // Get more to account for filtering
    SearchTerm: searchTerm || undefined,
    // Don't filter by CouncilId - we'll filter client-side
    IsActive: filters.IsActive,
    DepartmentId: filters.DepartmentId,
    TypeId: filters.TypeId,
    CategoryId: filters.CategoryId,
    UserId: userId || undefined,
  };

  const {
    data: councilsData,
    isLoading: councilsLoading,
    refetch: refetchCouncils,
  } = useGetAllCouncilsQuery(councilsQueryParams, {
    enabled: !!userId,
  });

  const {
    data: committeesData,
    isLoading: committeesLoading,
    refetch: refetchCommittees,
  } = useGetAllCommitteesQuery(committeesQueryParams, {
    enabled: !!userId,
  });

  const deleteCommitteeMutation = useDeleteCommitteeMutation();
  const deleteCouncilMutation = useDeleteCouncilMutation();

  const councils = councilsData?.data || [];
  const allCommittees = committeesData?.data || [];

  // Extract committee IDs that belong to councils
  const councilCommitteeIds = new Set();
  councils.forEach(council => {
    const councilCommittees = council.Committees || council.committees || [];
    councilCommittees.forEach(committee => {
      councilCommitteeIds.add(committee.Id || committee.id);
    });
  });

  // Filter standalone committees (those not in any council)
  const standaloneCommittees = allCommittees.filter(
    committee => !councilCommitteeIds.has(committee.Id || committee.id) && !(committee.CouncilId || committee.councilId)
  );

  const councilsTotalCount = councilsData?.totalCount || 0;
  // Estimate total standalone committees (this is approximate since we're filtering client-side)
  const committeesTotalCount = standaloneCommittees.length;
  const councilsTotalPages = councilsData?.totalPages || 1;
  const committeesTotalPages = Math.ceil(committeesTotalCount / committeesPageSize) || 1;

  useEffect(() => {
    setBreadcrumbs([{ label: t('breadcrumbs.home'), href: '/' }]);
  }, [setBreadcrumbs, i18n.language, t]);

  // Handlers
  const handleCreateCouncil = () => {
    navigate('/councils/create');
  };

  const handleCreateCommittee = () => {
    navigate('/committees/create');
  };

  const handleEditCouncil = council => {
    navigate(`/councils/update/${council.Id || council.id}`);
  };

  const handleEditCommittee = committee => {
    navigate(`/committees/update/${committee.Id || committee.id}`);
  };

  const handleDeleteCouncil = council => {
    setItemToDelete(council);
    setDeleteType('council');
    setDeleteDialogOpen(true);
  };

  const handleDeleteCommittee = committee => {
    setItemToDelete(committee);
    setDeleteType('committee');
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete || !deleteType) return;

    const itemId = itemToDelete.Id || itemToDelete.id;
    const itemName = itemToDelete.EnglishName || itemToDelete.englishName || itemToDelete.ArabicName || itemToDelete.arabicName || t(deleteType);

    if (deleteType === 'council') {
      deleteCouncilMutation.mutate(
        { Id: parseInt(itemId) },
        {
          onSuccess: response => {
            if (isApiResponseSuccessful(response)) {
              toast.success(t('actions.deleteSuccess', { name: itemName }));
              setDeleteDialogOpen(false);
              setItemToDelete(null);
              setDeleteType(null);
              refetchCouncils();
            } else {
              const errorMessage = getApiErrorMessage(response, tCommon('error') || 'An error occurred');
              toast.error(errorMessage);
            }
          },
          onError: error => {
            console.error('Delete error:', error);
            toast.error(error.message || tCommon('error') || 'An error occurred');
          },
        }
      );
    } else {
      deleteCommitteeMutation.mutate(
        { Id: parseInt(itemId) },
        {
          onSuccess: response => {
            if (isApiResponseSuccessful(response)) {
              toast.success(t('actions.deleteSuccess', { name: itemName }));
              setDeleteDialogOpen(false);
              setItemToDelete(null);
              setDeleteType(null);
              refetchCommittees();
              refetchCouncils(); // Refresh councils too in case committee count changed
            } else {
              const errorMessage = getApiErrorMessage(response, tCommon('error') || 'An error occurred');
              toast.error(errorMessage);
            }
          },
          onError: error => {
            console.error('Delete error:', error);
            toast.error(error.message || tCommon('error') || 'An error occurred');
          },
        }
      );
    }
  };

  const handleCloseDeleteDialog = () => {
    if (!deleteCommitteeMutation.isPending && !deleteCouncilMutation.isPending) {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      setDeleteType(null);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCouncilsPage(1);
    setCommitteesPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      IsActive: undefined,
      DepartmentId: undefined,
      TypeId: undefined,
      CategoryId: undefined,
    });
    setSearchTerm('');
    setCouncilsPage(1);
    setCommitteesPage(1);
  };

  const handleSearchChange = value => {
    setSearchTerm(value);
    setCouncilsPage(1);
    setCommitteesPage(1);
  };

  const isLoading = councilsLoading || committeesLoading;
  const isDeleting = deleteCommitteeMutation.isPending || deleteCouncilMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-text mb-2">{t('title')}</h1>
        <p className="text-text-muted">{t('subtitle')}</p>
      </div>

      {/* KPIs */}
      <KPISection kpis={MOCK_KPIS} />

      {/* Filters */}
      <HomeFilters
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      {/* Councils Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold text-text">
              {t('councils')} ({councilsTotalCount})
            </h2>
          </div>
          <Button variant="primary" onClick={handleCreateCouncil}>
            <Plus className="h-4 w-4" />
            {t('createCouncil')}
          </Button>
        </div>
        <CouncilsSection
          councils={councils}
          isLoading={councilsLoading}
          onEdit={handleEditCouncil}
          onDelete={handleDeleteCouncil}
          onCommitteeEdit={handleEditCommittee}
          onCommitteeDelete={handleDeleteCommittee}
          pagination={{
            currentPage: councilsPage,
            totalPages: councilsTotalPages,
          }}
          onPageChange={setCouncilsPage}
        />
      </section>

      {/* Standalone Committees Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold text-text">
              {t('standaloneCommittees')} ({committeesTotalCount})
            </h2>
          </div>
          <Button variant="primary" onClick={handleCreateCommittee}>
            <Plus className="h-4 w-4" />
            {t('createCommittee')}
          </Button>
        </div>
        <StandaloneCommitteesSection
          committees={standaloneCommittees}
          isLoading={committeesLoading}
          onEdit={handleEditCommittee}
          onDelete={handleDeleteCommittee}
          pagination={{
            currentPage: committeesPage,
            totalPages: committeesTotalPages,
          }}
          onPageChange={setCommitteesPage}
        />
      </section>

      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title={tCommon('deleteDialog.title')}
        message={tCommon('deleteDialog.message')}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default HomePage;
