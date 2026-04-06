import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ClipboardList, CheckCircle2, Clock, Users } from 'lucide-react';
import Card from '../components/Card.jsx';
import Charts from '../components/Charts.jsx';
import { useAnalyticsData } from '../hooks/useAnalyticsData.js';

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <div className="mb-2 h-8 w-48 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-72 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-36 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="h-80 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800 lg:col-span-3" />
        <div className="h-80 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800 lg:col-span-2" />
      </div>
    </div>
  );
}

export default function Dashboard({ darkMode }) {
  const { summary, lineSeries, statusCount, loading, error } = useAnalyticsData();
  const readyToast = useRef(false);

  useEffect(() => {
    if (!loading && !error && !readyToast.current) {
      readyToast.current = true;
      toast.success('Dashboard ready', {
        description: 'Live metrics loaded from the API.',
      });
    }
  }, [loading, error]);

  useEffect(() => {
    if (error) {
      toast.error('Could not load analytics', { description: error });
    }
  }, [error]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const total = summary?.totalRequests ?? 0;
  const completed = summary?.completedTasks ?? 0;
  const pending = summary?.pendingTasks ?? 0;
  const devs = summary?.activeDevelopers ?? 0;

  const kpiStats = [
    {
      key: 'requests',
      label: 'Total Requests',
      value: total,
      icon: ClipboardList,
      gradientFrom: 'from-indigo-500',
      gradientTo: 'to-violet-600',
    },
    {
      key: 'completed',
      label: 'Completed Tasks',
      value: completed,
      icon: CheckCircle2,
      gradientFrom: 'from-emerald-500',
      gradientTo: 'to-teal-600',
    },
    {
      key: 'pending',
      label: 'Pending Tasks',
      value: pending,
      icon: Clock,
      gradientFrom: 'from-amber-500',
      gradientTo: 'to-orange-600',
    },
    {
      key: 'developers',
      label: 'Active Developers',
      value: devs,
      icon: Users,
      gradientFrom: 'from-sky-500',
      gradientTo: 'to-blue-600',
    },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white md:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Overview of requests, throughput, and team activity.
        </p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiStats.map((stat, index) => (
          <Card
            key={stat.key}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            gradientFrom={stat.gradientFrom}
            gradientTo={stat.gradientTo}
            delay={0.08 * index}
          />
        ))}
      </div>

      <Charts
        key={darkMode ? 'dark' : 'light'}
        darkMode={darkMode}
        lineSeries={lineSeries}
        statusCount={statusCount}
      />
    </div>
  );
}
