import React from 'react';
import { CHART_TYPES } from '../../constants/chartTypes';

const ChartTypeSelector = ({ value, onChange, className = '' }) => {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`shadow-sm px-3 py-1.5 cursor-pointer border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent bg-surface-elevated ${className}`}
    >
      {CHART_TYPES.map(type => (
        <option key={type.value} value={type.value}>
          {type.label}
        </option>
      ))}
    </select>
  );
};

export default ChartTypeSelector;
