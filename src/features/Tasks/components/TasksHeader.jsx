import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import Button from '../../../components/ui/Button';

const TasksHeader = ({ totalCount = 0, onCreateTask }) => {
  const { t } = useTranslation('tasks');

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-base sm:text-lg md:text-2xl font-semibold text-text">
          {t('title')} ({totalCount})
        </h1>
      </div>
      {onCreateTask && (
        <Button variant="primary" onClick={onCreateTask} className="cursor-pointer">
          <Plus className="h-4 w-4" />
          {t('createTask')}
        </Button>
      )}
    </div>
  );
};

export default TasksHeader;

