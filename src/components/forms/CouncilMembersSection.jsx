import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X, ChevronDown, ChevronUp, User, Shield } from 'lucide-react';
import {
  useGetAllSystemUsersQuery,
  useGetAllRolesQuery,
  useGetAllPermissionsQuery,
  useGetAllRolePermissionsQuery,
  useGetMembersByCouncilIdQuery,
  useGetMemberPermissionsByMemberIdQuery,
} from '../../queries';
import { API } from '../../services/API';
import UserAutocomplete from '../ui/UserAutocomplete';

/**
 * CouncilMembersSection - Manages council members, roles, and permissions
 * @param {Object} props
 * @param {number} props.councilId - Council ID (for edit mode)
 * @param {Function} props.onChange - Callback when members data changes
 * @param {boolean} props.isEditMode - Whether in edit mode
 * @param {boolean} props.disabled - Whether the form is disabled
 */
const CouncilMembersSection = ({ councilId, onChange, isEditMode = false, disabled = false }) => {
  const { t, i18n } = useTranslation('councilForm');
  const isRTL = i18n.dir() === 'rtl';

  // State for members
  const [members, setMembers] = useState([]);
  const [expandedMember, setExpandedMember] = useState(null);

  // Fetch data - Use SystemUsers instead of Users since Member table references SystemUsers
  const { data: systemUsersData, isLoading: isLoadingUsers } = useGetAllSystemUsersQuery({}, { enabled: !disabled });
  const { data: rolesData } = useGetAllRolesQuery({}, { enabled: !disabled });
  const { data: permissionsData } = useGetAllPermissionsQuery({}, { enabled: !disabled });

  // Fetch ALL role permissions upfront
  const { data: allRolePermissionsData } = useGetAllRolePermissionsQuery({}, { enabled: !disabled });

  // Fetch existing members if in edit mode
  const { data: existingMembersData } = useGetMembersByCouncilIdQuery(councilId, {
    enabled: !!councilId && isEditMode && !disabled,
  });

  // Map SystemUsers to match UserAutocomplete expected format (id, fullName, email)
  const users = (systemUsersData?.data || []).map(su => ({
    id: su.id,
    fullName: su.userFullName || su.UserName || '',
    email: su.email || '',
  }));
  const roles = rolesData?.data || [];
  const permissions = permissionsData?.data || [];
  const allRolePermissions = allRolePermissionsData?.data || [];

  // Organize role permissions by roleId
  const rolePermissionsCache = useMemo(() => {
    const cache = {};
    allRolePermissions.forEach(rp => {
      const roleId = rp.roleId || rp.RoleId;
      if (!cache[roleId]) {
        cache[roleId] = [];
      }
      cache[roleId].push(rp);
    });
    return cache;
  }, [allRolePermissions]);

  // Load existing members on mount (edit mode)
  useEffect(() => {
    if (isEditMode && existingMembersData?.data && members.length === 0) {
      // Handle both camelCase and PascalCase property names
      const membersArray = Array.isArray(existingMembersData.data) ? existingMembersData.data : existingMembersData.data?.data || [];

      const existingMembers = membersArray.map(member => ({
        id: member.id || member.Id,
        userId: member.userId || member.UserId,
        roleId: member.roleId || member.RoleId || null,
        permissions: {},
        isCustomized: false,
        permissionsLoaded: false,
      }));
      setMembers(existingMembers);
    }
  }, [existingMembersData, isEditMode, members.length]);

  // Load member permissions for existing members (edit mode)
  const memberIds = useMemo(() => {
    return members.filter(m => m.id && !m.permissionsLoaded).map(m => m.id);
  }, [members]);

  // Fetch member permissions for first member
  const firstMemberId = memberIds[0];
  const { data: firstMemberPermissionsData } = useGetMemberPermissionsByMemberIdQuery(firstMemberId, {
    enabled: !!firstMemberId && isEditMode && !disabled,
  });

  // Load member permissions into state
  useEffect(() => {
    if (firstMemberPermissionsData?.data && firstMemberId) {
      const memberPerms = {};
      firstMemberPermissionsData.data.forEach(mp => {
        // Handle both camelCase and PascalCase property names
        const isGranted = mp.isGranted ?? mp.IsGranted ?? false;
        const permissionId = mp.permissionId ?? mp.PermissionId;

        if (isGranted && permissionId) {
          memberPerms[permissionId] = true;
        }
      });
      setMembers(prev =>
        prev.map(m =>
          m.id === firstMemberId
            ? {
                ...m,
                permissions: memberPerms,
                isCustomized: Object.keys(memberPerms).length > 0,
                permissionsLoaded: true,
              }
            : m
        )
      );
    }
  }, [firstMemberPermissionsData, firstMemberId]);

  // Fetch member permissions for other members on demand
  useEffect(() => {
    const fetchMemberPermissions = async () => {
      for (const memberId of memberIds) {
        if (memberId && memberId !== firstMemberId) {
          try {
            const response = await API.get('/committee-service/MemberPermission', {
              params: { MemberId: memberId },
            });
            if (response?.data?.data) {
              const memberPerms = {};
              response.data.data.forEach(mp => {
                // Handle both camelCase and PascalCase property names
                const isGranted = mp.isGranted ?? mp.IsGranted ?? false;
                const permissionId = mp.permissionId ?? mp.PermissionId;

                if (isGranted && permissionId) {
                  memberPerms[permissionId] = true;
                }
              });
              setMembers(prev =>
                prev.map(m =>
                  m.id === memberId
                    ? {
                        ...m,
                        permissions: memberPerms,
                        isCustomized: Object.keys(memberPerms).length > 0,
                        permissionsLoaded: true,
                      }
                    : m
                )
              );
            }
          } catch (error) {
            console.error(`Error fetching member permissions for member ${memberId}:`, error);
          }
        }
      }
    };

    if (memberIds.length > 1) {
      fetchMemberPermissions();
    }
  }, [memberIds, firstMemberId]);

  // Notify parent of changes
  useEffect(() => {
    if (onChange) {
      onChange(members);
    }
  }, [members, onChange]);

  const handleAddMember = () => {
    setMembers([
      ...members,
      {
        id: null,
        userId: null,
        roleId: null,
        permissions: {},
        isCustomized: false,
        permissionsLoaded: false,
      },
    ]);
  };

  const handleRemoveMember = index => {
    setMembers(members.filter((_, i) => i !== index));
    if (expandedMember === index) {
      setExpandedMember(null);
    } else if (expandedMember > index) {
      setExpandedMember(expandedMember - 1);
    }
  };

  const handleUserChange = (index, userId) => {
    setMembers(
      members.map((m, i) =>
        i === index
          ? {
              ...m,
              userId,
              // Reset role and permissions when user changes
              roleId: null,
              permissions: {},
              isCustomized: false,
              permissionsLoaded: false,
            }
          : m
      )
    );
  };

  const handleRoleChange = (index, roleId) => {
    setMembers(
      members.map((m, i) =>
        i === index
          ? {
              ...m,
              roleId,
              // Reset permissions to role defaults
              permissions: {},
              isCustomized: false,
              permissionsLoaded: false,
            }
          : m
      )
    );
    // Expand to show permissions
    setExpandedMember(index);
  };

  // Get default permissions for a role
  const getDefaultPermissionsForRole = roleId => {
    if (!roleId || !rolePermissionsCache[roleId]) return {};
    const rolePermissions = rolePermissionsCache[roleId];
    const defaultPerms = {};
    rolePermissions.forEach(rp => {
      // Handle both camelCase and PascalCase property names
      const isGranted = rp.isGranted ?? rp.IsGranted ?? false;
      const permissionId = rp.permissionId ?? rp.PermissionId;

      if (isGranted && permissionId) {
        defaultPerms[permissionId] = true;
      }
    });
    return defaultPerms;
  };

  // Get effective permissions (custom or role default)
  const getEffectivePermissions = member => {
    if (member.isCustomized && Object.keys(member.permissions).length > 0) {
      return member.permissions;
    }
    return getDefaultPermissionsForRole(member.roleId);
  };

  const handlePermissionToggle = (memberIndex, permissionId) => {
    setMembers(
      members.map((m, i) => {
        if (i !== memberIndex) return m;

        const effectivePerms = getEffectivePermissions(m);
        const newPermissions = {
          ...effectivePerms,
          [permissionId]: !effectivePerms[permissionId],
        };

        return {
          ...m,
          permissions: newPermissions,
          isCustomized: true,
        };
      })
    );
  };

  const handleResetPermissions = memberIndex => {
    setMembers(
      members.map((m, i) =>
        i === memberIndex
          ? {
              ...m,
              permissions: {},
              isCustomized: false,
            }
          : m
      )
    );
  };

  const toggleExpand = index => {
    setExpandedMember(expandedMember === index ? null : index);
  };

  return (
    <div className="space-y-6 hover:border-border border-2 border-transparent p-3 m-3 rounded-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text border-b border-brand/30 pb-2 flex-1">{t('sections.members')}</h3>
        {!disabled && (
          <button
            type="button"
            onClick={handleAddMember}
            className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
            {t('addMember')}
          </button>
        )}
      </div>

      {members.length === 0 ? (
        <div className="text-center py-8 text-text-muted">
          <User size={48} className="mx-auto mb-4 opacity-50" />
          <p>{t('noMembersAdded')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {members.map((member, index) => {
            const effectivePermissions = getEffectivePermissions(member);
            const isExpanded = expandedMember === index;
            const selectedRole = roles.find(r => r.id === member.roleId);
            const selectedUser = users.find(u => u.id === member.userId);

            return (
              <div key={index} className="border border-border rounded-lg p-4 bg-surface transition-all">
                <div className="flex items-start gap-4">
                  {/* User Selection */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-text mb-2">
                      {t('member')} {index + 1}
                    </label>
                    <UserAutocomplete
                      users={users}
                      value={member.userId}
                      onChange={userId => handleUserChange(index, userId)}
                      placeholder={t('selectUser')}
                      disabled={disabled}
                    />
                  </div>

                  {/* Role Selection */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-text mb-2">{t('role')}</label>
                    <select
                      value={member.roleId || ''}
                      onChange={e => handleRoleChange(index, e.target.value ? parseInt(e.target.value) : null)}
                      disabled={disabled || !member.userId}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none bg-surface text-text border-border disabled:opacity-50"
                    >
                      <option value="">{t('selectRole')}</option>
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>
                          {i18n.language === 'ar' ? role.arabicName : role.englishName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Actions */}
                  <div className="flex items-end gap-2 pt-6">
                    {member.roleId && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(index)}
                        className="p-2 text-brand hover:bg-brand/10 rounded-lg transition-colors"
                        title={isExpanded ? t('hidePermissions') : t('showPermissions')}
                      >
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    )}
                    {!disabled && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(index)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        title={t('removeMember')}
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Permissions Section */}
                {isExpanded && member.roleId && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Shield size={16} className="text-brand" />
                        <h4 className="text-sm font-semibold text-text">
                          {t('permissions')} ({selectedRole ? (i18n.language === 'ar' ? selectedRole.arabicName : selectedRole.englishName) : ''})
                        </h4>
                        {member.isCustomized && <span className="text-xs text-brand bg-brand/10 px-2 py-1 rounded">{t('customized')}</span>}
                      </div>
                      {member.isCustomized && (
                        <button type="button" onClick={() => handleResetPermissions(index)} className="text-xs text-brand hover:underline">
                          {t('resetToDefault')}
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-2">
                      {permissions.map(permission => {
                        const isChecked = effectivePermissions[permission.id] || false;
                        return (
                          <label key={permission.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-surface-hover cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handlePermissionToggle(index, permission.id)}
                              disabled={disabled}
                              className="mt-1 w-4 h-4 text-brand bg-surface border-border rounded focus:ring-brand"
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-text">{i18n.language === 'ar' ? permission.arabicName : permission.englishName}</div>
                              {permission.description && <div className="text-xs text-text-muted mt-1">{permission.description}</div>}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CouncilMembersSection;
