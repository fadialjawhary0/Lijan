import React from 'react';

const TablePaginationSkeleton = () => {
  return (
    <div className="flex gap-2">
      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
    </div>
  );
};

export default TablePaginationSkeleton;
