import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import CommitteeCard from '../../../components/ui/CommitteeCard';
import EmptyState from '../../../components/ui/EmptyState';

const CommitteesGrid = ({ committees, onEdit, onDelete }) => {
  const { t } = useTranslation('home');

  if (!committees || committees.length === 0) return <EmptyState title={t('noCommittees')} message={t('noCommitteesDescription')} />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {committees.map((committee, index) => (
        <motion.div key={committee.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
          <CommitteeCard committee={committee} onEdit={onEdit} onDelete={onDelete} />
        </motion.div>
      ))}
    </div>
  );
};

export default CommitteesGrid;
