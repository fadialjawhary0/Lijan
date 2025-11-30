import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import Card from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import RichTextEditor from '../../../../components/ui/RichTextEditor';
import {
  useGetMinutesOfMeetingByMeetingIdQuery,
  useCreateMinutesOfMeetingMutation,
  useUpdateMinutesOfMeetingMutation,
  usePublishMinutesOfMeetingMutation,
  useGetMinutesOfMeetingAttachmentsQuery,
  downloadMinutesOfMeetingAttachment,
} from '../../../../queries/minutesOfMeetings';
import { useGetMeetingByIdQuery, useGetMeetingAgendaQuery, useGetMeetingParticipantsQuery } from '../../../../queries/meetings';
import MoMAttachmentModal from './MoMAttachmentModal';
import MoMPreview from './MoMPreview';
import { useToast } from '../../../../context/ToasterContext';
import { useAuth } from '../../../../context/AuthContext';
import { useCommittee } from '../../../../context/CommitteeContext';
import { isApiResponseSuccessful, getApiErrorMessage } from '../../../../utils/apiResponseHandler';
import { Save, Send, FileDown, Eye, Edit, Calendar, MapPin, Users, User, FileText, CheckSquare, ListChecks, Vote, Paperclip } from 'lucide-react';
import { formatDate, formatTime } from '../../../../utils/dateUtils';
// Dynamic imports for PDF generation libraries to avoid blocking initial load
let jsPDF;
let html2canvas;

const loadPDFLibraries = async () => {
  if (!jsPDF) {
    jsPDF = (await import('jspdf')).default;
  }
  if (!html2canvas) {
    html2canvas = (await import('html2canvas')).default;
  }
  return { jsPDF, html2canvas };
};

