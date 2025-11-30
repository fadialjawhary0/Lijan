import React from 'react';
import { useTranslation } from 'react-i18next';
import { MEETING_TABS } from '../constants/meetingTabs.const';

const MeetingTabs = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation('meetingDetails');

  return (
    <div className="space-y-6">
      <div className="border-b border-border">
        <nav className="flex flex-wrap gap-x-4 md:gap-x-8">
          {MEETING_TABS?.map(tab => (
            <button
              key={tab?.id}
              onClick={() => onTabChange(tab?.id)}
              className={`cursor-pointer py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === tab?.id
                  ? 'border-brand text-brand'
                  : 'border-transparent text-text-muted hover:text-text'
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

export default MeetingTabs;

