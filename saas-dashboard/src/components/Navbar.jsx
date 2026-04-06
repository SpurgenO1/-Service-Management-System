import { Moon, Sun, Bell, Search, LogOut } from 'lucide-react';

function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function Navbar({ darkMode, onToggleDark, userName, userRole, onLogout }) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-slate-200/80 bg-white/80 px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder="Search requests, people…"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
        />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          className="rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          onClick={onToggleDark}
          className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-amber-300 dark:hover:bg-slate-700"
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Sign out"
          >
            <LogOut className="h-5 w-5" strokeWidth={1.75} />
          </button>
        )}
        <div className="ml-1 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 py-1.5 pl-1.5 pr-4 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-xs font-semibold text-white dark:from-indigo-600 dark:to-violet-700">
            {initials(userName)}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {userName || 'User'}
            </p>
            <p className="text-xs text-slate-500 capitalize dark:text-slate-400">
              {userRole || '—'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
