import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, CheckSquare, Target, Clock, AlertCircle } from 'lucide-react';
import Card from '../../../components/ui/Card';
import { motion } from 'framer-motion';

const OverviewKPISection = ({ kpis }) => {
  const { t } = useTranslation('overview');

  const kpiItems = [
    {
      key: 'meetingsThisMonth',
      title: t('kpis.meetingsThisMonth'),
      value: kpis?.meetingsThisMonth || 0,
      icon: Calendar,
    },
    // {
    //   key: 'decisionsPending',
    //   title: t('kpis.decisionsPending'),
    //   value: kpis?.decisionsPending || 0,
    //   icon: CheckSquare,
    // },
    {
      key: 'activeVotes',
      title: t('kpis.activeVotes'),
      value: kpis?.activeVotes || 0,
      icon: Target,
    },
    {
      key: 'tasksInProgress',
      title: t('kpis.tasksInProgress'),
      value: kpis?.tasksInProgress || 0,
      icon: CheckSquare,
    },
    {
      key: 'tasksOverdue',
      title: t('kpis.tasksOverdue'),
      value: kpis?.tasksOverdue || 0,
      icon: AlertCircle,
      variant: 'warning',
    },
    // {
    //   key: 'nextMeetingCountdown',
    //   title: t('kpis.nextMeetingCountdown'),
    //   value: kpis?.nextMeetingCountdown || '-',
    //   icon: Clock,
    //   isText: true,
    // },
  ];

  return (
    <section className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {kpiItems.map((kpi, index) => (
          <motion.div key={kpi.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card className="p-4 min-h-[120px]">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-muted mb-2">{kpi.title}</p>
                  <p className={`text-lg font-bold ${kpi.variant === 'warning' ? 'text-red-500' : 'text-text'}`}>{kpi.value}</p>
                </div>
                <div className="p-3 rounded-full bg-surface-elevated shrink-0">
                  <kpi.icon className="h-6 w-6 text-brand" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default OverviewKPISection;
