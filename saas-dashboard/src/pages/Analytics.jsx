import { motion } from 'framer-motion';
import Charts from '../components/Charts.jsx';
import { useAnalyticsData } from '../hooks/useAnalyticsData.js';

export default function Analytics({ darkMode }) {
  const { lineSeries, statusCount, loading } = useAnalyticsData();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="h-80 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white md:text-3xl">
          Analytics
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Requests over time and status mix (from MongoDB aggregates).
        </p>
      </motion.div>
      <Charts darkMode={darkMode} lineSeries={lineSeries} statusCount={statusCount} />
    </div>
  );
}
