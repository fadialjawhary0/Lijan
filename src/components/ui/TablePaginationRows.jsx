import React from 'react';
import { useTranslation } from 'react-i18next';

const TablePaginationRows = ({ pageSize, handlePageSizeChange }) => {
  const { t } = useTranslation('common');

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-text-muted">{t('rowsPerPage')}:</label>
      <select className="border border-border rounded-md p-1 cursor-pointer" value={pageSize} onChange={handlePageSizeChange}>
        <option value="7">7</option>
        <option value="20">20</option>
        <option value="30">30</option>
        <option value="40">40</option>
        <option value="50">50</option>
      </select>
    </div>
  );
};

export default TablePaginationRows;
