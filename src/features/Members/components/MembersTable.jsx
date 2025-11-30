import React from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, Trash2, MoreVertical, Mail, Building, User, ChevronDown } from 'lucide-react';
import Card from '../../../components/ui/Card';
import { DropdownMenu, DropdownMenuItem } from '../../../components/ui/DropdownMenu';
import { formatDate } from '../../../utils/dateUtils';
import TablePaginationRows from '../../../components/ui/TablePaginationRows';
import Pagination from '../../../components/ui/Pagination';
import EmptyState from '../../../components/ui/EmptyState';
import TableSkeleton from '../../../components/skeletons/TableSkeleton';
import { MEMBER_STATUS } from '../../../constants';
import { useActivateMemberMutation, useDeactivateMemberMutation } from '../../../queries/members';
import { useToast } from '../../../context/ToasterContext';
import { isApiResponseSuccessful, getApiErrorMessage } from '../../../utils/apiResponseHandler';

const MembersTable = ({
  members = [],
  isLoading = false,
  onEdit,
  onDelete,
  onRoleChange,
  page = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  totalCount = 0,
}) => {
  const { t, i18n } = useTranslation('members');
  const { t: tCommon } = useTranslation('common');
  const isRTL = i18n.dir() === 'rtl';
  const toast = useToast();
  const activateMemberMutation = useActivateMemberMutation();
  const deactivateMemberMutation = useDeactivateMemberMutation();

  const totalPages = Math.ceil(totalCount / pageSize);

  const getStatusBadge = isActive => {
    if (isActive) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 border border-green-500 text-green-500">
          {t('status.active')}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-500/10 border border-gray-500 text-gray-500">
        {t('status.inactive')}
      </span>
    );
  };

  const handleStatusChange = async (member, newStatus) => {
    const isCurrentlyActive = member.isActive;

    // Don't do anything if the status hasn't changed
    if (isCurrentlyActive === newStatus) return;

    const memberId = member.id || member.Id;
    const memberName = member.userInfo?.fullName || t('member');

    try {
      let response;
      if (newStatus) {
        // Activate
        response = await activateMemberMutation.mutateAsync({ MemberId: parseInt(memberId) });
      } else {
        // Deactivate
        response = await deactivateMemberMutation.mutateAsync({ MemberId: parseInt(memberId) });
      }

      if (isApiResponseSuccessful(response)) {
        toast.success(
          newStatus
            ? t('activateSuccess', { name: memberName }) || `${memberName} ${t('status.active')}`
            : t('deactivateSuccess', { name: memberName }) || `${memberName} ${t('status.inactive')}`
        );
      } else {
        const errorMessage = getApiErrorMessage(response, tCommon('error') || 'An error occurred');
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Status change error:', error);
      toast.error(error.message || tCommon('error') || 'An error occurred');
    }
  };

  const getInitials = name => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <Card className="bg-card-surface">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-border">
            <thead className="bg-surface-elevated border-b border-border">
              <tr>
                <th className={`px-4 py-3 text-left font-semibold text-text ${isRTL ? 'text-right' : 'text-left'}`}>{t('table.name')}</th>
                <th className={`px-4 py-3 text-left font-semibold text-text ${isRTL ? 'text-right' : 'text-left'}`}>{t('table.role')}</th>
                {/* <th className={`px-4 py-3 text-left font-semibold text-text ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('table.organization')}
                </th> */}
                <th className={`px-4 py-3 text-left font-semibold text-text ${isRTL ? 'text-right' : 'text-left'}`}>{t('table.status')}</th>
                <th className={`px-4 py-3 text-left font-semibold text-text ${isRTL ? 'text-right' : 'text-left'}`}>{t('table.startDate')}</th>
                <th className={`px-4 py-3 text-left font-semibold text-text ${isRTL ? 'text-right' : 'text-left'}`}>{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              <TableSkeleton columnNumbers={6} />
            </tbody>
          </table>
        </div>
      </Card>
    );
  }

  if (!members || members.length === 0) {
    return (
      <Card className="p-6">
        <EmptyState title={t('noMembers')} message={t('noMembersDescription')} icon={User} />
      </Card>
    );
  }

  return (
    <Card className="bg-card-surface">
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
          <thead className="bg-surface-elevated border-b border-border">
            <tr>
              <th className={`px-4 py-3 text-left font-semibold text-text whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>{t('table.name')}</th>
              <th className={`px-4 py-3 text-left font-semibold text-text whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>{t('table.role')}</th>
              {/* <th className={`px-4 py-3 text-left font-semibold text-text whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('table.organization')}
              </th> */}
              <th className={`px-4 py-3 text-left font-semibold text-text whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>{t('table.status')}</th>
              <th className={`px-4 py-3 text-left font-semibold text-text whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>{t('table.startDate')}</th>
              <th className={`px-4 py-3 text-left font-semibold text-text whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>{t('table.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {members.map(member => (
              <tr key={member.id} className="hover:bg-surface transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                      <span className="text-brand font-semibold text-sm">{getInitials(member.userInfo?.fullName || '')}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-text truncate">{member.userInfo?.fullName || '-'}</p>
                        {!member.userId && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 border border-blue-500 text-blue-500">
                            {t('external')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-text-muted mt-1">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{member.userInfo?.email || '-'}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-surface-elevated text-text">
                    {isRTL ? member.role?.arabicName : member.role?.englishName}
                  </span>
                </td>
                {/* <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-text-muted">
                    <Building className="h-4 w-4" />
                    <span className="truncate">{member.organization || '-'}</span>
                  </div>
                  {member.department && <div className="text-xs text-text-muted mt-1">{member.department}</div>}
                </td> */}
                <td className="px-4 py-3">
                  <DropdownMenu
                    trigger={
                      <button
                        type="button"
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border transition-colors hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed ${
                          member.isActive ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-gray-500/10 border-gray-500 text-gray-500'
                        }`}
                        disabled={activateMemberMutation.isPending || deactivateMemberMutation.isPending}
                        onClick={e => e.stopPropagation()}
                      >
                        <span>{member.isActive ? t('status.active') : t('status.inactive')}</span>
                        <ChevronDown size={14} />
                      </button>
                    }
                  >
                    <DropdownMenuItem
                      onClick={e => {
                        e.stopPropagation();
                        handleStatusChange(member, true);
                      }}
                    >
                      <span className={member.isActive ? 'text-green-500 font-medium' : ''}>{t('status.active')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={e => {
                        e.stopPropagation();
                        handleStatusChange(member, false);
                      }}
                    >
                      <span className={!member.isActive ? 'text-gray-500 font-medium' : ''}>{t('status.inactive')}</span>
                    </DropdownMenuItem>
                  </DropdownMenu>
                </td>
                <td className="px-4 py-3 text-text-muted">{member.startDate ? formatDate(member.startDate) : '-'}</td>
                <td className="px-4 py-3">
                  <DropdownMenu
                    trigger={
                      <button
                        type="button"
                        className="p-1 hover:bg-surface-hover rounded-lg transition-colors text-text-muted hover:text-text cursor-pointer"
                        aria-label={t('actions')}
                      >
                        <MoreVertical size={18} className="cursor-pointer" />
                      </button>
                    }
                  >
                    {onRoleChange && (
                      <DropdownMenuItem
                        onClick={e => {
                          e.stopPropagation();
                          onRoleChange(member);
                        }}
                        className="hover:bg-transparent"
                      >
                        <Edit size={16} className="text-text-muted" />
                        <span>{t('changeRole')}</span>
                      </DropdownMenuItem>
                    )}
                    {onEdit && (
                      <DropdownMenuItem
                        onClick={e => {
                          e.stopPropagation();
                          onEdit(member);
                        }}
                        className="hover:bg-transparent"
                      >
                        <Edit size={16} className="text-text-muted" />
                        <span>{t('edit')}</span>
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={e => {
                          e.stopPropagation();
                          onDelete(member);
                        }}
                        className="text-destructive hover:bg-transparent"
                      >
                        <Trash2 size={16} />
                        <span>{t('remove')}</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <TablePaginationRows pageSize={pageSize} handlePageSizeChange={onPageSizeChange} />
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      )}
    </Card>
  );
};

export default MembersTable;
