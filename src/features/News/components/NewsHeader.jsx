import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '../../../components/ui/Button';

const NewsHeader = ({ totalCount = 0 }) => {
  const { t } = useTranslation('news');
  const navigate = useNavigate();

  const handleCreateAnnouncement = () => {
    navigate('/news/create');
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-base sm:text-lg md:text-2xl font-semibold text-text">
          {t('title')} ({totalCount})
        </h1>
      </div>
      <Button variant="primary" onClick={handleCreateAnnouncement} className="cursor-pointer">
        <Plus className="h-4 w-4" />
        {t('createAnnouncement')}
      </Button>
    </div>
  );
};

export default NewsHeader;

