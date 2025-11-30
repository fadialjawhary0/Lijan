import React from 'react';

const SkeletonKPIOverview = () => {
  return (
    <div className="space-y-4">
      <div className="h-8 w-1/3 bg-gray-200 rounded animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
};

export default SkeletonKPIOverview;
