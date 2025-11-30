import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../../../components/ui/Card';
import EmptyState from '../../../../components/ui/EmptyState';
import { Paperclip, Download, Edit, Trash2 } from 'lucide-react';
import { useGetMeetingAttachmentsQuery, useDeleteRelatedAttachmentMeetingMutation } from '../../../../queries/meetings';
import AttachmentModal from './AttachmentModal';
import DeleteDialog from '../../../../components/ui/DeleteDialog';
import { useToast } from '../../../../context/ToasterContext';
import { isApiResponseSuccessful, getApiErrorMessage } from '../../../../utils/apiResponseHandler';

const AttachmentsTab = ({ meeting }) => {
  const { t } = useTranslation('meetingDetails');
  const { t: tCommon } = useTranslation('common');
  const toast = useToast();

  const meetingId = meeting?.id || meeting?.Id;
  const { data: attachmentsResponse, isLoading, refetch } = useGetMeetingAttachmentsQuery(meetingId);
  const attachments = attachmentsResponse?.data || attachmentsResponse?.Data || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState(null);

  const deleteMutation = useDeleteRelatedAttachmentMeetingMutation();

  const handleAdd = () => {
    setSelectedAttachment(null);
    setIsModalOpen(true);
  };

  const handleEdit = attachment => {
    setSelectedAttachment(attachment);
    setIsModalOpen(true);
  };

  const handleDelete = attachment => {
    setSelectedAttachment(attachment);
    setIsDeleteDialogOpen(true);
  };

  const handleDownload = attachment => {
    if (attachment.documentContent) {
      try {
        const byteCharacters = atob(attachment.documentContent);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: `application/${attachment.documentExt || 'octet-stream'}` });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = attachment.documentName || attachment.name || 'attachment';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success(t('attachments.downloadSuccess'));
      } catch (error) {
        console.error('Download error:', error);
        toast.error(t('attachments.downloadError') || 'Failed to download attachment');
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedAttachment) return;

    try {
      const response = await deleteMutation.mutateAsync({
        Id: selectedAttachment.id || selectedAttachment.Id,
      });

      if (isApiResponseSuccessful(response)) {
        toast.success(t('attachments.deleteSuccess'));
        setIsDeleteDialogOpen(false);
        setSelectedAttachment(null);
        refetch();
      } else {
        const errorMessage = getApiErrorMessage(response, tCommon('error') || 'An error occurred');
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message || tCommon('error') || 'An error occurred');
    }
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text">{t('attachments.title')}</h3>
          <button onClick={handleAdd} className="text-sm text-brand hover:underline cursor-pointer">
            {t('attachments.upload')}
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="border border-border rounded-lg p-4 bg-surface animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !attachments || attachments.length === 0 ? (
          <EmptyState title={t('attachments.noAttachments')} message={t('attachments.noAttachmentsDescription')} icon={Paperclip} />
        ) : (
          <div className="space-y-4">
            {attachments.map(attachment => (
              <div key={attachment.id} className="border border-border rounded-lg p-4 bg-surface hover:bg-surface-elevated transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                    <Paperclip className="h-5 w-5 text-brand" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-text mb-1">{attachment.documentName || attachment.name || attachment.title || 'Untitled Attachment'}</h4>
                    {attachment.description && <p className="text-xs text-text-muted">{attachment.description}</p>}
                    {attachment.fileSize && <p className="text-xs text-text-muted mt-1">{attachment.fileSize}</p>}
                    {attachment.documentExt && (
                      <p className="text-xs text-text-muted mt-1">
                        {t('attachments.type')}: {attachment.documentExt}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {attachment.documentContent && (
                      <button
                        onClick={() => handleDownload(attachment)}
                        className="p-2 hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
                        title={t('attachments.download')}
                      >
                        <Download className="h-4 w-4 text-text-muted" />
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(attachment)}
                      className="p-2 text-text-muted hover:text-text transition-colors cursor-pointer"
                      title={t('attachments.edit')}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(attachment)}
                      className="p-2 text-destructive hover:text-destructive/80 transition-colors cursor-pointer"
                      title={t('attachments.delete')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <AttachmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAttachment(null);
          refetch();
        }}
        meetingId={meetingId}
        attachment={selectedAttachment}
      />

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          if (!deleteMutation.isPending) {
            setIsDeleteDialogOpen(false);
            setSelectedAttachment(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        title={t('attachments.deleteDialog.title')}
        message={t('attachments.deleteDialog.message', {
          name: selectedAttachment?.documentName || selectedAttachment?.name || '',
        })}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
};

export default AttachmentsTab;
