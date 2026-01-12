import React from 'react';
import { useTranslation } from 'react-i18next';
import { OVERVIEW_TABS } from '../constants/overviewTabs.const';

const OverviewTabs = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation('overview');

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--color-border)]">
        <nav className="flex flex-wrap gap-x-4 md:gap-x-8">
          {OVERVIEW_TABS?.map(tab => (
            <button
              key={tab?.id}
              onClick={() => onTabChange(tab?.id)}
              className={`cursor-pointer py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === tab?.id
                  ? 'border-[var(--color-brand)] text-[var(--color-brand)]'
                  : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              {t(tab?.label)}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default OverviewTabs;

