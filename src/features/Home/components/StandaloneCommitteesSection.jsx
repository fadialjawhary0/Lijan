import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import CommitteeCard from '../../../components/ui/CommitteeCard';
import EmptyState from '../../../components/ui/EmptyState';
import Pagination from '../../../components/ui/Pagination';

const StandaloneCommitteesSection = ({ committees, isLoading, onEdit, onDelete, pagination, onPageChange }) => {
  const { t } = useTranslation('home');

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-64 bg-surface-elevated rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!committees || committees.length === 0) {
    return <EmptyState title={t('noStandaloneCommittees')} message={t('noStandaloneCommitteesDescription')} />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {committees.map((committee, index) => (
          <motion.div key={committee.Id || committee.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <CommitteeCard committee={committee} onEdit={onEdit} onDelete={onDelete} />
          </motion.div>
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
};

export default StandaloneCommitteesSection;
