import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Users } from 'lucide-react';
import {
  useCreateCommitteeMutation,
  useUpdateCommitteeMutation,
  useGetCommitteeByIdQuery,
  useGetAllDepartmentsQuery,
  useGetAllCommitteeCategoriesQuery,
  useGetAllCommitteeTypesQuery,
  useAddMembersToCommitteeMutation,
  useCreateMemberPermissionMutation,
  useUpdateMemberPermissionMutation,
} from '../queries/index';
import { useToast } from '../context/ToasterContext';
import { useBreadcrumbs } from '../context';
import { handleApiResponse, isApiResponseSuccessful, getApiErrorMessage } from '../utils/apiResponseHandler';
import FormHeader from '../components/ui/FormHeader';
import FormActions from '../components/ui/FormActions';
import Card from '../components/ui/Card';
import CommitteeMembersSection from '../components/forms/CommitteeMembersSection';
import { getDefaultSuccessRoute } from '../utils/routeUtils';

const CommitteeForm = ({ initialData = null, onSuccess, onClose }) => {
  const navigate = useNavigate();
  const { committeeId } = useParams();
  const { t, i18n } = useTranslation('committeeForm');
  const { t: tHome } = useTranslation('home');
  const toast = useToast();
  const { setBreadcrumbs } = useBreadcrumbs();

  // State for members
  const [members, setMembers] = useState([]);

  // Fetch committee data if in update mode (committeeId from route params)
  const {
    data: committeeData,
    isLoading: isLoadingCommittee,
    error: committeeError,
  } = useGetCommitteeByIdQuery(committeeId, { enabled: !!committeeId && !initialData });

  // Use initialData prop if provided, otherwise use fetched data, otherwise null (create mode)
  // Handle both camelCase and PascalCase response structures
  const committeeDataToUse = initialData || committeeData?.data || committeeData?.Data || null;
  const isEditMode = !!committeeId || !!committeeDataToUse;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm({
    defaultValues: initialData || {
      Number: '',
      ArabicName: '',
      EnglishName: '',
      DepartmentId: '',
      MeetingTemplateName: '',
      ShortName: '',
      TypeId: '',
      CategoryId: '',
      StartDate: '',
      EndDate: '',
      FormationDate: '',
      IsActive: true,
    },
  });

  const { data: typesData } = useGetAllCommitteeTypesQuery();
  const { data: categoriesData } = useGetAllCommitteeCategoriesQuery();
  const { data: departmentsData } = useGetAllDepartmentsQuery();

  const createMutation = useCreateCommitteeMutation();
  const updateMutation = useUpdateCommitteeMutation();
  const addMembersMutation = useAddMembersToCommitteeMutation();
  const createMemberPermissionMutation = useCreateMemberPermissionMutation();
  const updateMemberPermissionMutation = useUpdateMemberPermissionMutation();

  const startDate = watch('StartDate');
  const endDate = watch('EndDate');

  // Set breadcrumbs
  useEffect(() => {
    setBreadcrumbs([
      { label: tHome('breadcrumbs.home'), href: '/' },
      { label: isEditMode ? t('editTitle') : t('createTitle'), href: isEditMode ? `/committees/update/${committeeId}` : '/committees/create' },
    ]);
  }, [setBreadcrumbs, isEditMode, committeeId, t, tHome]);

  // Reset form when committee data is loaded
  useEffect(() => {
    if (committeeDataToUse) {
      // Handle both camelCase and PascalCase property names from API
      const data = {
        Number: committeeDataToUse.Number || committeeDataToUse.number || '',
        ArabicName: committeeDataToUse.ArabicName || committeeDataToUse.arabicName || '',
        EnglishName: committeeDataToUse.EnglishName || committeeDataToUse.englishName || '',
        DepartmentId: committeeDataToUse.DepartmentId || committeeDataToUse.departmentId || '',
        MeetingTemplateName: committeeDataToUse.MeetingTemplateName || committeeDataToUse.meetingTemplateName || '',
        ShortName: committeeDataToUse.ShortName || committeeDataToUse.shortName || '',
        TypeId: committeeDataToUse.TypeId || committeeDataToUse.typeId || '',
        CategoryId: committeeDataToUse.CategoryId || committeeDataToUse.categoryId || '',
        StartDate:
          committeeDataToUse.StartDate || committeeDataToUse.startDate
            ? (committeeDataToUse.StartDate || committeeDataToUse.startDate).toString().split('T')[0]
            : '',
        EndDate:
          committeeDataToUse.EndDate || committeeDataToUse.endDate ? (committeeDataToUse.EndDate || committeeDataToUse.endDate).toString().split('T')[0] : '',
        FormationDate:
          committeeDataToUse.FormationDate || committeeDataToUse.formationDate
            ? (committeeDataToUse.FormationDate || committeeDataToUse.formationDate).toString().split('T')[0]
            : '',
        IsActive: committeeDataToUse.IsActive ?? committeeDataToUse.isActive ?? true,
      };

      // Convert IDs to strings for form inputs
      if (data.DepartmentId) data.DepartmentId = String(data.DepartmentId);
      if (data.TypeId) data.TypeId = String(data.TypeId);
      if (data.CategoryId) data.CategoryId = String(data.CategoryId);

      reset(data);
    }
  }, [committeeDataToUse, reset]);

  const onSubmit = async data => {
    const payload = {
      ...data,
      DepartmentId: data.DepartmentId ? parseInt(data.DepartmentId) : null,
      TypeId: data.TypeId ? parseInt(data.TypeId) : null,
      CategoryId: data.CategoryId ? parseInt(data.CategoryId) : null,
      StartDate: data.StartDate ? new Date(data.StartDate).toISOString() : null,
      EndDate: data.EndDate ? new Date(data.EndDate).toISOString() : null,
      FormationDate: data.FormationDate ? new Date(data.FormationDate).toISOString() : null,
      Number: data.Number || null,
      MeetingTemplateName: data.MeetingTemplateName || null,
      ShortName: data.ShortName || null,
      IsActive: data.IsActive ?? true,
    };

    if (isEditMode) {
      // Handle both camelCase and PascalCase property names
      payload.Id = committeeDataToUse?.Id || committeeDataToUse?.id || parseInt(committeeId) || null;
    }

    const mutation = isEditMode ? updateMutation : createMutation;

    mutation.mutate(payload, {
      onSuccess: async response => {
        // Check if response is successful
        if (!isApiResponseSuccessful(response)) {
          const errorMessage = getApiErrorMessage(response, t('error'));
          toast.error(errorMessage);
          return;
        }

        // Extract committee ID from response
        // API interceptor returns response.data directly, so response is already the Result<IdDto> object
        // Result structure: { Data: { IntId: 123 }, Succeeded: true, Errors: [] }
        // So the ID is at: response.Data.IntId
        console.log('Full response object:', response);

        const createdCommitteeId =
          response?.Data?.IntId ||
          response?.data?.IntId ||
          response?.Data?.intId ||
          response?.data?.intId ||
          response?.IntId ||
          response?.intId ||
          committeeId ||
          committeeDataToUse?.Id;

        console.log('Committee created/updated. ID:', createdCommitteeId);
        console.log('Members to add:', members);

        if (!createdCommitteeId) {
          console.error('CRITICAL ERROR: Could not extract committee ID from response!');
          console.error('Response structure:', JSON.stringify(response, null, 2));
          toast.error('Committee created but failed to get ID. Members were not added.');
          return;
        }

        // Handle members and permissions
        if (members.length > 0 && createdCommitteeId) {
          try {
            await handleMembersAndPermissions(createdCommitteeId);
          } catch (error) {
            console.error('Error saving members:', error);
            toast.error(error.message || t('errorSavingMembers'));
            return;
          }
        }

        toast.success(t(isEditMode ? 'updateSuccess' : 'createSuccess'));
        onSuccess?.(response);
        // Navigate back to home if no custom handler
        if (!onSuccess && !onClose) {
          const defaultRoute = getDefaultSuccessRoute();
          navigate(defaultRoute);
        } else {
          onClose?.();
        }
      },
      onError: error => {
        console.error('Mutation error:', error);
        toast.error(error.message || t('error'));
      },
    });
  };

  // Handle saving members and their permissions
  const handleMembersAndPermissions = async committeeId => {
    // Filter members with userId and roleId
    const validMembers = members.filter(m => m.userId && m.roleId);

    console.log('Valid members to add:', validMembers);
    console.log('Committee ID:', committeeId);

    if (validMembers.length === 0) {
      console.log('No valid members to add');
      return;
    }

    // Prepare members for API
    const membersToAdd = validMembers.map(m => ({
      CommitteeId: committeeId,
      UserId: m.userId,
      RoleId: m.roleId,
    }));

    console.log('Calling API to add members:', membersToAdd);

    // Add members to committee
    try {
      const addMembersResponse = await new Promise((resolve, reject) => {
        addMembersMutation.mutate(
          { Members: membersToAdd },
          {
            onSuccess: response => {
              console.log('Add members response:', response);
              if (isApiResponseSuccessful(response)) {
                resolve(response);
              } else {
                reject(new Error(getApiErrorMessage(response, 'Failed to add members')));
              }
            },
            onError: error => {
              console.error('Add members error:', error);
              reject(error);
            },
          }
        );
      });

      console.log('Members added successfully:', addMembersResponse);

      // Wait a bit for the database to save
      await new Promise(resolve => setTimeout(resolve, 300));

      // Fetch the created members to get their IDs
      const { API } = await import('../services/API');
      const membersResponse = await API.get('/committee-service/Member/by-committee', {
        params: { CommitteeId: parseInt(committeeId) },
      });

      console.log('Fetched members:', membersResponse);

      if (!membersResponse?.data || membersResponse.data.length === 0) {
        console.warn('No members found after creation');
        return;
      }

      const createdMembers = Array.isArray(membersResponse.data) ? membersResponse.data : membersResponse.data.data || [];

      // Fetch all permissions and role permissions for saving member permissions
      const [permissionsResponse, rolePermissionsResponse] = await Promise.all([
        API.get('/committee-service/Permission'),
        API.get('/committee-service/RolePermission'),
      ]);

      const allPermissions = permissionsResponse?.data || permissionsResponse?.data?.data || [];
      const allRolePermissions = rolePermissionsResponse?.data || rolePermissionsResponse?.data?.data || [];

      // Organize role permissions by roleId
      const rolePermissionsCache = {};
      allRolePermissions.forEach(rp => {
        const roleId = rp.roleId || rp.RoleId;
        if (!rolePermissionsCache[roleId]) {
          rolePermissionsCache[roleId] = [];
        }
        rolePermissionsCache[roleId].push(rp);
      });

      // Match created members with our validMembers by UserId and save permissions
      for (let i = 0; i < validMembers.length; i++) {
        const memberData = validMembers[i];
        const createdMember = createdMembers.find(
          cm => (cm.userId || cm.UserId) === memberData.userId || (cm.userId || cm.UserId) === parseInt(memberData.userId)
        );

        if (!createdMember) {
          console.warn(`Member with UserId ${memberData.userId} not found in created members`);
          continue;
        }

        const memberId = createdMember.id || createdMember.Id;
        console.log(`Processing permissions for member ${memberId} (UserId: ${memberData.userId})`);

        // Get role permissions for this member's role
        const rolePermissions = rolePermissionsCache[memberData.roleId] || [];

        // Determine which permissions to save
        let permissionsToSave = {};

        if (memberData.isCustomized && Object.keys(memberData.permissions).length > 0) {
          // Use custom permissions
          permissionsToSave = memberData.permissions;
        } else {
          // Use role default permissions - save ALL permissions to MemberPermissions table
          allPermissions.forEach(perm => {
            const permId = perm.id || perm.Id;
            const rolePerm = rolePermissions.find(rp => (rp.permissionId || rp.PermissionId) === permId);
            permissionsToSave[permId] = rolePerm ? rolePerm.isGranted ?? rolePerm.IsGranted ?? false : false;
          });
        }

        // Save each permission to MemberPermissions table
        for (const [permissionId, isGranted] of Object.entries(permissionsToSave)) {
          try {
            await new Promise((resolve, reject) => {
              createMemberPermissionMutation.mutate(
                {
                  MemberId: memberId,
                  PermissionId: parseInt(permissionId),
                  IsGranted: Boolean(isGranted),
                },
                {
                  onSuccess: response => {
                    if (isApiResponseSuccessful(response)) {
                      resolve(response);
                    } else {
                      reject(new Error(getApiErrorMessage(response, 'Failed to save permission')));
                    }
                  },
                  onError: error => {
                    reject(error);
                  },
                }
              );
            });
          } catch (error) {
            console.error(`Failed to save permission ${permissionId} for member ${memberId}:`, error);
            // Continue with other permissions even if one fails
          }
        }
      }

      console.log('All member permissions saved successfully');
    } catch (error) {
      console.error('Error in handleMembersAndPermissions:', error);
      throw error;
    }
  };

  const committeeTypes = typesData?.data || [];
  const committeeCategories = categoriesData?.data || [];
  const departments = departmentsData?.data || [];

  // Loading state for update mode
  if (committeeId && isLoadingCommittee) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand border-t-transparent" />
          </div>
        </Card>
      </div>
    );
  }

  // Error state for update mode
  if (committeeId && (committeeError || !committeeDataToUse)) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="p-6">
          <div className="text-center py-12">
            <p className="text-destructive">{t('error')}</p>
            <button onClick={() => navigate('/')} className="mt-4 text-brand hover:underline">
              {tHome('breadcrumbs.home')}
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <Card className="w-full">
        <FormHeader
          icon={<Users size={42} />}
          title={t(isEditMode ? 'editTitle' : 'createTitle')}
          subtitle={t(isEditMode ? 'editSubtitle' : 'createSubtitle')}
        />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-6 hover:border-border border-2 border-transparent p-3 m-3 rounded-xl transition-all duration-300">
            <h3 className="text-lg font-semibold text-text border-b border-brand/30 pb-2">{t('sections.basicInfo')}</h3>
            <div className="space-y-4">
              {/* Arabic Name - Required */}
              <div>
                <label htmlFor="ArabicName" className="block text-sm font-medium text-text mb-2">
                  {t('arabicName')} <span className="text-destructive">*</span>
                </label>
                <input
                  id="ArabicName"
                  type="text"
                  {...register('ArabicName', {
                    required: t('arabicNameRequired'),
                    maxLength: { value: 200, message: t('maxLength200') },
                  })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none bg-surface text-text ${
                    errors.ArabicName ? 'border-destructive' : 'border-border'
                  }`}
                  placeholder={t('arabicNamePlaceholder')}
                  disabled={isSubmitting}
                />
                {errors.ArabicName && <p className="mt-1 text-sm text-destructive">{errors.ArabicName.message}</p>}
              </div>

              {/* English Name - Required */}
              <div>
                <label htmlFor="EnglishName" className="block text-sm font-medium text-text mb-2">
                  {t('englishName')} <span className="text-destructive">*</span>
                </label>
                <input
                  id="EnglishName"
                  type="text"
                  {...register('EnglishName', {
                    required: t('englishNameRequired'),
                    maxLength: { value: 200, message: t('maxLength200') },
                  })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none bg-surface text-text ${
                    errors.EnglishName ? 'border-destructive' : 'border-border'
                  }`}
                  placeholder={t('englishNamePlaceholder')}
                  disabled={isSubmitting}
                />
                {errors.EnglishName && <p className="mt-1 text-sm text-destructive">{errors.EnglishName.message}</p>}
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Number */}
                <div>
                  <label htmlFor="Number" className="block text-sm font-medium text-text mb-2">
                    {t('number')}
                  </label>
                  <input
                    id="Number"
                    type="text"
                    {...register('Number', {
                      maxLength: { value: 50, message: t('maxLength50') },
                    })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none bg-surface text-text ${
                      errors.Number ? 'border-destructive' : 'border-border'
                    }`}
                    placeholder={t('numberPlaceholder')}
                    disabled={isSubmitting}
                  />
                  {errors.Number && <p className="mt-1 text-sm text-destructive">{errors.Number.message}</p>}
                </div>

                {/* Short Name */}
                <div>
                  <label htmlFor="ShortName" className="block text-sm font-medium text-text mb-2">
                    {t('shortName')}
                  </label>
                  <input
                    id="ShortName"
                    type="text"
                    {...register('ShortName', {
                      maxLength: { value: 100, message: t('maxLength100') },
                    })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none bg-surface text-text ${
                      errors.ShortName ? 'border-destructive' : 'border-border'
                    }`}
                    placeholder={t('shortNamePlaceholder')}
                    disabled={isSubmitting}
                  />
                  {errors.ShortName && <p className="mt-1 text-sm text-destructive">{errors.ShortName.message}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Classification Section */}
          <div className="space-y-6 hover:border-border border-2 border-transparent p-3 m-3 rounded-xl transition-all duration-300">
            <h3 className="text-lg font-semibold text-text border-b border-brand/30 pb-2">{t('sections.classification')}</h3>
            <div className="space-y-4">
              {/* Two Column Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Committee Type */}
                <div>
                  <label htmlFor="TypeId" className="block text-sm font-medium text-text mb-2">
                    {t('type')}
                  </label>
                  <select
                    id="TypeId"
                    {...register('TypeId')}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none bg-surface text-text border-border"
                    disabled={isSubmitting}
                  >
                    <option value="">{t('selectType')}</option>
                    {committeeTypes.map(type => (
                      <option key={type.Id} value={type.Id}>
                        {i18n.language === 'ar' ? type.ArabicName : type.EnglishName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Committee Category */}
                <div>
                  <label htmlFor="CategoryId" className="block text-sm font-medium text-text mb-2">
                    {t('category')}
                  </label>
                  <select
                    id="CategoryId"
                    {...register('CategoryId')}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none bg-surface text-text border-border"
                    disabled={isSubmitting}
                  >
                    <option value="">{t('selectCategory')}</option>
                    {committeeCategories.map(category => (
                      <option key={category.Id} value={category.Id}>
                        {i18n.language === 'ar' ? category.ArabicName : category.EnglishName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Department */}
              <div>
                <label htmlFor="DepartmentId" className="block text-sm font-medium text-text mb-2">
                  {t('department')}
                </label>
                <select
                  id="DepartmentId"
                  {...register('DepartmentId')}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none bg-surface text-text border-border"
                  disabled={isSubmitting}
                >
                  <option value="">{t('selectDepartment')}</option>
                  {departments.map(dept => (
                    <option key={dept.Id} value={dept.Id}>
                      {i18n.language === 'ar' ? dept.ArabicName : dept.EnglishName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Meeting Template Section */}
          <div className="space-y-6 hover:border-border border-2 border-transparent p-3 m-3 rounded-xl transition-all duration-300">
            <h3 className="text-lg font-semibold text-text border-b border-brand/30 pb-2">{t('sections.meetingTemplate')}</h3>
            <div>
              <label htmlFor="MeetingTemplateName" className="block text-sm font-medium text-text mb-2">
                {t('meetingTemplateName')}
              </label>
              <input
                id="MeetingTemplateName"
                type="text"
                {...register('MeetingTemplateName', {
                  maxLength: { value: 200, message: t('maxLength200') },
                })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none bg-surface text-text ${
                  errors.MeetingTemplateName ? 'border-destructive' : 'border-border'
                }`}
                placeholder={t('meetingTemplateNamePlaceholder')}
                disabled={isSubmitting}
              />
              {errors.MeetingTemplateName && <p className="mt-1 text-sm text-destructive">{errors.MeetingTemplateName.message}</p>}
            </div>
          </div>

          {/* Timeline Section */}
          <div className="space-y-6 hover:border-border border-2 border-transparent p-3 m-3 rounded-xl transition-all duration-300">
            <h3 className="text-lg font-semibold text-text border-b border-brand/30 pb-2">{t('sections.timeline')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Formation Date */}
              <div>
                <label htmlFor="FormationDate" className="block text-sm font-medium text-text mb-2">
                  {t('formationDate')}
                </label>
                <input
                  id="FormationDate"
                  type="date"
                  {...register('FormationDate')}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none bg-surface text-text border-border"
                  disabled={isSubmitting}
                />
              </div>

              {/* Start Date */}
              <div>
                <label htmlFor="StartDate" className="block text-sm font-medium text-text mb-2">
                  {t('startDate')}
                </label>
                <input
                  id="StartDate"
                  type="date"
                  {...register('StartDate', {
                    validate: value => {
                      if (endDate && value && new Date(value) >= new Date(endDate)) {
                        return t('startDateBeforeEndDate');
                      }
                      return true;
                    },
                  })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none bg-surface text-text ${
                    errors.StartDate ? 'border-destructive' : 'border-border'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.StartDate && <p className="mt-1 text-sm text-destructive">{errors.StartDate.message}</p>}
              </div>

              {/* End Date */}
              <div>
                <label htmlFor="EndDate" className="block text-sm font-medium text-text mb-2">
                  {t('endDate')}
                </label>
                <input
                  id="EndDate"
                  type="date"
                  {...register('EndDate', {
                    validate: value => {
                      if (startDate && value && new Date(value) <= new Date(startDate)) {
                        return t('endDateAfterStartDate');
                      }
                      return true;
                    },
                  })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none bg-surface text-text ${
                    errors.EndDate ? 'border-destructive' : 'border-border'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.EndDate && <p className="mt-1 text-sm text-destructive">{errors.EndDate.message}</p>}
              </div>
            </div>
          </div>

          {/* Status Section */}
          <div className="space-y-6 hover:border-border border-2 border-transparent p-3 m-3 rounded-xl transition-all duration-300">
            <h3 className="text-lg font-semibold text-text border-b border-brand/30 pb-2">{t('sections.status')}</h3>
            <div className="flex items-center gap-2">
              <input
                id="IsActive"
                type="checkbox"
                {...register('IsActive')}
                className="w-4 h-4 text-brand bg-surface border-border rounded focus:ring-brand"
                disabled={isSubmitting}
              />
              <label htmlFor="IsActive" className="text-sm font-medium text-text cursor-pointer">
                {t('isActive')}
              </label>
            </div>
          </div>

          {/* Members Section */}
          <CommitteeMembersSection committeeId={committeeId || committeeDataToUse?.Id} onChange={setMembers} isEditMode={isEditMode} disabled={isSubmitting} />

          {/* Form Actions */}
          <FormActions isSubmitting={isSubmitting} isEditMode={isEditMode} onCancel={onClose} />
        </form>
      </Card>
    </div>
  );
};

export default CommitteeForm;
