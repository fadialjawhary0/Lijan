import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import { useCreateRelatedAttachmentMeetingMutation, useUpdateRelatedAttachmentMeetingMutation } from '../../../../queries/meetings';
import { useGetAllAttachmentTypesQuery } from '../../../../queries/attachmentTypes';
import { useToast } from '../../../../context/ToasterContext';
import { isApiResponseSuccessful, getApiErrorMessage } from '../../../../utils/apiResponseHandler';
import { useCommittee } from '../../../../context/CommitteeContext';
import { Upload } from 'lucide-react';

const AttachmentModal = ({ isOpen, onClose, meetingId, attachment = null }) => {
  const { t, i18n } = useTranslation('meetingDetails');
  const { t: tCommon } = useTranslation('common');
  const toast = useToast();
  const { selectedCommitteeId } = useCommittee();
  const isRTL = i18n.dir() === 'rtl';
  const isEditMode = !!attachment;
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      documentName: '',
      attachmentTypeId: '',
      documentContent: '',
      documentExt: '',
    },
  });

  const createMutation = useCreateRelatedAttachmentMeetingMutation();
  const updateMutation = useUpdateRelatedAttachmentMeetingMutation();

  // Fetch attachment types
  const { data: attachmentTypesData } = useGetAllAttachmentTypesQuery({ PageSize: 1000 });
  const attachmentTypes = attachmentTypesData?.data || [];

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && attachment) {
        reset({
          documentName: attachment.documentName || attachment.name || '',
          attachmentTypeId: attachment.attachmentTypeId?.toString() || '',
          documentContent: attachment.documentContent || '',
          documentExt: attachment.documentExt || '',
        });
        setFilePreview(null);
        setFile(null);
      } else {
        reset({
          documentName: '',
          attachmentTypeId: '',
          documentContent: '',
          documentExt: '',
        });
        setFilePreview(null);
        setFile(null);
      }
    }
  }, [isOpen, isEditMode, attachment, reset]);

  const handleFileChange = e => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setValue('documentName', selectedFile.name);

      // Get file extension
      const ext = selectedFile.name.split('.').pop();
      setValue('documentExt', ext);

      // Read file as base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
        setValue('documentContent', reader.result.split(',')[1]); // Remove data:type;base64, prefix
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const onSubmit = async data => {
    try {
      const payload = {
        DocumentName: data.documentName,
        DocumentExt: data.documentExt || file?.name.split('.').pop() || '',
        DocumentContent: data.documentContent || filePreview?.split(',')[1] || '',
        AttachmentTypeId: data.attachmentTypeId ? parseInt(data.attachmentTypeId) : null,
        CommitteeId: selectedCommitteeId ? parseInt(selectedCommitteeId) : null,
        MeetingId: parseInt(meetingId),
      };

      let response;
      if (isEditMode) {
        payload.Id = attachment.id || attachment.Id;
        if (!payload.DocumentContent && attachment.documentContent) {
          payload.DocumentContent = attachment.documentContent;
        }
        if (!payload.DocumentExt && attachment.documentExt) {
          payload.DocumentExt = attachment.documentExt;
        }
        response = await updateMutation.mutateAsync(payload);
      } else {
        if (!payload.DocumentContent) {
          toast.error(t('attachments.fileRequired') || 'Please select a file');
          return;
        }
        response = await createMutation.mutateAsync(payload);
      }

      if (isApiResponseSuccessful(response)) {
        toast.success(isEditMode ? t('attachments.updateSuccess') : t('attachments.createSuccess'));
        onClose();
        reset();
        setFile(null);
        setFilePreview(null);
      } else {
        const errorMessage = getApiErrorMessage(response, tCommon('error') || 'An error occurred');
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Attachment save error:', error);
      toast.error(error.message || tCommon('error') || 'An error occurred');
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? t('attachments.editAttachment') : t('attachments.upload')} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {!isEditMode && (
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">{t('attachments.file')}</label>
            <div className="relative">
              <input type="file" onChange={handleFileChange} className="hidden" id="file-upload" accept="*/*" disabled={isLoading} />
              <label
                htmlFor="file-upload"
                className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-brand transition-colors ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Upload className="h-5 w-5 text-text-muted" />
                <span className="text-sm text-text-muted">{file ? file.name : t('attachments.selectFile') || 'Select a file'}</span>
              </label>
            </div>
            {file && (
              <p className="mt-2 text-sm text-text-muted">
                {t('attachments.fileSelected')}: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">{t('attachments.name')}</label>
          <input
            {...register('documentName', {
              required: t('attachments.nameRequired') || 'Name is required',
            })}
            type="text"
            className={`w-full px-3 py-2 border border-border rounded-lg bg-surface text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
              errors.documentName ? 'border-destructive' : ''
            } ${isRTL ? 'text-right' : 'text-left'}`}
            placeholder={t('attachments.namePlaceholder')}
            disabled={isLoading}
          />
          {errors.documentName && <p className="mt-1 text-sm text-destructive">{errors.documentName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">{t('attachments.type')}</label>
          <select
            {...register('attachmentTypeId', {
              required: t('attachments.typeRequired') || 'Type is required',
            })}
            className={`w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent cursor-pointer ${
              errors.attachmentTypeId ? 'border-destructive' : ''
            } ${isRTL ? 'text-right' : 'text-left'}`}
            disabled={isLoading}
          >
            <option value="">{t('attachments.selectType') || 'Select a type'}</option>
            {attachmentTypes.map(type => (
              <option key={type.id} value={type.id}>
                {isRTL ? type.arabicName : type.englishName}
              </option>
            ))}
          </select>
          {errors.attachmentTypeId && <p className="mt-1 text-sm text-destructive">{errors.attachmentTypeId.message}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            {tCommon('cancel')}
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? tCommon('saving') : isEditMode ? tCommon('update') : tCommon('create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AttachmentModal;
