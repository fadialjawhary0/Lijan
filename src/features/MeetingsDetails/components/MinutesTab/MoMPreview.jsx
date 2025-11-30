import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate, formatTime } from '../../../../utils/dateUtils';
import { Calendar, MapPin, Users, User, FileText, ListChecks, CheckSquare, Vote, Paperclip } from 'lucide-react';

const MoMPreview = ({ formData, discussionNotes, agendaItems, participants, momAttachments, isRTL }) => {
  const { t } = useTranslation('meetingDetails');

  return (
    <div className="bg-white p-8 md:p-12 max-w-4xl mx-auto shadow-lg print:shadow-none print:p-8" style={{ width: '100%', minHeight: '100vh' }}>
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-gray-800 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('minutes.title')}</h1>
        {formData.meetingTitle && <p className="text-lg text-gray-600">{formData.meetingTitle}</p>}
      </div>

      {/* Meeting Header Section */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {t('minutes.meetingHeader')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {formData.committeeName && (
            <div className="flex items-start gap-2">
              <span className="font-semibold text-gray-700 min-w-[140px]">{t('minutes.committeeName')}:</span>
              <span className="text-gray-900">{formData.committeeName}</span>
            </div>
          )}
          {formData.meetingTitle && (
            <div className="flex items-start gap-2">
              <span className="font-semibold text-gray-700 min-w-[140px]">{t('minutes.meetingTitle')}:</span>
              <span className="text-gray-900">{formData.meetingTitle}</span>
            </div>
          )}
          {formData.meetingDate && (
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-gray-600 mt-1 shrink-0" />
              <span className="font-semibold text-gray-700 min-w-[120px]">{t('minutes.date')}:</span>
              <span className="text-gray-900">{formatDate(formData.meetingDate)}</span>
            </div>
          )}
          {(formData.meetingStartTime || formData.meetingEndTime) && (
            <div className="flex items-start gap-2">
              <span className="font-semibold text-gray-700 min-w-[120px]">{t('minutes.time')}:</span>
              <span className="text-gray-900">
                {formData.meetingStartTime || '--'} {formData.meetingEndTime ? `- ${formData.meetingEndTime}` : ''}
              </span>
            </div>
          )}
          {formData.location && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gray-600 mt-1 shrink-0" />
              <span className="font-semibold text-gray-700 min-w-[120px]">{t('minutes.location')}:</span>
              <span className="text-gray-900">{formData.location}</span>
            </div>
          )}
          {formData.chairperson && (
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 text-gray-600 mt-1 shrink-0" />
              <span className="font-semibold text-gray-700 min-w-[120px]">{t('minutes.chairperson')}:</span>
              <span className="text-gray-900">{formData.chairperson}</span>
            </div>
          )}
          {formData.secretary && (
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 text-gray-600 mt-1 shrink-0" />
              <span className="font-semibold text-gray-700 min-w-[120px]">{t('minutes.secretary')}:</span>
              <span className="text-gray-900">{formData.secretary}</span>
            </div>
          )}
        </div>
        {participants && participants.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 text-gray-600 mt-1 shrink-0" />
              <span className="font-semibold text-gray-700 min-w-[120px]">{t('minutes.attendees')}:</span>
              <div className="flex-1">
                <span className="text-gray-900">{participants.map(p => p.member?.userInfo?.fullName || `Member ${p.memberId}`).join(', ')}</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Agenda Items Summary */}
      {agendaItems && agendaItems.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300 flex items-center gap-2">
            <ListChecks className="h-5 w-5" />
            {t('minutes.agendaItemsSummary')}
          </h2>
          <ol className="list-decimal list-inside space-y-3 ml-4">
            {agendaItems.map((item, index) => (
              <li key={item.id} className="text-gray-900">
                <span className="font-medium">{item.sentence}</span>
                {item.duration && (
                  <span className="text-gray-600 text-sm ml-2">
                    ({item.duration} {t('minutes.minutes')})
                  </span>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Discussion Notes */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {t('minutes.discussionNotes')}
        </h2>
        <div
          className="prose prose-sm max-w-none text-gray-900 print-view-content"
          dangerouslySetInnerHTML={{ __html: discussionNotes || `<p class="text-gray-500 italic">${t('minutes.noDiscussionNotes')}</p>` }}
        />
      </section>

      {/* Decisions Section */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300 flex items-center gap-2">
          <CheckSquare className="h-5 w-5" />
          {t('minutes.decisionsTaken')}
        </h2>
        <p className="text-gray-600 italic">{t('minutes.decisionsComingSoon')}</p>
      </section>

      {/* Action Items / Tasks */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300 flex items-center gap-2">
          <ListChecks className="h-5 w-5" />
          {t('minutes.actionItems')}
        </h2>
        <p className="text-gray-600 italic">{t('minutes.tasksComingSoon')}</p>
      </section>

      {/* Voting Results */}
      <section
        className="mb-8"
        style={{
          pageBreakInside: 'avoid',
          breakInside: 'avoid',
          pageBreakBefore: 'auto',
          marginTop: '2rem', // Add extra top margin to help push to new page if needed
          paddingTop: '1rem', // Add padding to ensure section has breathing room
        }}
      >
        <h2
          className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300 flex items-center gap-2"
          style={{
            pageBreakAfter: 'avoid',
            breakAfter: 'avoid',
          }}
        >
          <Vote className="h-5 w-5" />
          {t('minutes.votingResults')}
        </h2>
        <p className="text-gray-600 italic">{t('minutes.votesComingSoon')}</p>
      </section>

      {/* Attachments Section */}
      {momAttachments && momAttachments.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300 flex items-center gap-2">
            <Paperclip className="h-5 w-5" />
            {t('minutes.attachmentsLabel')}
          </h2>
          <ul className="list-disc list-inside space-y-2 ml-4">
            {momAttachments.map(att => (
              <li key={att.id} className="text-gray-900">
                {att.fileName}
                {att.fileExtension && <span className="text-gray-600 text-sm ml-2">({att.fileExtension.toUpperCase()})</span>}
                {att.fileSize && <span className="text-gray-600 text-sm ml-2">- {(att.fileSize / 1024).toFixed(2)} KB</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-gray-300 text-center text-sm text-gray-500">
        <p>
          {t('minutes.generatedOn') || 'Generated on'}: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default MoMPreview;
