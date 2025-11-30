import React from 'react';

const EmptyState = ({ icon: Icon, title, message, action, className = '' }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center min-h-[400px] py-12 px-4 text-center bg-card-surface border border-border rounded-lg ${className}`}
    >
      {Icon && <Icon className="h-12 w-12 text-text-muted mb-4 opacity-50" />}
      <h2 className="text-xl font-semibold mb-2 text-text">{title}</h2>
      <p className="text-text-muted mb-4 max-w-md">{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
