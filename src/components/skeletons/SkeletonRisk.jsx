import React from 'react';

const SkeletonRisk = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-100 rounded-b-md p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 bg-gray-300 rounded-xl h-24 animate-pulse" />
        ))}
      </div>

      <div className="grid grid-cols-5 gap-1 self-center">
        {Array.from({ length: 25 }).map((_, i) => (
          <div key={i} className="w-14 h-14 bg-gray-400 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
};

export default SkeletonRisk;
