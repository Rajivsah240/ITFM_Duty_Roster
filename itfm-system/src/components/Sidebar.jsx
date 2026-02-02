import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTickets } from '../context/TicketContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  Ticket,
  Plus,
  ClipboardList,
  Users,
  LogOut,
  Building2,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

const menuItems = {
  admin: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'unassigned', label: 'Unassigned Tickets', icon: Ticket },
    { id: 'active', label: 'Active Issues', icon: ClipboardList },
    { id: 'workload', label: 'Engineer Workload', icon: Users },
    { id: 'reassignments', label: 'Reassign Requests', icon: RefreshCw },
  ],
  engineer: [
    { id: 'assigned', label: 'Assigned to Me', icon: ClipboardList },
  ],
  user: [
    { id: 'raise', label: 'Raise Query', icon: Plus },
    { id: 'mytickets', label: 'My Tickets', icon: Ticket },
  ],
};

export default function Sidebar({ activeView, setActiveView }) {
  const { user, logout } = useAuth();
  const { getReassignRequests } = useTickets();
  const { isDark } = useTheme();
  const items = menuItems[user.role] || [];
  const reassignCount = user.role === 'admin' ? getReassignRequests().length : 0;

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className={`w-64 border-r min-h-screen flex flex-col ${
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}
    >
      {/* Logo */}
      <div className={`p-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-800 rounded-xl flex items-center justify-center shadow-lg shadow-blue-800/25">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>ITFM System</h1>
            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Facilities Management</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className={`p-4 mx-4 mt-4 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-blue-900' : 'bg-blue-100'}`}>
            <span className={`font-semibold text-sm ${isDark ? 'text-blue-400' : 'text-blue-800'}`}>
              {user.name.split(' ').map((n) => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-medium text-sm truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{user.name}</p>
            <p className={`text-xs capitalize ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{user.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <p className={`text-xs font-medium uppercase tracking-wider px-3 mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          Menu
        </p>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          const showBadge = item.id === 'reassignments' && reassignCount > 0;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-800 text-white shadow-lg shadow-blue-800/25'
                  : isDark 
                    ? 'text-slate-300 hover:bg-slate-700' 
                    : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="flex-1 text-left">{item.label}</span>
              {showBadge && (
                <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full">
                  {reassignCount}
                </span>
              )}
              {isActive && <ChevronRight className="w-4 h-4" />}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className={`p-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            isDark 
              ? 'text-slate-300 hover:bg-red-900/30 hover:text-red-400' 
              : 'text-slate-600 hover:bg-red-50 hover:text-red-600'
          }`}
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </motion.aside>
  );
}
