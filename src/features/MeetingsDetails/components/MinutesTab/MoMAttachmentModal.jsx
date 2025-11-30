import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import { useCreateMinutesOfMeetingAttachmentMutation } from '../../../../queries/minutesOfMeetings';
import { useToast } from '../../../../context/ToasterContext';
import { isApiResponseSuccessful, getApiErrorMessage } from '../../../../utils/apiResponseHandler';
import { Upload } from 'lucide-react';

const MoMAttachmentModal = ({ isOpen, onClose, minutesOfMeetingId }) => {
  const { t, i18n } = useTranslation('meetingDetails');
  const { t: tCommon } = useTranslation('common');
  const toast = useToast();
  const isRTL = i18n.dir() === 'rtl';
  const [file, setFile] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fileName: '',
    },
  });

  const createMutation = useCreateMinutesOfMeetingAttachmentMutation();

  useEffect(() => {
    if (isOpen) {
      reset({
        fileName: '',
      });
      setFile(null);
    }
  }, [isOpen, reset]);

  const handleFileChange = e => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setValue('fileName', selectedFile.name);
    }
  };

  const onSubmit = async (data, e) => {
    e?.preventDefault(); // Prevent form submission redirect

    if (!file) {
      toast.error(t('minutes.attachments.fileRequired') || 'Please select a file');
      return;
    }

    if (!minutesOfMeetingId) {
      toast.error(t('minutes.attachments.noMoMError') || 'Please save the Minutes of Meeting first');
      return;
    }

    try {
      // Read file as ArrayBuffer and convert to byte array
      const arrayBuffer = await file.arrayBuffer();
      const fileContent = new Uint8Array(arrayBuffer);

      const fileExtension = file.name.split('.').pop() || '';
      const contentType = file.type || `application/${fileExtension}`;

      const payload = {
        MinutesOfMeetingId: parseInt(minutesOfMeetingId),
        FileName: data.fileName || file.name,
        FileExtension: fileExtension,
        ContentType: contentType,
        FileSize: file.size,
        FileContent: Array.from(fileContent), // Convert Uint8Array to regular array for JSON serialization
      };

      const response = await createMutation.mutateAsync(payload);

      if (isApiResponseSuccessful(response)) {
        toast.success(t('minutes.attachments.createSuccess') || 'Attachment uploaded successfully');
        onClose();
        reset();
        setFile(null);
      } else {
        const errorMessage = getApiErrorMessage(response, tCommon('error') || 'An error occurred');
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Attachment upload error:', error);
      toast.error(error.message || tCommon('error') || 'An error occurred');
    }
  };

  const isLoading = createMutation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('minutes.attachments.upload') || 'Upload Attachment'} size="md">
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSubmit(onSubmit)(e);
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">{t('minutes.attachments.file') || 'File'}</label>
          <div className="relative">
            <input type="file" onChange={handleFileChange} className="hidden" id="mom-file-upload" accept="*/*" disabled={isLoading} />
            <label
              htmlFor="mom-file-upload"
              className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-brand transition-colors ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Upload className="h-5 w-5 text-text-muted" />
              <span className="text-sm text-text-muted">{file ? file.name : t('minutes.attachments.selectFile') || 'Select a file'}</span>
            </label>
          </div>
          {file && (
            <p className="mt-2 text-sm text-text-muted">
              {t('minutes.attachments.fileSelected') || 'File selected'}: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">{t('minutes.attachments.name') || 'Name'}</label>
          <input
            {...register('fileName', {
              required: t('minutes.attachments.nameRequired') || 'Name is required',
            })}
            type="text"
            className={`w-full px-3 py-2 border border-border rounded-lg bg-surface text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
              errors.fileName ? 'border-destructive' : ''
            } ${isRTL ? 'text-right' : 'text-left'}`}
            placeholder={t('minutes.attachments.namePlaceholder') || 'Enter file name'}
            disabled={isLoading}
          />
          {errors.fileName && <p className="mt-1 text-sm text-destructive">{errors.fileName.message}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            {tCommon('cancel')}
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? tCommon('saving') : tCommon('create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default MoMAttachmentModal;
