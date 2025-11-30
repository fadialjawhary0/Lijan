import React from 'react';

const SkeletonNavCards = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 bg-gray-100 rounded-t-xl rounded-b-md p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl shadow flex flex-col items-center justify-center py-22 bg-gray-300 animate-pulse h-28"></div>
      ))}
    </div>
  );
};

export default SkeletonNavCards;
