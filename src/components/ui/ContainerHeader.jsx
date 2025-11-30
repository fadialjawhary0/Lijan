import React from 'react';
import ExportMenu from './ExportMenu';
import Button from './Button';

const ContainerHeader = ({
  isLoading = false,
  title,
  subtitle = null,
  icon = null,
  actions = [],
  centeredTitle = false,
  search = false,
  searchValue = '',
  onSearchChange = null,
  exportConfig = null,
  getExportConfig = null,
  submenuPosition = 'right',
  className = '',
}) => {
  return (
    <div
      className={` ${
        centeredTitle ? 'text-center' : 'flex'
      } items-center justify-between px-4 py-2 border-b border-border rounded-t-xl bg-card-surface gap-2 ${className}`}
    >
      <div className="flex items-center gap-2">
        {icon && <div className=" bg-surface-elevated rounded-xl">{icon}</div>}
        <div>
          <h3 className={`text-base sm:text-lg font-semibold text-text ${isLoading ? 'animate-pulse bg-surface-elevated rounded w-20 h-4' : ''}`}>{title}</h3>
          {subtitle && <p className={`text-text-muted text-sm ${isLoading ? 'animate-pulse bg-surface-elevated rounded w-20 h-4' : ''}`}>{subtitle}</p>}
        </div>
      </div>
      <div className="flex gap-2 items-center">
        {actions.map((action, idx) =>
          action.custom ? (
            <div key={idx}>{action.custom}</div>
          ) : (
            <Button variant="primary" size="sm" key={idx} permission={action.permission} onClick={action.onClick}>
              <div className="flex items-center gap-1">
                {action.icon}
                {action.label}
              </div>
            </Button>
          )
        )}

        {/* Export Menu */}
        <ExportMenu exportConfig={exportConfig} getExportConfig={getExportConfig} submenuPosition={submenuPosition} />

        {search && (
          <input
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={e => onSearchChange?.(e.target.value)}
            className="px-2 py-1 rounded text-text outline-0 bg-surface-elevated"
          />
        )}
      </div>
    </div>
  );
};

export default ContainerHeader;
