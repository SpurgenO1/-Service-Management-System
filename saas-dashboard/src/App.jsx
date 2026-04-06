import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import MainLayout from './components/MainLayout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Analytics from './pages/Analytics.jsx';
import RequestsList from './pages/RequestsList.jsx';
import RequestDetail from './pages/RequestDetail.jsx';
import Settings from './pages/Settings.jsx';

function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <MainLayout
              darkMode={darkMode}
              onToggleDark={() => setDarkMode((d) => !d)}
              sidebarCollapsed={sidebarCollapsed}
              onSidebarToggle={() => setSidebarCollapsed((c) => !c)}
            />
          }
        >
          <Route path="/dashboard" element={<Dashboard darkMode={darkMode} />} />
          <Route path="/analytics" element={<Analytics darkMode={darkMode} />} />
          <Route path="/requests" element={<RequestsList />} />
          <Route path="/request/:id" element={<RequestDetail />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            classNames: {
              toast:
                'rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-lg',
            },
          }}
        />
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}
