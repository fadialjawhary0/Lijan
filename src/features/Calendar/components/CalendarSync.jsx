import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Download, ExternalLink } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import { exportToICS } from '../../../utils/icsExporter';
import { useToast } from '../../../context/ToasterContext';

const CalendarSync = ({ events = [] }) => {
  const { t } = useTranslation('calendar');
  const toast = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportICS = () => {
    try {
      setIsExporting(true);
      exportToICS(events, 'committee-calendar.ics');
      toast.success(t('sync.exportSuccess'));
    } catch (error) {
      console.error('Export error:', error);
      toast.error(t('sync.exportError'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleGoogleCalendarSync = () => {
    // For Google Calendar sync, we'll use the Google Calendar API
    // This requires OAuth setup - for now, we'll show a message
    toast.info(t('sync.googleCalendarInfo'));
    // TODO: Implement Google Calendar OAuth sync
  };

  const handleOutlookSync = () => {
    // Outlook uses ICS format, so we can export directly
    handleExportICS();
  };

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold text-text mb-3">{t('sync.title')}</h3>
      <div className="space-y-2">
        <Button variant="outline" onClick={handleExportICS} disabled={isExporting || events.length === 0} className="w-full justify-start cursor-pointer">
          <Download className="h-4 w-4 mr-2" />
          {t('sync.exportICS')}
        </Button>

        <Button variant="outline" onClick={handleGoogleCalendarSync} disabled={events.length === 0} className="w-full justify-start cursor-pointer">
          <ExternalLink className="h-4 w-4 mr-2" />
          {t('sync.googleCalendar')}
        </Button>

        <Button variant="outline" onClick={handleOutlookSync} disabled={isExporting || events.length === 0} className="w-full justify-start cursor-pointer">
          <Calendar className="h-4 w-4 mr-2" />
          {t('sync.outlook')}
        </Button>
      </div>
      <p className="text-xs text-text-muted mt-3">{t('sync.description')}</p>
    </Card>
  );
};

export default CalendarSync;
