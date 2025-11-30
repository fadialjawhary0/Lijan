import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useBreadcrumbs } from '../../context';
import { useCommittee } from '../../context/CommitteeContext';
import MembersHeader from '../../features/Members/components/MembersHeader';
import MembersFilters from '../../features/Members/components/MembersFilters';
import MembersTable from '../../features/Members/components/MembersTable';
import AddMemberModal from '../../features/Members/components/AddMemberModal';
import DeleteDialog from '../../components/ui/DeleteDialog';
import { useToast } from '../../context/ToasterContext';
import { useGetAllMembersQuery, useGetAllRolesQuery, useDeleteMemberMutation } from '../../queries';
import { isApiResponseSuccessful, getApiErrorMessage } from '../../utils/apiResponseHandler';
import { MEMBER_STATUS } from '../../constants';

const MembersPage = () => {
  const { t, i18n } = useTranslation('members');
  const { t: tCommon } = useTranslation('common');
  const { setBreadcrumbs } = useBreadcrumbs();
  const { selectedCommitteeId } = useCommittee();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [memberToEdit, setMemberToEdit] = useState(null);

  // Fetch members and roles
  const membersQueryParams = {
    CommitteeId: selectedCommitteeId ? parseInt(selectedCommitteeId) : undefined,
    Page: page,
    PageSize: pageSize,
    SearchTerm: searchTerm || undefined,
    RoleId: roleFilter !== 'all' ? parseInt(roleFilter) : undefined,
    IsActive: statusFilter !== 'all' ? statusFilter === MEMBER_STATUS?.[1]?.id.toString() : undefined,
  };

  const {
    data: membersData,
    isLoading: isLoadingMembers,
    refetch: refetchMembers,
  } = useGetAllMembersQuery(membersQueryParams, { enabled: !!selectedCommitteeId });

  const { data: rolesData } = useGetAllRolesQuery({});
  const deleteMemberMutation = useDeleteMemberMutation();

  const allMembers = membersData?.data || [];
  const roles = rolesData?.data || [];
  const totalCount = membersData?.totalCount || 0;

  useEffect(() => {
    setBreadcrumbs([{ label: t('title'), href: '/members' }]);
  }, [setBreadcrumbs, i18n.language, t]);

  const filteredMembers = useMemo(() => {
    let filtered = [...allMembers];

    return filtered;
  }, [statusFilter, allMembers]);

  const paginatedMembers = filteredMembers;

  const handlePageChange = newPage => {
    setPage(newPage);
  };

  const handlePageSizeChange = e => {
    setPage(1);
    setPageSize(parseInt(e.target.value));
  };

  useEffect(() => {
    setPage(1);
  }, [searchTerm, roleFilter]);

  const handleAddMember = () => {
    setIsAddModalOpen(true);
  };

  const handleSaveMember = async memberData => {
    await refetchMembers();
    setIsAddModalOpen(false);
    setMemberToEdit(null);
  };

  const handleEdit = member => {
    setMemberToEdit(member);
    setIsAddModalOpen(true);
  };

  const handleDelete = member => {
    setMemberToDelete(member);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!memberToDelete) return;

    const memberId = memberToDelete.id || memberToDelete.Id;
    const memberName = memberToDelete.userInfo?.fullName || t('member');

    deleteMemberMutation.mutate(
      { Id: parseInt(memberId) },
      {
        onSuccess: response => {
          if (isApiResponseSuccessful(response)) {
            toast.success(t('removeSuccess', { name: memberName }));
            setDeleteDialogOpen(false);
            setMemberToDelete(null);
            refetchMembers();
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
  };

  const handleRoleChange = member => {
    console.log('Changing role for member:', member);
    toast.info(t('changeRoleInfo'));
  };

  return (
    <div className="space-y-6">
      <MembersHeader totalCount={totalCount} onAddMember={handleAddMember} />

      {!selectedCommitteeId ? (
        <div className="text-center py-12">
          <p className="text-text-muted">{t('noCommitteeSelected') || 'Please select a committee first'}</p>
        </div>
      ) : (
        <>
          <MembersFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            roleFilter={roleFilter}
            setRoleFilter={setRoleFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            roles={roles}
          />

          <MembersTable
            members={paginatedMembers}
            isLoading={isLoadingMembers}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRoleChange={handleRoleChange}
            page={page}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            totalCount={totalCount}
          />

          {/* Add/Edit Member Modal */}
          <AddMemberModal
            isOpen={isAddModalOpen}
            onClose={() => {
              setIsAddModalOpen(false);
              setMemberToEdit(null);
            }}
            onSave={handleSaveMember}
            roles={roles}
            users={[]}
          />

          {/* Delete Dialog */}
          <DeleteDialog
            isOpen={deleteDialogOpen}
            onClose={() => {
              if (!deleteMemberMutation.isPending) {
                setDeleteDialogOpen(false);
                setMemberToDelete(null);
              }
            }}
            onConfirm={handleConfirmDelete}
            title={t('deleteDialog.title')}
            message={t('deleteDialog.message', {
              name: memberToDelete?.userInfo?.fullName || '',
            })}
            isLoading={deleteMemberMutation.isPending}
          />
        </>
      )}
    </div>
  );
};

export default MembersPage;
