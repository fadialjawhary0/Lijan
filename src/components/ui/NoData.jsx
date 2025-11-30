import React from 'react';
import { AlertCircle } from 'lucide-react';

const NoData = ({ message = 'No Data Available', className = '' }) => {
  return (
    <div className={`flex flex-col h-full items-center justify-center text-center rounded-lg ${className}`}>
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <h3 className="text-lg text-gray-500 mb-2">{message}</h3>
    </div>
  );
};

export default NoData;
