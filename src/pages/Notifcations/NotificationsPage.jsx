import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
// import { useGetAllNotificationsQuery, useGetAllNotificationPrioritiesQuery, useMarkAsReadMutation, useMarkAllAsReadQuery } from '../../queries/notifications';
import { useAuth } from '../../context/AuthContext';
import NotificationTimeline from '../../features/Notifications/components/NotificationTimeline';
import { formatTimeAgo } from './utils/formatTimeAgo';
import Pagination from '../../components/ui/Pagination';
import TablePaginationRows from '../../components/ui/TablePaginationRows';

const NotificationsPage = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  const { userId } = useAuth();

  const [selectedPriorityId, setSelectedPriorityId] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(7);

  // const { data: notifications, isLoading } = useGetAllNotificationsQuery(selectedPriorityId, page, pageSize);
  // const { data: priorities } = useGetAllNotificationPrioritiesQuery();
  // const { mutate: markAsRead } = useMarkAsReadMutation();
  // const { mutate: markAllAsRead } = useMarkAllAsReadQuery(userId || 0);

  // const totalPages = notifications?.totalPages || 0;
  // const totalCount = notifications?.totalCount || 0;

  // const transformedNotifications = useMemo(() => {
  // if (!notifications?.data) return [];

  // return notifications.data.map(item => ({
  //     id: item?.id,
  //     title: language === 'ar' ? item?.arabicSubject : item?.englishSubject || 'No Subject',
  //     description: language === 'ar' ? item?.arabicBody : item?.englishBody,
  //     time: formatTimeAgo(item?.created || ''),
  //     type: item?.priority?.code?.toLowerCase() || 'info',
  //     isRead: item?.isRead,
  //     receivedAt: item?.created || 'No Date',
  //     priority: item?.priority,
  //     metadata: item?.metadataJson,
  //     url: item?.url,
  //     recipientUserIdInApp: item?.recipientUserIdInApp,
  //   }));
  // }, [notifications?.data, language]);
  const transformedNotifications = [];
  const handlePriorityToggle = priorityId => {
    if (selectedPriorityId === priorityId) {
      setSelectedPriorityId(null);
    } else {
      setSelectedPriorityId(priorityId);
    }
    setPage(1);
  };

  const handleMarkAsRead = notificationId => markAsRead({ id: notificationId, userId: userId || 0 });

  const handlePageChange = newPage => setPage(newPage);

  const handlePageSizeChange = e => {
    setPage(1);
    setPageSize(parseInt(e.target.value));
  };

  const unreadCount = transformedNotifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-2 bg-slate-100/90 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-gray-500 w-full h-full">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">{t('notifications:title')}</h1>
          <p className="text-xs text-gray-500">{t('notifications:subtitle')}</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer px-3 py-1 rounded border border-blue-200 hover:bg-blue-50"
          >
            {t('notifications:markAllAsRead')}
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-4">
        {priorities?.data?.map(priority => {
          const isSelected = selectedPriorityId === priority?.id;
          const priorityColor = priority?.color || '#6b7280';

          return (
            <button
              key={priority?.id}
              onClick={() => handlePriorityToggle(priority?.id)}
              className={`cursor-pointer px-3 py-1 min-w-[80px] text-sm rounded-full border transition-colors ${
                isSelected ? 'text-white border-transparent' : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
              style={{
                backgroundColor: isSelected ? priorityColor : undefined,
                borderColor: isSelected ? priorityColor : undefined,
                color: isSelected ? 'white' : priorityColor,
              }}
            >
              {language === 'ar' ? priority?.arabicName : priority?.englishName}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="space-y-4 mt-6">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-32 mb-3"></div>
              <div className="pl-4 space-y-3">
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-gray-200 rounded-full mt-3"></div>
                  <div className="w-16 h-6 bg-gray-200 rounded"></div>
                  <div className="flex-1 h-20 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <NotificationTimeline notifications={transformedNotifications} onMarkAsRead={handleMarkAsRead} />
      )}

      {totalCount > 0 && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          Showing {Math.min((page - 1) * pageSize + 1, totalCount)} - {Math.min(page * pageSize, totalCount)} of {totalCount} notifications
        </div>
      )}

      <div className="flex justify-center items-end mt-2 mb-2">
        {isLoading ? (
          <div className="flex gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ) : (
          <div className="flex items-center">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
            <TablePaginationRows pageSize={pageSize} handlePageSizeChange={handlePageSizeChange} />
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
