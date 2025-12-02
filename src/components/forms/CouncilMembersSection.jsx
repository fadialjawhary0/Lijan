import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X, ChevronDown, ChevronUp, User, Shield } from 'lucide-react';
import { useGetAllUsersQuery, useGetAllRolesQuery, useGetAllPermissionsQuery, useGetMembersByCouncilIdQuery } from '../../queries';
import { API } from '../../services/API';
import UserAutocomplete from '../ui/UserAutocomplete';

const CouncilMembersSection = ({ councilId, onChange, isEditMode = false, disabled = false }) => {
  const { t, i18n } = useTranslation('councilForm');
  const isRTL = i18n.dir() === 'rtl';

  // State for members
  const [members, setMembers] = useState([]);
  const [expandedMember, setExpandedMember] = useState(null);
  // State to store fetched role permissions per role
  const [rolePermissionsByRole, setRolePermissionsByRole] = useState({});

  // Fetch data - Use Users from auth service with SystemId = 2 for committee product
  const { data: usersData, isLoading: isLoadingUsers } = useGetAllUsersQuery({ Page: 1, PageSize: 1000, SystemId: 2 }, { enabled: !disabled });
  const { data: rolesData } = useGetAllRolesQuery({ page: 1, pageSize: 1000 }, { enabled: !disabled });
  const { data: permissionsData } = useGetAllPermissionsQuery({ page: 1, pageSize: 1000 }, { enabled: !disabled });

  // Fetch existing members if in edit mode
  const { data: existingMembersData } = useGetMembersByCouncilIdQuery(councilId, {
    enabled: !!councilId && isEditMode && !disabled,
  });

  // Map Users to match UserAutocomplete expected format (id, fullName, email)
  const users = (usersData?.data || []).map(user => ({
    id: user.id || user.Id,
    fullName: user.fullName || user.FullName || `${user.firstName || user.FirstName || ''} ${user.lastName || user.LastName || ''}`.trim(),
    email: user.email || user.Email || '',
  }));
  const roles = rolesData?.data || [];
  const permissions = permissionsData?.data || [];

  // Organize role permissions by roleId from fetched role permissions
  const rolePermissionsCache = useMemo(() => {
    const cache = {};

    // Add permissions from role-specific fetches
    Object.keys(rolePermissionsByRole).forEach(roleId => {
      const rolePerms = rolePermissionsByRole[roleId];
      if (rolePerms && Array.isArray(rolePerms)) {
        cache[roleId] = rolePerms;
      }
    });

    return cache;
  }, [rolePermissionsByRole]);

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

  // Load MemberRolePermissions for existing members (edit mode)
  useEffect(() => {
    const loadMemberRolePermissions = async () => {
      if (!isEditMode || members.length === 0) return;

      for (const member of members) {
        if (member.id && member.roleId && !member.permissionsLoaded) {
          try {
            const response = await API.get('/committee-service/MemberRolePermission', {
              params: { MemberId: member.id, RoleId: member.roleId, page: 1, pageSize: 1000 },
            });

            if (response?.data?.data || response?.data?.Data) {
              const mrpData = response.data.data || response.data.Data;
              const mrpArray = Array.isArray(mrpData) ? mrpData : [];

              // Extract permission IDs from MemberRolePermissions
              const memberPerms = {};
              mrpArray.forEach(mrp => {
                const permId = mrp.PermissionId || mrp.permissionId;
                if (permId) {
                  memberPerms[permId] = true;
                }
              });

              // Update member with loaded permissions
              setMembers(prev =>
                prev.map(m =>
                  m.id === member.id
                    ? {
                        ...m,
                        permissions: memberPerms,
                        isCustomized: Object.keys(memberPerms).length > 0, // Has custom permissions
                        permissionsLoaded: true,
                      }
                    : m
                )
              );
            }
          } catch (error) {
            console.error(`Error loading MemberRolePermissions for member ${member.id}:`, error);
          }
        }
      }
    };

    loadMemberRolePermissions();
  }, [members, isEditMode]);

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

  const handleRoleChange = async (index, roleId) => {
    // First, update the roleId immediately
    setMembers(
      members.map((m, i) =>
        i === index
          ? {
              ...m,
              roleId,
              permissions: {}, // Clear permissions first
              isCustomized: false,
              permissionsLoaded: false,
            }
          : m
      )
    );

    // Fetch role permissions for the selected role using LIST endpoint with RoleId parameter
    if (roleId) {
      try {
        // Use the LIST endpoint with RoleId parameter
        const response = await API.get('/committee-service/RolePermission', {
          params: { RoleId: parseInt(roleId), page: 1, pageSize: 1000 },
        });

        console.log('Fetched role permissions for RoleId:', roleId, response?.data);

        let defaultPermissions = {};

        // Handle different response structures
        const responseData = response?.data?.data || response?.data?.Data || response?.data;
        const rolePermsArray = Array.isArray(responseData) ? responseData : [];

        // The backend returns List<RolePermissionDto> where each has RoleId and Permissions array
        // Extract all permission IDs from the Permissions arrays
        rolePermsArray.forEach(rp => {
          // Handle both camelCase and PascalCase
          const permissions = rp.Permissions || rp.permissions || [];
          if (Array.isArray(permissions)) {
            permissions.forEach(perm => {
              const permId = perm.Id || perm.id;
              if (permId) {
                // Store as both number and string to handle type mismatches
                const permIdNum = Number(permId);
                defaultPermissions[permIdNum] = true;
                defaultPermissions[String(permIdNum)] = true;
              }
            });
          }
        });

        console.log('Extracted default permissions for role:', roleId, defaultPermissions);

        // Update the role-specific permissions cache
        setRolePermissionsByRole(prev => ({
          ...prev,
          [roleId]: rolePermsArray,
        }));

        // Now update member with auto-checked default permissions
        setMembers(prev =>
          prev.map((m, i) =>
            i === index
              ? {
                  ...m,
                  roleId,
                  // Set permissions to role defaults (auto-checked)
                  permissions: defaultPermissions,
                  isCustomized: false, // Not customized yet, using defaults
                  permissionsLoaded: false,
                }
              : m
          )
        );
      } catch (error) {
        console.error('Error fetching role permissions for role:', roleId, error);
      }
    } else {
      // If no role selected, clear permissions
      setMembers(prev =>
        prev.map((m, i) =>
          i === index
            ? {
                ...m,
                roleId: null,
                permissions: {},
                isCustomized: false,
                permissionsLoaded: false,
              }
            : m
        )
      );
    }

    // Expand to show permissions
    setExpandedMember(index);
  };

  // Get default permissions for a role from cache
  const getDefaultPermissionsForRole = roleId => {
    if (!roleId || !rolePermissionsCache[roleId]) return {};
    const rolePermsData = rolePermissionsCache[roleId];
    const defaultPerms = {};

    // Handle array format from cache
    if (Array.isArray(rolePermsData)) {
      rolePermsData.forEach(rp => {
        // Handle both camelCase and PascalCase
        const permissions = rp.Permissions || rp.permissions || [];
        if (Array.isArray(permissions)) {
          permissions.forEach(perm => {
            const permId = perm.Id || perm.id;
            if (permId) {
              defaultPerms[permId] = true;
            }
          });
        }
      });
    }

    return defaultPerms;
  };

  // Get effective permissions (always use member.permissions - either defaults or customized)
  const getEffectivePermissions = member => {
    // If member has permissions set, use them (could be defaults or customized)
    if (member.permissions && Object.keys(member.permissions).length > 0) {
      return member.permissions;
    }
    // Fallback to role defaults if no permissions set
    return getDefaultPermissionsForRole(member.roleId);
  };

  const handlePermissionToggle = (memberIndex, permissionId) => {
    setMembers(
      members.map((m, i) => {
        if (i !== memberIndex) return m;

        const currentPerms = m.permissions || {};
        const newPermissions = {
          ...currentPerms,
          [permissionId]: !currentPerms[permissionId], // Toggle permission
        };

        // Remove permission if unchecked (set to false/undefined)
        if (!newPermissions[permissionId]) {
          delete newPermissions[permissionId];
        }

        return {
          ...m,
          permissions: newPermissions,
          isCustomized: true, // Mark as customized since user changed it
        };
      })
    );
  };

  const handleResetPermissions = async memberIndex => {
    const member = members[memberIndex];
    if (!member || !member.roleId) return;

    // Reset to role defaults
    const defaultPerms = getDefaultPermissionsForRole(member.roleId);

    setMembers(
      members.map((m, i) =>
        i === memberIndex
          ? {
              ...m,
              permissions: defaultPerms,
              isCustomized: false, // Reset to defaults
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
            const selectedRole = roles.find(r => (r.id || r.Id) === member.roleId);
            const selectedUser = users.find(u => (u.id || u.Id) === member.userId);

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
                        // Handle both number and string IDs
                        const permId = permission.id || permission.Id;
                        const isChecked =
                          effectivePermissions[permId] === true ||
                          effectivePermissions[String(permId)] === true ||
                          effectivePermissions[Number(permId)] === true;
                        return (
                          <label key={permId} className="flex items-start gap-2 p-2 rounded-lg hover:bg-surface-hover cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handlePermissionToggle(index, permId)}
                              disabled={disabled}
                              className="mt-1 w-4 h-4 text-brand bg-surface border-border rounded focus:ring-brand"
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-text">
                                {i18n.language === 'ar' ? permission.arabicName || permission.ArabicName : permission.englishName || permission.EnglishName}
                              </div>
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
