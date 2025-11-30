import React from 'react';

const FormHeader = ({ icon, title, subtitle, actions = [] }) => (
  <div className="flex items-center justify-between gap-4 px-6 py-4 bg-surface-elevated rounded-t-xl border-b border-brand shadow-sm">
    <div className="flex items-center gap-3 ">
      {icon && <span className="text-brand text-2xl">{icon}</span>}
      <div>
        <h2 className="text-xl font-bold text-text leading-tight">{title}</h2>
        {subtitle && <p className="text-sm text-text-muted mt-1">{subtitle}</p>}
      </div>
    </div>
    <div className="flex gap-2">
      {actions.map((action, idx) => (
        <button
          key={idx}
          type={action.type || 'button'}
          className={`px-4 py-1 rounded text-text cursor-pointer bg-surface-elevated font-medium hover:text-brand hover:bg-surface-elevated transition-all duration-300`}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      ))}
    </div>
  </div>
);

export default FormHeader;
