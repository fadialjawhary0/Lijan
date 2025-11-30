import React from 'react';
import { Bell, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NAVBAR_CLASSES } from '../../../constants/navbarConstants';
import { useNavigate } from 'react-router-dom';
import { useDropdown } from '../../../hooks/useDropdown';
// import { useGetAllNotificationsQuery, useMarkAllAsReadQuery } from '../../../queries/notifications';
import { useAuth } from '../../../context/AuthContext';
import { dateFormatter } from './../../../helper/dateFormar';
const Notifications = () => {
  const navigate = useNavigate();

  const { userId } = useAuth();
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  const { isOpen, toggle, dropdownRef } = useDropdown();
  // const { data: notifications } = useGetAllNotificationsQuery('', 1, 10);
  const { data: notifications } = { data: [] };
  // const { mutate: markAllAsRead } = useMarkAllAsReadQuery(userId || 0);
  const mutate = () => {};
  const unreadCount = notifications?.data?.filter(n => !n.isRead).length || 0;

  const handleNotificationClick = url => {
    if (url) window.location.href = url;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={toggle} className={NAVBAR_CLASSES.notificationButton} aria-label="Notifications" aria-expanded={isOpen} aria-haspopup="true">
        <div className="relative">
          <Bell className="w-5 h-5 text-gray-600" />
          {unreadCount > 0 && (
            <span className={`absolute -top-2 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] leading-4 text-center`}>
              {unreadCount}
            </span>
          )}
        </div>
      </button>

      {isOpen && (
        <div className={`${language === 'ar' ? 'accessibility-dropdown-rtl' : 'accessibility-dropdown'} w-80`}>
          <div className="py-2">
            <div className="px-4 py-2 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">{t('notifications:title')}</h4>
                  <p className="text-xs text-gray-500">You have {unreadCount} new notifications</p>
                </div>
                {unreadCount > 0 && (
                  <button onClick={() => markAllAsRead()} className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
                    {t('notifications:markAllAsRead')}
                  </button>
                )}
              </div>
            </div>
            <div className="max-h-80 overflow-auto">
              {notifications?.data?.map(item => (
                <div
                  key={item?.id}
                  className="cursor-pointer px-4 py-3 hover:bg-gray-100 transition-colors border-b last:border-b-0 border-gray-100"
                  onClick={() => handleNotificationClick(item.url)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 w-2 h-2 rounded-full ${item?.isRead ? 'bg-gray-300' : 'bg-blue-500'}`}></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h5 className="text-sm font-medium text-gray-800 line-clamp-1">
                          {(language === 'ar' ? item?.arabicSubject : item?.englishSubject) || 'No Subject'}
                        </h5>
                        <span className="flex items-center gap-1 text-[11px] text-gray-500 shrink-0">
                          <Clock size={12} />
                          {dateFormatter(item?.created) || 'No Date'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{language === 'ar' ? item?.arabicBody : item?.englishBody}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div
              className="px-4 py-2 border-t border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
              onClick={() => {
                navigate('/notifications');
                if (isOpen) toggle();
              }}
            >
              <button className="w-full text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer">{t('notifications:viewAll')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
