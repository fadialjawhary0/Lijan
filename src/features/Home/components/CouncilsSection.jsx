import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import CouncilCard from './CouncilCard';
import EmptyState from '../../../components/ui/EmptyState';
import Pagination from '../../../components/ui/Pagination';

const CouncilsSection = ({ councils, isLoading, onEdit, onDelete, onCommitteeEdit, onCommitteeDelete, pagination, onPageChange }) => {
  const { t } = useTranslation('home');

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-surface-elevated rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!councils || councils.length === 0) {
    return <EmptyState title={t('noCouncils')} message={t('noCouncilsDescription')} />;
  }

  return (
    <div className="space-y-4">
      {councils.map((council, index) => (
        <motion.div key={council.Id || council.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
          <CouncilCard council={council} onEdit={onEdit} onDelete={onDelete} onCommitteeEdit={onCommitteeEdit} onCommitteeDelete={onCommitteeDelete} />
        </motion.div>
      ))}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
};

export default CouncilsSection;
