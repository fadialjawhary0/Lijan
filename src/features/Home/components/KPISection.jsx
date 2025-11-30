import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Calendar, CheckSquare, Clock } from 'lucide-react';
import Card from '../../../components/ui/Card';
import { motion } from 'framer-motion';

const KPISection = ({ kpis }) => {
  const { t } = useTranslation('home');

  const kpiItems = [
    {
      key: 'totalCommittees',
      title: t('kpis.totalCommittees'),
      description: t('kpis.totalCommitteesDesc'),
      value: kpis?.totalCommittees || 0,
      icon: Users,
    },
    {
      key: 'totalMeetings',
      title: t('kpis.totalMeetings'),
      description: t('kpis.totalMeetingsDesc'),
      value: kpis?.totalMeetings || 0,
      icon: Calendar,
    },
    {
      key: 'myTasksCount',
      title: t('kpis.myTasksCount'),
      description: t('kpis.myTasksCountDesc'),
      value: kpis?.myTasksCount || 0,
      icon: CheckSquare,
    },
    {
      key: 'meetingsToday',
      title: t('kpis.meetingsToday'),
      description: t('kpis.meetingsTodayDesc'),
      value: kpis?.meetingsToday || 0,
      icon: Clock,
    },
  ];

  return (
    <section className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-2">
        {kpiItems.map((kpi, index) => (
          <motion.div key={kpi.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card className="p-4 min-h-[120px]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-muted)]">{kpi.title}</p>
                  <p className="text-2xl font-bold mt-2">{kpi.value}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-[var(--color-text-muted)]">{kpi.description}</span>
                  </div>
                </div>
                <div className="p-3 rounded-full bg-[var(--color-surface-elevated)]">
                  <kpi.icon className="h-8 w-8 text-[var(--color-brand)]" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default KPISection;
