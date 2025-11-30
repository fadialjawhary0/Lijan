import React, { Fragment, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import NotificationCard from './NotificationCard';

const formatDateHeader = date => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleString('en-GB', { month: 'short' });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

const formatTime = (date, t) => {
  const d = new Date(date);
  const hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? t('notifications:time.pm') : t('notifications:time.am');
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes} ${ampm}`;
};

const NotificationTimeline = ({ notifications = [], onMarkAsRead }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const grouped = useMemo(() => {
    const byDay = notifications.reduce((acc, n) => {
      const keyDate = new Date(n.receivedAt || Date.now());
      const key = `${keyDate.getFullYear()}-${String(keyDate.getMonth() + 1).padStart(2, '0')}-${String(keyDate.getDate()).padStart(2, '0')}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(n);
      return acc;
    }, {});

    const sortedDays = Object.keys(byDay).sort((a, b) => new Date(b) - new Date(a));
    return sortedDays.map(day => ({ day, items: byDay[day].sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt)) }));
  }, [notifications]);

  return (
    <div className="relative">
      {grouped.map(({ day, items }, sectionIdx) => (
        <Fragment key={day}>
          <div className="flex items-center gap-3 mt-6 mb-3">
            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
            <h2 className="text-sm font-semibold text-gray-700">{formatDateHeader(day)}</h2>
          </div>
          <div className={`relative ${isRTL ? 'pr-4' : 'pl-4'}`}>
            <div className={`absolute ${isRTL ? 'right-1' : 'left-1'} top-0 bottom-0 w-px bg-gray-500`} />
            <div className="space-y-3">
              {items.map((n, idx) =>
                isRTL ? (
                  <div key={n.id} className="relative flex gap-3 flex-row-reverse">
                    <div className="flex-1">
                      <NotificationCard notification={{ ...n, time: n.time || formatTime(n.receivedAt, t) }} onMarkAsRead={onMarkAsRead} />
                    </div>
                    <div className="min-w-[64px] pt-2 text-[11px] text-gray-500 text-right">{formatTime(n.receivedAt || Date.now(), t)}</div>
                    <div className="flex flex-col items-center">
                      <div className={`w-2 h-2 rounded-full mt-3 ${n.isRead ? 'bg-gray-500' : 'bg-green-500'}`} />
                    </div>
                  </div>
                ) : (
                  <div key={n.id} className="relative flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-2 h-2 rounded-full mt-3 ${n.isRead ? 'bg-gray-500' : 'bg-green-500'}`} />
                    </div>
                    <div className="min-w-[64px] pt-2 text-[11px] text-gray-500 text-left">{formatTime(n.receivedAt || Date.now(), t)}</div>
                    <div className="flex-1">
                      <NotificationCard notification={{ ...n, time: n.time || formatTime(n.receivedAt, t) }} onMarkAsRead={onMarkAsRead} />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </Fragment>
      ))}
    </div>
  );
};

export default NotificationTimeline;
