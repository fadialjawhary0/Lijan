import React from 'react';

const TableSkeleton = ({ columnNumbers = 10 }) => {
  return (
    <>
      {[...Array(columnNumbers)].map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-gray-200 last:border-b-0">
          {[...Array(columnNumbers)].map((_, colIndex) => (
            <td key={colIndex} className="px-3 py-3.25">
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export default TableSkeleton;
