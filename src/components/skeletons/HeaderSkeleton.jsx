import React from 'react';

const HeaderSkeleton = () => {
  return (
    <>
      <div className="w-12 h-6 bg-gray-300 rounded animate-pulse mb-1"></div>
      <div className="w-20 h-3 bg-gray-200 rounded animate-pulse"></div>
    </>
  );
};

export default HeaderSkeleton;
