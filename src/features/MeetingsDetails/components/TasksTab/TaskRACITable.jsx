import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Plus, Trash2, Check, X } from 'lucide-react';
import { useGetAllMembersQuery } from '../../../../queries/members';
import { useAssignTaskRACIMutation } from '../../../../queries/tasks';
import Button from '../../../../components/ui/Button';
import { useToast } from '../../../../context/ToasterContext';
import { isApiResponseSuccessful, getApiErrorMessage } from '../../../../utils/apiResponseHandler';

const TaskRACITable = ({ task, onRemoveRACI, committeeId, onRACIUpdated }) => {
  const { t, i18n } = useTranslation('meetingDetails');
  const { t: tCommon } = useTranslation('common');
  const toast = useToast();
  const isRTL = i18n.dir() === 'rtl';

  const [isAddingMember, setIsAddingMember] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedRoles, setSelectedRoles] = useState({
    responsible: false,
    accountable: false,
    consulted: false,
    informed: false,
  });

  const assignRACIMutation = useAssignTaskRACIMutation();

  const { data: membersData } = useGetAllMembersQuery(
    {
      CommitteeId: committeeId ? parseInt(committeeId) : undefined,
      IsActive: true,
      PageSize: 1000,
    },
    { enabled: !!committeeId }
  );
  const members = membersData?.data || [];

  const getMemberName = memberId => {
    const member = members.find(m => (m.id || m.Id) === memberId);
    return member?.userInfo?.fullName || member?.member?.userInfo?.fullName || `Member ${memberId}`;
  };

  const raci = task?.raci || task?.RACI;

  // Get existing RACI assignments for this task
  const existingAssignments = useMemo(() => {
    if (!raci) return [];
    return [
      ...(raci.responsible || raci.Responsible || []),
      ...(raci.accountable || raci.Accountable || []),
      ...(raci.consulted || raci.Consulted || []),
      ...(raci.informed || raci.Informed || []),
    ];
  }, [raci]);

  // Group by member
  const memberGroups = useMemo(() => {
    const groups = {};
    existingAssignments.forEach(assignment => {
      const memberId = assignment.memberId || assignment.MemberId;
      if (!groups[memberId]) {
        groups[memberId] = {
          memberId,
          memberName: getMemberName(memberId),
          roles: [],
        };
      }
      const role = assignment.role || assignment.Role;
      if (!groups[memberId].roles.includes(role)) {
        groups[memberId].roles.push(role);
      }
    });
    return groups;
  }, [existingAssignments, members]);

  // Get available members (not already assigned)
  const availableMembers = useMemo(() => {
    const assignedMemberIds = Object.keys(memberGroups).map(id => parseInt(id));
    return members.filter(m => {
      const memberId = m.id || m.Id;
      return !assignedMemberIds.includes(memberId);
    });
  }, [members, memberGroups]);

  const handleRoleToggle = role => {
    setSelectedRoles(prev => ({
      ...prev,
      [role]: !prev[role],
    }));
  };

  const handleAddMember = async () => {
    if (!selectedMemberId) {
      toast.error(t('tasks.raci.selectMemberRequired') || 'Please select a member');
      return;
    }

    const hasAnyRole = Object.values(selectedRoles).some(v => v);
    if (!hasAnyRole) {
      toast.error(t('tasks.raci.selectRoleRequired') || 'Please select at least one role');
      return;
    }

    try {
      // Build all RACI assignments (existing + new)
      const newAssignments = [];

      // Add new assignments for selected member
      if (selectedRoles.responsible) newAssignments.push({ MemberId: parseInt(selectedMemberId), Role: 1 });
      if (selectedRoles.accountable) newAssignments.push({ MemberId: parseInt(selectedMemberId), Role: 2 });
      if (selectedRoles.consulted) newAssignments.push({ MemberId: parseInt(selectedMemberId), Role: 3 });
      if (selectedRoles.informed) newAssignments.push({ MemberId: parseInt(selectedMemberId), Role: 4 });

      // Keep existing assignments
      existingAssignments.forEach(existing => {
        const memberId = existing.memberId || existing.MemberId;
        const role = existing.role || existing.Role;
        newAssignments.push({ MemberId: memberId, Role: role });
      });

      // Check if Accountable already exists
      const accountableCount = newAssignments.filter(a => a.Role === 2).length;
      if (accountableCount > 1) {
        toast.error(t('tasks.raci.onlyOneAccountable') || 'Only one member can be assigned as Accountable (A)');
        return;
      }

      const taskId = task.id || task.Id;
      const response = await assignRACIMutation.mutateAsync({
        TaskId: taskId,
        RACIAssignments: newAssignments,
      });

      if (isApiResponseSuccessful(response)) {
        toast.success(t('tasks.raci.assignSuccess') || 'RACI assignments updated successfully');
        setIsAddingMember(false);
        setSelectedMemberId('');
        setSelectedRoles({
          responsible: false,
          accountable: false,
          consulted: false,
          informed: false,
        });
        if (onRACIUpdated) {
          onRACIUpdated();
        }
      } else {
        const errorMessage = getApiErrorMessage(response, tCommon('error') || 'An error occurred');
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Assign RACI error:', error);
      toast.error(error.message || tCommon('error') || 'An error occurred');
    }
  };

  const handleCancel = () => {
    setIsAddingMember(false);
    setSelectedMemberId('');
    setSelectedRoles({
      responsible: false,
      accountable: false,
      consulted: false,
      informed: false,
    });
  };

  if (!raci && !isAddingMember) {
    return (
      <div className="p-4 bg-surface-elevated border-t border-border">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-text">{t('tasks.raci.title') || 'RACI Assignments'}</h4>
          <Button
            onClick={e => {
              e.stopPropagation();
              setIsAddingMember(true);
            }}
            variant="ghost"
            size="sm"
            disabled={!committeeId}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('tasks.raci.addMember') || 'Add Member'}
          </Button>
        </div>
        {!committeeId && <p className="mt-2 text-xs text-text-muted">{t('participants.noCommitteeSelected') || 'Please select a committee first'}</p>}
      </div>
    );
  }

  return (
    <div className="p-4 bg-surface-elevated border-t border-border">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-text">{t('tasks.raci.title') || 'RACI Assignments'}</h4>
        {!isAddingMember && (
          <Button
            onClick={e => {
              e.stopPropagation();
              setIsAddingMember(true);
            }}
            variant="ghost"
            size="sm"
            disabled={!committeeId || availableMembers.length === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('tasks.raci.addMember') || 'Add Member'}
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-border">
          <thead className="bg-surface border-b border-border">
            <tr>
              <th className={`px-3 py-2 text-left font-semibold text-text text-xs ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('tasks.raci.member') || 'Member'}
              </th>
              <th className={`px-3 py-2 text-center font-semibold text-text text-xs`}>R</th>
              <th className={`px-3 py-2 text-center font-semibold text-text text-xs`}>A</th>
              <th className={`px-3 py-2 text-center font-semibold text-text text-xs`}>C</th>
              <th className={`px-3 py-2 text-center font-semibold text-text text-xs`}>I</th>
              <th className={`px-3 py-2 text-left font-semibold text-text text-xs ${isRTL ? 'text-right' : 'text-left'}`}>{t('tasks.table.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {/* Inline Add Form */}
            {isAddingMember && (
              <tr className="bg-surface-hover">
                <td className="px-3 py-2">
                  <select
                    value={selectedMemberId}
                    onChange={e => setSelectedMemberId(e.target.value)}
                    className={`w-full px-2 py-1 text-xs border border-border rounded bg-surface text-text focus:outline-none focus:ring-1 focus:ring-brand focus:border-transparent ${
                      isRTL ? 'text-right' : 'text-left'
                    }`}
                    disabled={assignRACIMutation.isPending}
                  >
                    <option value="">{t('tasks.raci.selectMember') || 'Select member'}</option>
                    {availableMembers.map(member => (
                      <option key={member.id || member.Id} value={member.id || member.Id}>
                        {member.userInfo?.fullName || member.member?.userInfo?.fullName || `Member ${member.id || member.Id}`}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2 text-center">
                  <button
                    type="button"
                    onClick={() => handleRoleToggle('responsible')}
                    disabled={assignRACIMutation.isPending}
                    className={`w-6 h-6 mx-auto rounded border transition-colors flex items-center justify-center ${
                      selectedRoles.responsible
                        ? 'bg-blue-500/20 border-blue-500 text-blue-500'
                        : 'bg-surface border-border text-text-muted hover:bg-surface-hover'
                    }`}
                  >
                    {selectedRoles.responsible && <Check className="h-3 w-3" />}
                  </button>
                </td>
                <td className="px-3 py-2 text-center">
                  <button
                    type="button"
                    onClick={() => handleRoleToggle('accountable')}
                    disabled={assignRACIMutation.isPending}
                    className={`w-6 h-6 mx-auto rounded border transition-colors flex items-center justify-center ${
                      selectedRoles.accountable
                        ? 'bg-green-500/20 border-green-500 text-green-500'
                        : 'bg-surface border-border text-text-muted hover:bg-surface-hover'
                    }`}
                  >
                    {selectedRoles.accountable && <Check className="h-3 w-3" />}
                  </button>
                </td>
                <td className="px-3 py-2 text-center">
                  <button
                    type="button"
                    onClick={() => handleRoleToggle('consulted')}
                    disabled={assignRACIMutation.isPending}
                    className={`w-6 h-6 mx-auto rounded border transition-colors flex items-center justify-center ${
                      selectedRoles.consulted
                        ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500'
                        : 'bg-surface border-border text-text-muted hover:bg-surface-hover'
                    }`}
                  >
                    {selectedRoles.consulted && <Check className="h-3 w-3" />}
                  </button>
                </td>
                <td className="px-3 py-2 text-center">
                  <button
                    type="button"
                    onClick={() => handleRoleToggle('informed')}
                    disabled={assignRACIMutation.isPending}
                    className={`w-6 h-6 mx-auto rounded border transition-colors flex items-center justify-center ${
                      selectedRoles.informed
                        ? 'bg-gray-500/20 border-gray-500 text-gray-500'
                        : 'bg-surface border-border text-text-muted hover:bg-surface-hover'
                    }`}
                  >
                    {selectedRoles.informed && <Check className="h-3 w-3" />}
                  </button>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleAddMember}
                      disabled={assignRACIMutation.isPending || !selectedMemberId}
                      className="p-1 text-brand hover:text-brand/80 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      title={tCommon('add') || 'Add'}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={assignRACIMutation.isPending}
                      className="p-1 text-text-muted hover:text-text transition-colors cursor-pointer"
                      title={tCommon('cancel') || 'Cancel'}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {/* Existing Members */}
            {Object.values(memberGroups).map(member => (
              <tr key={member.memberId} className="hover:bg-surface transition-colors">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-text-muted" />
                    <span className="text-text text-xs">{member.memberName}</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-center">
                  {member.roles.includes(1) ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 text-xs font-medium">R</span>
                  ) : (
                    <span className="text-text-muted">-</span>
                  )}
                </td>
                <td className="px-3 py-2 text-center">
                  {member.roles.includes(2) ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500/20 text-green-500 text-xs font-medium">A</span>
                  ) : (
                    <span className="text-text-muted">-</span>
                  )}
                </td>
                <td className="px-3 py-2 text-center">
                  {member.roles.includes(3) ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-500 text-xs font-medium">C</span>
                  ) : (
                    <span className="text-text-muted">-</span>
                  )}
                </td>
                <td className="px-3 py-2 text-center">
                  {member.roles.includes(4) ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-500/20 text-gray-500 text-xs font-medium">I</span>
                  ) : (
                    <span className="text-text-muted">-</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onRemoveRACI(task, member.memberId);
                    }}
                    className="p-1 text-destructive hover:text-destructive/80 transition-colors cursor-pointer"
                    title={t('tasks.raci.remove') || 'Remove'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {Object.keys(memberGroups).length === 0 && !isAddingMember && (
              <tr>
                <td colSpan="6" className="px-3 py-4 text-center text-text-muted text-xs">
                  {t('tasks.raci.noAssignments') || 'No RACI assignments yet'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskRACITable;
