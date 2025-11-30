import React from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Check } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const NotificationCard = ({ notification, onMarkAsRead }) => {
  const { i18n } = useTranslation();
  const { userId } = useAuth();
  const language = i18n.language;
  const { title, description, time, type = 'default', isRead, priority, url, recipientUserIdInApp } = notification || {};

  const priorityName = priority ? (language === 'ar' ? priority.arabicName : priority.englishName) : type;
  const priorityColor = priority?.color || '#6b7280';

  const handleMarkAsRead = e => {
    e.stopPropagation();
    if (onMarkAsRead && notification?.id) {
      onMarkAsRead(notification.id);
    }
  };

  const handleNotificationClick = url => {
    if (url) window.location.href = url;
  };

  return (
    <div
      className={`w-full cursor-pointer rounded-lg border shadow-md border-gray-200 p-3 ${isRead ? 'bg-white' : 'bg-gray-50'}`}
      onClick={() => handleNotificationClick(url)}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 w-2 h-2 rounded-full" style={{ backgroundColor: priorityColor }}></div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded text-white" style={{ backgroundColor: priorityColor }}>
                {priorityName}
              </span>
              <h3 className="text-sm font-medium text-gray-800">{title}</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] text-gray-500">
                <Clock size={12} />
                {time}
              </span>
              {!isRead && onMarkAsRead && userId === recipientUserIdInApp && (
                <button
                  onClick={handleMarkAsRead}
                  className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50 transition-colors"
                >
                  <Check size={12} />
                  Mark as Read
                </button>
              )}
            </div>
          </div>
          {description && <p className="text-xs text-gray-600 mt-1">{description}</p>}
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