const MinutesTab = ({ meeting }) => {
  const { t, i18n } = useTranslation('meetingDetails');
  const { t: tCommon } = useTranslation('common');
  const toast = useToast();
  const { userId } = useAuth();
  const { selectedCommitteeId } = useCommittee();
  const isRTL = i18n.dir() === 'rtl';

  const meetingId = meeting?.id || meeting?.Id;

  // Fetch MoM data
  const {
    data: momResponse,
    isLoading: momLoading,
    refetch: refetchMom,
  } = useGetMinutesOfMeetingByMeetingIdQuery(meetingId, {
    retry: false, // Don't retry if not found (first time creating)
  });
  const momData = momResponse?.data || momResponse?.Data || null;
  const existingMom = momData && !momData.error;

  // Fetch meeting details for auto-population
  const { data: meetingDetailsResponse } = useGetMeetingByIdQuery(meetingId);
  const meetingDetails = meetingDetailsResponse?.data || meetingDetailsResponse?.Data || null;

  // Fetch related data
  const { data: agendaResponse } = useGetMeetingAgendaQuery(meetingId);
  const agendaItems = agendaResponse?.data || agendaResponse?.Data || [];

  const { data: participantsResponse } = useGetMeetingParticipantsQuery(meetingId);
  const participants = participantsResponse?.data || participantsResponse?.Data || [];

  // Fetch MoM attachments (not meeting attachments)
  const { data: momAttachmentsResponse, refetch: refetchMomAttachments } = useGetMinutesOfMeetingAttachmentsQuery(existingMom ? momData.id : null, {
    enabled: !!existingMom && !!momData?.id,
  });
  const momAttachments = momAttachmentsResponse?.data || momAttachmentsResponse?.Data || [];

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isEditingPublished, setIsEditingPublished] = useState(false);
  const [discussionNotes, setDiscussionNotes] = useState('');
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);

  const createMutation = useCreateMinutesOfMeetingMutation();
  const updateMutation = useUpdateMinutesOfMeetingMutation();
  const publishMutation = usePublishMinutesOfMeetingMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      committeeName: '',
      meetingTitle: '',
      meetingDate: '',
      meetingStartTime: '',
      meetingEndTime: '',
      location: '',
      chairperson: '',
      secretary: '',
    },
  });

  // Auto-populate form when meeting details or existing MoM loads
  useEffect(() => {
    if (existingMom) {
      reset({
        committeeName: momData.committeeName || '',
        meetingTitle: momData.meetingTitle || '',
        meetingDate: momData.meetingDate ? new Date(momData.meetingDate).toISOString().split('T')[0] : '',
        meetingStartTime: momData.meetingStartTime || '',
        meetingEndTime: momData.meetingEndTime || '',
        location: momData.location || '',
        chairperson: momData.chairperson || '',
        secretary: momData.secretary || '',
      });
      setDiscussionNotes(momData.discussionNotes || '');
      setIsPreviewMode(momData.status === 3 && !isEditingPublished); // Published status, but not when editing
      setIsEditingPublished(false);
    } else if (meetingDetails) {
      // Auto-populate from meeting details
      const meetingDate = meetingDetails.date ? new Date(meetingDetails.date).toISOString().split('T')[0] : '';
      const startTime = meetingDetails.startTime || '';
      const endTime = meetingDetails.endTime || '';

      reset({
        committeeName: meetingDetails.committee?.englishName || meetingDetails.committee?.arabicName || '',
        meetingTitle: isRTL ? meetingDetails.arabicName : meetingDetails.englishName || '',
        meetingDate: meetingDate,
        meetingStartTime: startTime,
        meetingEndTime: endTime,
        location: meetingDetails.location?.englishName || meetingDetails.location?.arabicName || '',
        chairperson: '',
        secretary: '',
      });
    }
  }, [existingMom, momData, meetingDetails, reset, isRTL]);

  const isPublished = existingMom && momData.status === 3 && !isEditingPublished; // Published = 3, but not when editing
  const isDraft = !existingMom || momData.status === 1 || isEditingPublished; // Draft = 1, or editing published
  const isReviewing = existingMom && momData.status === 2 && !isEditingPublished; // Reviewing = 2, but not when editing

  const handleSaveDraft = async data => {
    try {
      const payload = {
        MeetingId: parseInt(meetingId),
        CommitteeName: data.committeeName,
        MeetingTitle: data.meetingTitle,
        MeetingDate: data.meetingDate ? new Date(data.meetingDate).toISOString() : null,
        MeetingStartTime: data.meetingStartTime || null,
        MeetingEndTime: data.meetingEndTime || null,
        Location: data.location,
        Chairperson: data.chairperson,
        Secretary: data.secretary,
        DiscussionNotes: discussionNotes,
        Status: 1, // Draft
      };

      let response;
      if (existingMom) {
        payload.Id = momData.id;
        response = await updateMutation.mutateAsync(payload);
      } else {
        response = await createMutation.mutateAsync(payload);
      }

      if (isApiResponseSuccessful(response)) {
        toast.success(t('minutes.saveDraftSuccess'));
        refetchMom();
      } else {
        const errorMessage = getApiErrorMessage(response, tCommon('error') || 'An error occurred');
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Save draft error:', error);
      toast.error(error.message || tCommon('error') || 'An error occurred');
    }
  };

  const handlePublish = async data => {
    if (!existingMom) {
      toast.error(t('minutes.saveDraftFirst') || 'Please save as draft first');
      return;
    }

    try {
      const response = await publishMutation.mutateAsync({
        Id: momData.id,
        PublishedByMemberId: userId ? parseInt(userId) : null,
      });

      if (isApiResponseSuccessful(response)) {
        toast.success(t('minutes.publishSuccess'));
        setIsPreviewMode(true);
        refetchMom();
      } else {
        const errorMessage = getApiErrorMessage(response, tCommon('error') || 'An error occurred');
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Publish error:', error);
      toast.error(error.message || tCommon('error') || 'An error occurred');
    }
  };

  const handleExportPDF = async () => {
    try {
      toast.info(t('minutes.exportingPDF') || 'Generating PDF...');

      // Load PDF libraries dynamically
      const { jsPDF: PDF, html2canvas: canvasLib } = await loadPDFLibraries();

      // Wait a bit to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 200));

      // Get the preview element
      const previewElement = document.getElementById('mom-preview-content');
      if (!previewElement) {
        toast.error(t('minutes.previewNotFound') || 'Preview content not found');
        return;
      }

      // Create a style element to override oklch colors with standard RGB colors
      const styleId = 'mom-pdf-export-styles';
      let styleElement = document.getElementById(styleId);
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        styleElement.textContent = `
          #mom-preview-content,
          #mom-preview-content * {
            color: rgb(17, 24, 39) !important; /* Force text-gray-900 */
          }
          #mom-preview-content .text-gray-500,
          #mom-preview-content .text-gray-600 {
            color: rgb(75, 85, 99) !important;
          }
          #mom-preview-content .text-gray-700 {
            color: rgb(55, 65, 81) !important;
          }
          #mom-preview-content .text-gray-800 {
            color: rgb(31, 41, 55) !important;
          }
          #mom-preview-content .text-gray-900 {
            color: rgb(17, 24, 39) !important;
          }
          #mom-preview-content .bg-white {
            background-color: rgb(255, 255, 255) !important;
          }
          #mom-preview-content .bg-gray-50 {
            background-color: rgb(249, 250, 251) !important;
          }
          #mom-preview-content .border-gray-200 {
            border-color: rgb(229, 231, 235) !important;
          }
          #mom-preview-content .border-gray-300 {
            border-color: rgb(209, 213, 219) !important;
          }
          #mom-preview-content .border-gray-800 {
            border-color: rgb(31, 41, 55) !important;
          }
        `;
        document.head.appendChild(styleElement);
      }

      // Temporarily make the element visible and position it off-screen for capture
      const originalStyle = {
        position: previewElement.style.position,
        left: previewElement.style.left,
        top: previewElement.style.top,
        visibility: previewElement.style.visibility,
        display: previewElement.style.display,
        zIndex: previewElement.style.zIndex,
        width: previewElement.style.width,
      };

      // Remove hidden class and set styles for capture
      previewElement.classList.remove('hidden');
      previewElement.style.position = 'absolute';
      previewElement.style.left = '-9999px';
      previewElement.style.top = '0';
      previewElement.style.visibility = 'visible';
      previewElement.style.display = 'block';
      previewElement.style.zIndex = '-1';
      previewElement.style.width = '210mm';

      // Wait for styles to apply and content to render
      await new Promise(resolve => setTimeout(resolve, 300));

      // Force reflow to ensure styles are applied
      previewElement.offsetHeight;

      // Use html2canvas to capture the preview as an image
      // Wrap in try-catch to handle oklch parsing errors gracefully
      let canvas;
      try {
        canvas = await canvasLib(previewElement, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: previewElement.scrollWidth || previewElement.offsetWidth,
          height: previewElement.scrollHeight || previewElement.offsetHeight,
          windowWidth: previewElement.scrollWidth || previewElement.offsetWidth,
          windowHeight: previewElement.scrollHeight || previewElement.offsetHeight,
          foreignObjectRendering: false, // Use canvas rendering instead of foreignObject
          onclone: clonedDoc => {
            // Inject comprehensive style override into cloned document to replace oklch colors
            const clonedStyle = clonedDoc.createElement('style');
            clonedStyle.textContent = `
              * {
                color: rgb(17, 24, 39) !important;
              }
              .text-gray-500, .text-gray-600 {
                color: rgb(75, 85, 99) !important;
              }
              .text-gray-700 {
                color: rgb(55, 65, 81) !important;
              }
              .text-gray-800 {
                color: rgb(31, 41, 55) !important;
              }
              .text-gray-900 {
                color: rgb(17, 24, 39) !important;
              }
              .bg-white {
                background-color: rgb(255, 255, 255) !important;
              }
              .bg-gray-50 {
                background-color: rgb(249, 250, 251) !important;
              }
              .border-gray-200 {
                border-color: rgb(229, 231, 235) !important;
              }
              .border-gray-300 {
                border-color: rgb(209, 213, 219) !important;
              }
              .border-gray-800 {
                border-color: rgb(31, 41, 55) !important;
              }
              /* Ensure sections don't break across pages */
              section {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
              /* Specifically ensure Voting Results section stays together */
              section:last-of-type {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                page-break-before: auto !important;
              }
            `;
            clonedDoc.head.insertBefore(clonedStyle, clonedDoc.head.firstChild);

            // Also try to remove or disable stylesheets with oklch
            const stylesheets = Array.from(clonedDoc.styleSheets || []);
            stylesheets.forEach((sheet, index) => {
              try {
                if (sheet.href && sheet.href.includes('tailwind')) {
                  // Try to disable Tailwind stylesheet in clone
                  if (sheet.ownerNode) {
                    sheet.ownerNode.disabled = true;
                  }
                }
              } catch (e) {
                // Ignore cross-origin errors
              }
            });
          },
        });
      } catch (canvasError) {
        // If html2canvas fails due to oklch, try with more permissive settings
        console.warn('First canvas attempt failed, retrying with alternative settings:', canvasError);
        canvas = await canvasLib(previewElement, {
          scale: 1.5,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          ignoreElements: () => false,
          foreignObjectRendering: false,
        });
      }

      // Restore original styles and classes
      previewElement.classList.add('hidden');
      Object.assign(previewElement.style, originalStyle);

      // Remove the style element
      if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      const pdf = new PDF('p', 'mm', 'a4');
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content is longer than one page
      // Use a threshold to ensure sections don't get cut - if less than 80mm remains, start new page
      const minRemainingForSection = 80; // Minimum mm needed for a section to fit

      while (heightLeft > 0) {
        // If remaining height is less than threshold and greater than 0,
        // it means we're near the end and should start a new page for the last section
        if (heightLeft < minRemainingForSection && heightLeft > 0) {
          pdf.addPage();
          // Position the image so the remaining content starts at the top of the new page
          position = heightLeft - imgHeight;
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          break;
        }

        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Generate filename
      const formData = watch();
      const fileName = `${(formData.meetingTitle || 'MinutesOfMeeting').replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

      // Save the PDF
      pdf.save(fileName);
      toast.success(t('minutes.pdfExportSuccess') || 'PDF exported successfully');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error(error.message || tCommon('error') || 'Failed to export PDF');

      // Ensure element is restored even on error
      const previewElement = document.getElementById('mom-preview-content');
      if (previewElement) {
        previewElement.classList.add('hidden');
      }

      // Remove style element if it exists
      const errorStyleElement = document.getElementById('mom-pdf-export-styles');
      if (errorStyleElement && errorStyleElement.parentNode) {
        errorStyleElement.parentNode.removeChild(errorStyleElement);
      }
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending || publishMutation.isPending;

  if (momLoading) {
    return <div className="space-y-4">Loading...</div>;
  }

  const formData = watch();

  // If preview mode, show only the preview
  if (isPreviewMode) {
    return (
      <div className="space-y-6">
        {/* Hidden preview content for PDF export (always rendered but hidden, positioned off-screen) */}
        <div id="mom-preview-content" className="hidden absolute -left-[9999px] top-0" style={{ width: '210mm' }}>
          <MoMPreview
            formData={formData}
            discussionNotes={discussionNotes}
            agendaItems={agendaItems}
            participants={participants}
            momAttachments={momAttachments}
            isRTL={isRTL}
          />
        </div>

        {/* Preview Content - visible for preview */}
        <div className="bg-gray-50 p-4 rounded-lg overflow-auto">
          <MoMPreview
            formData={formData}
            discussionNotes={discussionNotes}
            agendaItems={agendaItems}
            participants={participants}
            momAttachments={momAttachments}
            isRTL={isRTL}
          />
        </div>

        {/* Action buttons for preview mode */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-muted">{t('minutes.status')}:</span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500">
                {t('minutes.statusPublished')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditingPublished(true);
                  setIsPreviewMode(false);
                }}
                className="cursor-pointer"
              >
                <Edit className="h-4 w-4 mr-2" />
                {t('minutes.edit')}
              </Button>
              <Button type="button" variant="primary" size="sm" onClick={handleExportPDF} className="cursor-pointer">
                <FileDown className="h-4 w-4 mr-2" />
                {t('minutes.exportPDF')}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hidden preview content for PDF export (always rendered but hidden, positioned off-screen) */}
      <div id="mom-preview-content" className="hidden absolute -left-[9999px] top-0" style={{ width: '210mm' }}>
        <MoMPreview
          formData={formData}
          discussionNotes={discussionNotes}
          agendaItems={agendaItems}
          participants={participants}
          momAttachments={momAttachments}
          isRTL={isRTL}
        />
      </div>

      <form onSubmit={handleSubmit(handleSaveDraft)} className="space-y-6">
        {/* Status Bar */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-muted">{t('minutes.status')}:</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    isPublished
                      ? 'bg-green-500/10 text-green-500 border border-green-500'
                      : isReviewing
                      ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500'
                      : 'bg-gray-500/10 text-gray-500 border border-gray-500'
                  }`}
                >
                  {isPublished ? t('minutes.statusPublished') : isReviewing ? t('minutes.statusReviewing') : t('minutes.statusDraft')}
                </span>
                {existingMom && momData.version > 1 && (
                  <span className="text-xs text-text-muted">
                    ({t('minutes.version')} {momData.version})
                  </span>
                )}
              </div>
              {isPublished && momData.publishedDate && (
                <div className="text-xs text-text-muted">
                  {t('minutes.publishedOn')}: {formatDate(momData.publishedDate)}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {existingMom && momData.status === 3 && !isEditingPublished && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditingPublished(true);
                      setIsPreviewMode(false);
                    }}
                    className="cursor-pointer"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {t('minutes.edit')}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setIsPreviewMode(!isPreviewMode)} className="cursor-pointer">
                    <Eye className="h-4 w-4 mr-2" />
                    {t('minutes.preview')}
                  </Button>
                  <Button type="button" variant="primary" size="sm" onClick={handleExportPDF} className="cursor-pointer">
                    <FileDown className="h-4 w-4 mr-2" />
                    {t('minutes.exportPDF')}
                  </Button>
                </>
              )}
              {(isDraft || isEditingPublished) && (
                <>
                  <Button type="submit" variant="ghost" size="sm" disabled={isLoading} className="cursor-pointer">
                    <Save className="h-4 w-4 mr-2" />
                    {t('minutes.saveDraft')}
                  </Button>
                  {existingMom && !isEditingPublished && (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={e => {
                        e.preventDefault();
                        handleSubmit(handlePublish)();
                      }}
                      disabled={isLoading}
                      className="cursor-pointer"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {t('minutes.publish')}
                    </Button>
                  )}
                  {isEditingPublished && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsEditingPublished(false);
                        setIsPreviewMode(true);
                        // Reset form to original values
                        if (existingMom) {
                          reset({
                            committeeName: momData.committeeName || '',
                            meetingTitle: momData.meetingTitle || '',
                            meetingDate: momData.meetingDate ? new Date(momData.meetingDate).toISOString().split('T')[0] : '',
                            meetingStartTime: momData.meetingStartTime || '',
                            meetingEndTime: momData.meetingEndTime || '',
                            location: momData.location || '',
                            chairperson: momData.chairperson || '',
                            secretary: momData.secretary || '',
                          });
                          setDiscussionNotes(momData.discussionNotes || '');
                        }
                      }}
                      className="cursor-pointer"
                    >
                      {tCommon('cancel')}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Meeting Header Section */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('minutes.meetingHeader')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">{t('minutes.committeeName')}</label>
              <input
                {...register('committeeName')}
                type="text"
                disabled={isPreviewMode || isLoading || (isPublished && !isEditingPublished)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">{t('minutes.meetingTitle')}</label>
              <input
                {...register('meetingTitle')}
                type="text"
                disabled={isPreviewMode || isLoading || (isPublished && !isEditingPublished)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text"
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-text-muted mb-2">
                <Calendar className="h-4 w-4" />
                {t('minutes.date')}
              </label>
              <input
                {...register('meetingDate')}
                type="date"
                disabled={isPreviewMode || isLoading || (isPublished && !isEditingPublished)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">{t('minutes.time')}</label>
              <div className="flex gap-2">
                <input
                  {...register('meetingStartTime')}
                  type="time"
                  disabled={isPreviewMode || isLoading}
                  className="flex-1 px-3 py-2 border border-border rounded-lg bg-surface text-text"
                  placeholder={t('minutes.startTime')}
                />
                <input
                  {...register('meetingEndTime')}
                  type="time"
                  disabled={isPreviewMode || isLoading}
                  className="flex-1 px-3 py-2 border border-border rounded-lg bg-surface text-text"
                  placeholder={t('minutes.endTime')}
                />
              </div>
            </div>
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-text-muted mb-2">
                <MapPin className="h-4 w-4" />
                {t('minutes.location')}
              </label>
              <input
                {...register('location')}
                type="text"
                disabled={isPreviewMode || isLoading || (isPublished && !isEditingPublished)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text"
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-text-muted mb-2">
                <Users className="h-4 w-4" />
                {t('minutes.attendees')}
              </label>
              <div className="px-3 py-2 border border-border rounded-lg bg-surface text-text min-h-[42px]">
                {participants.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {participants.map(p => (
                      <span key={p.id} className="text-sm">
                        {p.member?.userInfo?.fullName || `Member ${p.memberId}`}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-text-muted text-sm">{t('minutes.noParticipants')}</span>
                )}
              </div>
            </div>
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-text-muted mb-2">
                <User className="h-4 w-4" />
                {t('minutes.chairperson')}
              </label>
              <input
                {...register('chairperson')}
                type="text"
                disabled={isPreviewMode || isLoading || (isPublished && !isEditingPublished)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text"
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-text-muted mb-2">
                <User className="h-4 w-4" />
                {t('minutes.secretary')}
              </label>
              <input
                {...register('secretary')}
                type="text"
                disabled={isPreviewMode || isLoading || (isPublished && !isEditingPublished)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text"
              />
            </div>
          </div>
        </Card>

        {/* Agenda Items Summary */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <ListChecks className="h-5 w-5" />
            {t('minutes.agendaItemsSummary')}
          </h3>
          {agendaItems.length > 0 ? (
            <div className="space-y-2">
              {agendaItems.map((item, index) => (
                <div key={item.id} className="flex items-start gap-3 p-3 bg-surface-elevated rounded-lg">
                  <span className="font-semibold text-brand shrink-0">{item.order || index + 1}.</span>
                  <div className="flex-1">
                    <p className="text-text">{item.sentence}</p>
                    {item.duration && (
                      <p className="text-xs text-text-muted mt-1">
                        {t('minutes.duration')}: {item.duration} {t('minutes.minutes')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-muted text-sm">{t('minutes.noAgendaItems')}</p>
          )}
        </Card>

        {/* Discussion Notes */}
        <Card className={`p-6 ${isPreviewMode ? 'print-view' : ''}`}>
          <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('minutes.discussionNotes')}
          </h3>
          {isPreviewMode ? (
            <div
              className="prose prose-sm max-w-none p-4 border border-border rounded-lg bg-white min-h-[300px] print-view"
              dangerouslySetInnerHTML={{ __html: discussionNotes || '<p class="text-text-muted">' + t('minutes.noDiscussionNotes') + '</p>' }}
            />
          ) : (
            <RichTextEditor
              value={discussionNotes}
              onChange={setDiscussionNotes}
              placeholder={t('minutes.discussionNotesPlaceholder')}
              disabled={isLoading || (isPublished && !isEditingPublished)}
            />
          )}
        </Card>

        {/* Decisions Section */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            {t('minutes.decisionsTaken')}
          </h3>
          <p className="text-text-muted text-sm">
            {t('minutes.decisionsComingSoon') || 'Decisions will be displayed here once the Decisions API is implemented.'}
          </p>
        </Card>

        {/* Action Items / Tasks */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <ListChecks className="h-5 w-5" />
            {t('minutes.actionItems')}
          </h3>
          <p className="text-text-muted text-sm">{t('minutes.tasksComingSoon') || 'Tasks will be displayed here once the Tasks API is implemented.'}</p>
        </Card>

        {/* Voting Results */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <Vote className="h-5 w-5" />
            {t('minutes.votingResults')}
          </h3>
          <p className="text-text-muted text-sm">
            {t('minutes.votesComingSoon') || 'Voting results will be displayed here once the Votes API is implemented.'}
          </p>
        </Card>

        {/* Attachments Section */}
        <Card className={`p-6 ${isPreviewMode ? 'print-view' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text flex items-center gap-2">
              <Paperclip className="h-5 w-5" />
              {t('minutes.attachmentsLabel')}
            </h3>
            {!isPreviewMode && existingMom && !isPublished && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsAttachmentModalOpen(true)} className="cursor-pointer">
                {t('minutes.attachments.upload') || 'Upload'}
              </Button>
            )}
          </div>
          {momAttachments.length > 0 ? (
            <div className="space-y-2">
              {momAttachments.map(attachment => (
                <div key={attachment.id} className="flex items-center justify-between gap-3 p-3 bg-surface-elevated rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <Paperclip className="h-4 w-4 text-text-muted" />
                    <div className="flex-1">
                      <p className="text-text">{attachment.fileName || attachment.fileName}</p>
                      {attachment.fileSize && (
                        <p className="text-xs text-text-muted">
                          {attachment.fileExtension?.toUpperCase()} • {(attachment.fileSize / 1024).toFixed(2)} KB
                        </p>
                      )}
                    </div>
                  </div>
                  {!isPreviewMode && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        try {
                          const blob = await downloadMinutesOfMeetingAttachment(attachment.id);
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = attachment.fileName || 'download';
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(a);
                        } catch (error) {
                          toast.error(tCommon('error') || 'Failed to download file');
                        }
                      }}
                      className="cursor-pointer"
                    >
                      <FileDown className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-muted text-sm">{t('minutes.noAttachments')}</p>
          )}
        </Card>

        <MoMAttachmentModal
          isOpen={isAttachmentModalOpen}
          onClose={() => {
            setIsAttachmentModalOpen(false);
            refetchMomAttachments();
          }}
          minutesOfMeetingId={existingMom ? momData.id : null}
        />
      </form>
    </div>
  );
};

export default MinutesTab;
