import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const MeetingsHeader = ({ totalCount = 0 }) => {
  const { t } = useTranslation('meetings');
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-base sm:text-lg md:text-2xl font-semibold text-text">
          {t('title')} ({totalCount})
        </h1>
      </div>
      <Button
        variant="primary"
        onClick={() => {
          navigate('/meetings/create');
        }}
        className="cursor-pointer"
      >
        <Plus className="h-4 w-4" />
        {t('createMeeting')}
      </Button>
    </div>
  );
};

export default MeetingsHeader;
