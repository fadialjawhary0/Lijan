import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Calendar, UserPlus, FileText, FileCheck, CheckSquare } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

const QuickActions = ({ actions }) => {
  const { t, i18n } = useTranslation('overview');
  const navigate = useNavigate();
  const isRTL = i18n.dir() === 'rtl';

  const iconMap = {
    Calendar,
    UserPlus,
    FileText,
    FileCheck,
    CheckSquare,
    Target: CheckSquare,
  };

  if (!actions || actions.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-text mb-4">{t('quickActions')}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {actions.map(action => {
          const Icon = iconMap[action.icon] || FileText;

          return (
            <Button
              key={action.id}
              variant="ghost"
              className="justify-start h-auto py-3 px-4 cursor-pointer"
              onClick={() => action.route && navigate(action.route)}
              permission={action.permission}
            >
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="p-2 rounded-lg bg-surface-elevated">
                  <Icon className="h-5 w-5 text-brand" />
                </div>
                <span className="text-sm font-medium text-text">{isRTL ? action.arabicLabel : action.label}</span>
              </div>
            </Button>
          );
        })}
      </div>
    </Card>
  );
};

export default QuickActions;
