import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext.jsx';
import { SOCKET_URL } from '../lib/api.js';
import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx';

export default function MainLayout({ darkMode, onToggleDark, sidebarCollapsed, onSidebarToggle }) {
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user?.token) return undefined;
    const socket = io(SOCKET_URL, {
      auth: { token: user.token },
      transports: ['websocket', 'polling'],
    });

    socket.on('ticket:status', (payload) => {
      toast.info('Request status updated', {
        description: `${payload.previousStatus} → ${payload.status}`,
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.token]);

  return (
    <div className="flex min-h-screen">
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={onSidebarToggle} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          darkMode={darkMode}
          onToggleDark={onToggleDark}
          userName={user?.name}
          userRole={user?.role}
          onLogout={logout}
        />
        <main className="flex-1 overflow-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
