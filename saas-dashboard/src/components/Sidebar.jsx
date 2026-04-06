import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Inbox,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const menuItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/requests', label: 'Requests', icon: Inbox },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ collapsed, onToggleCollapse }) {
  const width = collapsed ? 80 : 260;

  function linkClass(isActive) {
    return `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
      isActive
        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
    } ${collapsed ? 'justify-center' : ''}`;
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width }}
      transition={{ type: 'spring', stiffness: 380, damping: 35 }}
      className="relative z-20 flex h-screen shrink-0 flex-col border-r border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex h-16 items-center justify-between border-b border-slate-200/80 px-4 dark:border-slate-800">
        <motion.div
          className="flex items-center gap-2 overflow-hidden"
          initial={false}
          animate={{ opacity: collapsed ? 0.8 : 1 }}
        >
          <NavLink to="/dashboard" className="flex shrink-0 items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-md shadow-indigo-500/25">
              T
            </div>
            {!collapsed && (
              <span className="whitespace-nowrap text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
                TechServe
              </span>
            )}
          </NavLink>
        </motion.div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) => linkClass(isActive)}
              >
                <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            </motion.div>
          );
        })}
      </nav>

      <div className="border-t border-slate-200/80 p-3 dark:border-slate-800">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
