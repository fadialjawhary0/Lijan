import React from 'react';
import Card from '../ui/Card';

const CalendarSkeleton = () => {
  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Calendar header skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="flex gap-2">
            <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
          </div>
        </div>

        {/* Calendar grid skeleton */}
        <div className="grid grid-cols-7 gap-2">
          {[...Array(35)].map((_, index) => (
            <div key={index} className="aspect-square bg-gray-100 rounded border border-gray-200 animate-pulse">
              <div className="p-2 space-y-1">
                <div className="h-4 bg-gray-200 rounded w-6"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default CalendarSkeleton;
