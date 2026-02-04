import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TicketProvider, useTickets } from './context/TicketContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import AuthWrapper from './components/AuthWrapper';
import Sidebar from './components/Sidebar';
import NotificationPanel from './components/NotificationPanel';
import AdminDashboard from './views/AdminDashboard';
import EngineerDashboard from './views/EngineerDashboard';
import UserDashboard from './views/UserDashboard';
import { Bell, Search, Sun, Moon } from 'lucide-react';

function Dashboard() {
  const { user } = useAuth();
  const { getUnreadCount } = useTickets();
  const { isDark, toggleTheme } = useTheme();
  const [activeView, setActiveView] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Set default view based on role
  useEffect(() => {
    if (user) {
      const defaultViews = {
        admin: 'dashboard',
        engineer: 'assigned',
        user: 'raise',
      };
      setActiveView(defaultViews[user.role] || 'dashboard');
    }
  }, [user]);

  // Fetch unread count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      const count = await getUnreadCount();
      setUnreadCount(count);
    };
    fetchUnreadCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [getUnreadCount]);

  const getPageTitle = () => {
    const titles = {
      dashboard: 'Dashboard',
      unassigned: 'Unassigned Tickets',
      active: 'Active Issues',
      workload: 'Engineer Workload',
      reassignments: 'Reassignment Requests',
      assigned: 'My Assigned Tickets',
      raise: 'Raise Query',
      mytickets: 'My Tickets',
    };
    return titles[activeView] || 'Dashboard';
  };

  return (
    <div className={`flex min-h-screen ${isDark ? 'dark bg-dark-bg' : 'bg-slate-50'}`}>
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className={`${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-slate-200'} border-b px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div>
              <motion.h1
                key={activeView}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}
              >
                {getPageTitle()}
              </motion.h1>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Welcome back, {user.name}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  type="text"
                  placeholder="Search..."
                  className={`pl-10 pr-4 py-2 w-64 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/30 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-all ${
                    isDark 
                      ? 'bg-dark-input border-dark-border text-white placeholder-slate-400' 
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                />
              </div>
              
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-dark-hover text-slate-400' : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              {/* Notifications */}
              {(user.role === 'admin' || user.role === 'engineer') && (
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`relative p-2 rounded-lg transition-colors ${
                      isDark ? 'hover:bg-dark-hover' : 'hover:bg-slate-100'
                    }`}
                  >
                    <Bell className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  <NotificationPanel 
                    isOpen={showNotifications} 
                    onClose={() => setShowNotifications(false)} 
                  />
                </div>
              )}
              
              {/* User Avatar */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-blue-500' : 'bg-blue-500'}`}>
                <span className="text-white font-semibold text-sm">
                  {user.name.split(' ').map((n) => n[0]).join('')}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className={`flex-1 p-6 overflow-auto ${isDark ? 'bg-dark-bg' : 'bg-slate-50'}`}>
          {user.role === 'admin' && <AdminDashboard activeView={activeView} />}
          {user.role === 'engineer' && <EngineerDashboard />}
          {user.role === 'user' && <UserDashboard activeView={activeView} />}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TicketProvider>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1e293b',
                color: '#f1f5f9',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#f1f5f9',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#f1f5f9',
                },
              },
            }}
          />
          <AuthWrapper>
            <Dashboard />
          </AuthWrapper>
        </TicketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App
