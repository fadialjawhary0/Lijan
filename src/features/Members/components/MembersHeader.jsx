import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import Button from '../../../components/ui/Button';

const MembersHeader = ({ totalCount = 0, onAddMember }) => {
  const { t } = useTranslation('members');

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-base sm:text-lg md:text-2xl font-semibold text-text">
          {t('title')} ({totalCount})
        </h1>
      </div>
      {onAddMember && (
        <Button variant="primary" onClick={onAddMember} className="cursor-pointer">
          <Plus className="h-4 w-4" />
          {t('addMemberButton')}
        </Button>
      )}
    </div>
  );
};

export default MembersHeader;
