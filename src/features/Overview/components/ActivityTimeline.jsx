import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckSquare, FileCheck, UserPlus, FileText, CheckCircle, Clock, Target } from 'lucide-react';
import Card from '../../../components/ui/Card';
import { formatDateTime } from '../../../utils/dateUtils';

const ActivityTimeline = ({ activities }) => {
  const { t, i18n } = useTranslation('overview');
  const isRTL = i18n.dir() === 'rtl';

  const getActivityIcon = type => {
    const iconMap = {
      task: CheckSquare,
      decision: FileCheck,
      vote: Target,
      member: UserPlus,
      document: FileText,
      completed: CheckCircle,
    };
    return iconMap[type] || Clock;
  };

  const getActivityColor = type => {
    const colorMap = {
      task: 'text-blue-500',
      decision: 'text-green-500',
      vote: 'text-purple-500',
      member: 'text-orange-500',
      document: 'text-gray-500',
      completed: 'text-green-600',
    };
    return colorMap[type] || 'text-gray-500';
  };

  if (!activities || activities.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted">{t('noActivities')}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-text mb-4">{t('latestActivity')}</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = getActivityIcon(activity.type);
          const iconColor = getActivityColor(activity.type);

          return (
            <div key={activity.id} className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Timeline line */}
              {index < activities.length - 1 && (
                <div className={`flex flex-col items-center ${isRTL ? 'ml-4' : 'mr-4'}`}>
                  <div className={`w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center ${iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="w-px h-full bg-border mt-2" />
                </div>
              )}
              {index === activities.length - 1 && (
                <div className={`flex flex-col items-center ${isRTL ? 'ml-4' : 'mr-4'}`}>
                  <div className={`w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center ${iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              )}

              {/* Activity content */}
              <div className="flex-1 pb-4">
                <p className="text-sm font-medium text-text mb-1">
                  {isRTL ? activity.arabicTitle : activity.title}
                </p>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <span>{activity.user}</span>
                  <span>•</span>
                  <span>{formatDateTime(activity.timestamp)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default ActivityTimeline;

