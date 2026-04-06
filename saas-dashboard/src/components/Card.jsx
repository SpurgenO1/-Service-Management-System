import { motion } from 'framer-motion';
import CountUp from 'react-countup';

/**
 * KPI stat card with gradient, hover lift, and count-up animation.
 */
export default function Card({ icon: Icon, label, value, gradientFrom, gradientTo, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradientFrom} ${gradientTo} p-6 shadow-card transition-shadow duration-300 hover:shadow-card-hover dark:shadow-none dark:ring-1 dark:ring-white/10`}
    >
      <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-8 left-1/2 h-24 w-48 -translate-x-1/2 rounded-full bg-black/5 blur-xl dark:bg-white/5" />
      <div className="relative flex items-start justify-between">
        <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-sm dark:bg-black/20">
          <Icon className="h-6 w-6 text-white" strokeWidth={1.75} />
        </div>
      </div>
      <div className="relative mt-4">
        <p className="text-3xl font-bold tabular-nums tracking-tight text-white">
          <CountUp end={value} duration={2} separator="," />
        </p>
        <p className="mt-1 text-sm font-medium text-white/90">{label}</p>
      </div>
    </motion.div>
  );
}
