import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import UserAutocomplete from '../../../components/ui/UserAutocomplete';
import {
  useGetAllUsersQuery,
  useGetAllRolesQuery,
  useCreateMemberMutation,
  useGetAllRolePermissionsQuery,
  useGetAllPermissionsQuery,
  useCreateMemberPermissionMutation,
} from '../../../queries';
import { useCommittee } from '../../../context/CommitteeContext';
import { useToast } from '../../../context/ToasterContext';
import { isApiResponseSuccessful, getApiErrorMessage } from '../../../utils/apiResponseHandler';

const AddMemberModal = ({ isOpen, onClose, onSave, roles = [], users: propUsers = [] }) => {
  const { t, i18n } = useTranslation('members');
  const isRTL = i18n.dir() === 'rtl';
  const toast = useToast();
  const { selectedCommitteeId } = useCommittee();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExternal, setIsExternal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm();

  const selectedUserId = watch('userId');
  const selectedRoleId = watch('roleId');

  const { data: usersData } = useGetAllUsersQuery({ Page: 1, PageSize: 1000, SystemId: 2 }, { enabled: isOpen && !isExternal });

  const { data: rolesData } = useGetAllRolesQuery({}, { enabled: !roles || roles.length === 0 });

  const { data: allRolePermissionsData } = useGetAllRolePermissionsQuery({}, { enabled: isOpen });
  const { data: allPermissionsData } = useGetAllPermissionsQuery({}, { enabled: isOpen });

  const createMemberMutation = useCreateMemberMutation();
  const createMemberPermissionMutation = useCreateMemberPermissionMutation();

  const users =
    propUsers.length > 0
      ? propUsers
      : (usersData?.data || []).map(user => ({
          id: user.id || user.Id,
          fullName: user.fullName || user.FullName || `${user.firstName || user.FirstName || ''} ${user.lastName || user.LastName || ''}`.trim(),
          email: user.email || user.Email || '',
        }));

  const availableRoles = roles.length > 0 ? roles : rolesData?.data || [];

  useEffect(() => {
    if (!isOpen) {
      reset();
      setIsExternal(false);
      setIsSubmitting(false);
    }
  }, [isOpen, reset]);

  const onSubmit = async data => {
    if (!selectedCommitteeId) {
      toast.error(t('addMember.noCommitteeSelected') || 'No committee selected');
      return;
    }

    setIsSubmitting(true);

    try {
      const memberPayload = {
        CommitteeId: parseInt(selectedCommitteeId),
        UserId: isExternal ? null : parseInt(data.userId),
        RoleId: parseInt(data.roleId),
      };

      if (isExternal) {
        toast.error(t('addMember.externalNotSupported') || 'External members are not yet supported');
        setIsSubmitting(false);
        return;
      }

      const createMemberResponse = await new Promise((resolve, reject) => {
        createMemberMutation.mutate(memberPayload, {
          onSuccess: response => {
            if (isApiResponseSuccessful(response)) {
              resolve(response);
            } else {
              reject(new Error(getApiErrorMessage(response, t('addMember.error'))));
            }
          },
          onError: error => {
            reject(error);
          },
        });
      });

      const memberId =
        createMemberResponse?.Data?.IntId || createMemberResponse?.data?.IntId || createMemberResponse?.Data?.intId || createMemberResponse?.data?.intId;

      if (!memberId) {
        throw new Error(t('addMember.memberIdError') || 'Failed to get member ID');
      }

      const allRolePermissions = allRolePermissionsData?.data || [];
      const allPermissions = allPermissionsData?.data || [];

      const rolePermissions = allRolePermissions.filter(rp => (rp.roleId || rp.RoleId) === parseInt(data.roleId));

      const permissionPromises = allPermissions.map(permission => {
        const permId = permission.id || permission.Id;
        const rolePerm = rolePermissions.find(rp => (rp.permissionId || rp.PermissionId) === permId);
        const isGranted = rolePerm ? rolePerm.isGranted ?? rolePerm.IsGranted ?? false : false;

        return new Promise((resolve, reject) => {
          createMemberPermissionMutation.mutate(
            {
              MemberId: memberId,
              PermissionId: permId,
              IsGranted: isGranted,
            },
            {
              onSuccess: response => {
                if (isApiResponseSuccessful(response)) {
                  resolve(response);
                } else {
                  console.warn(`Failed to create permission ${permId}:`, getApiErrorMessage(response));
                  resolve(null);
                }
              },
              onError: error => {
                console.warn(`Error creating permission ${permId}:`, error);
                resolve(null);
              },
            }
          );
        });
      });

      await Promise.all(permissionPromises);

      toast.success(t('addMember.success'));
      onSave?.({ ...data, memberId, isExternal });
      reset();
      setIsExternal(false);
      onClose();
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error(error.message || t('addMember.error') || 'Failed to add member');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('addMember.title')} size={isExternal ? 'lg' : 'md'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* External Member Toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isExternal"
            checked={isExternal}
            onChange={e => setIsExternal(e.target.checked)}
            className="w-4 h-4 text-brand border-border rounded focus:ring-brand cursor-pointer disabled:opacity-50"
            disabled={isSubmitting}
          />
          <label htmlFor="isExternal" className="text-sm font-medium text-text cursor-pointer">
            {t('addMember.externalMember')}
          </label>
        </div>

        {!isExternal ? (
          <>
            {/* Select User */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                {t('addMember.selectUser')} <span className="text-destructive">*</span>
              </label>
              <UserAutocomplete
                users={users}
                value={selectedUserId}
                onChange={value => setValue('userId', value, { shouldValidate: true })}
                placeholder={t('addMember.selectUserPlaceholder')}
                error={errors.userId?.message}
                required
                disabled={isSubmitting}
              />
              {errors.userId && <p className="mt-1 text-sm text-destructive">{errors.userId.message}</p>}
            </div>
          </>
        ) : (
          <>
            {/* External Member Fields - Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  {t('addMember.name')} <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  {...register('name', { required: t('addMember.nameRequired') })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent disabled:opacity-50"
                  placeholder={t('addMember.namePlaceholder')}
                  disabled={isSubmitting}
                />
                {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  {t('addMember.email')} <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  {...register('email', {
                    required: t('addMember.emailRequired'),
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: t('addMember.emailInvalid'),
                    },
                  })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent disabled:opacity-50"
                  placeholder={t('addMember.emailPlaceholder')}
                  disabled={isSubmitting}
                />
                {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">{t('addMember.company')}</label>
                <input
                  type="text"
                  {...register('company')}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent disabled:opacity-50"
                  placeholder={t('addMember.companyPlaceholder')}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">{t('addMember.title')}</label>
                <input
                  type="text"
                  {...register('title')}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent disabled:opacity-50"
                  placeholder={t('addMember.titlePlaceholder')}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </>
        )}

        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            {t('addMember.role')} <span className="text-destructive">*</span>
          </label>
          <select
            {...register('roleId', { required: t('addMember.roleRequired') })}
            className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent cursor-pointer disabled:opacity-50"
            disabled={isSubmitting}
          >
            <option value="">{t('addMember.selectRole')}</option>
            {availableRoles.map(role => (
              <option key={role.id || role.Id} value={role.id || role.Id}>
                {isRTL ? role.arabicName || role.ArabicName : role.englishName || role.EnglishName || role.name}
              </option>
            ))}
          </select>
          {errors.roleId && <p className="mt-1 text-sm text-destructive">{errors.roleId.message}</p>}
        </div>

        {/* Date Fields - Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">{t('addMember.startDate')}</label>
            <input
              type="date"
              {...register('startDate')}
              className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent cursor-pointer disabled:opacity-50"
              disabled={isSubmitting}
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">{t('addMember.endDate')}</label>
            <input
              type="date"
              {...register('endDate')}
              className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent cursor-pointer disabled:opacity-50"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="ghost" onClick={onClose} className="cursor-pointer" disabled={isSubmitting}>
            {t('cancel')}
          </Button>
          <Button type="submit" variant="primary" className="cursor-pointer" disabled={isSubmitting}>
            {isSubmitting ? t('addMember.saving') || 'Saving...' : t('addMember.save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddMemberModal;
