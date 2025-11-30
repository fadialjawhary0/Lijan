import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import Button from '../../../components/ui/Button';

const VotingHeader = ({ totalCount = 0, onCreateVote }) => {
  const { t } = useTranslation('voting');

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-base sm:text-lg md:text-2xl font-semibold text-text">
          {t('title')} ({totalCount})
        </h1>
      </div>
      {onCreateVote && (
        <Button variant="primary" onClick={onCreateVote} className="cursor-pointer">
          <Plus className="h-4 w-4" />
          {t('createVote')}
        </Button>
      )}
    </div>
  );
};

export default VotingHeader;

