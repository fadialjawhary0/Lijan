import React from 'react';

const SkeletonPerformance = () => {
  return (
    <div className="flex flex-col gap-6">
      {['Objectives', 'KPIs', 'Initiatives'].map((section, idx) => (
        <div key={idx}>
          <div className="h-6 w-1/3 bg-gray-300 mb-3 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-100 rounded-b-md p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-300 rounded-xl border border-gray-200 animate-pulse" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonPerformance;
