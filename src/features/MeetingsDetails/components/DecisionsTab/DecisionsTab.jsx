import React from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../../../components/ui/Card';
import EmptyState from '../../../../components/ui/EmptyState';
import { Gavel } from 'lucide-react';

const DecisionsTab = ({ meeting }) => {
  const { t } = useTranslation('meetingDetails');

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text">{t('decisions.title')}</h3>
        <button className="text-sm text-brand hover:underline cursor-pointer">{t('decisions.createDecision')}</button>
      </div>
      <EmptyState title={t('decisions.noDecisions')} message={t('decisions.noDecisionsDescription')} icon={Gavel} />
    </Card>
  );
};

export default DecisionsTab;

