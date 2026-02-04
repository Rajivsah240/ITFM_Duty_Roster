import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTickets } from '../context/TicketContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import TicketTable from '../components/TicketTable';
import AssignModal from '../components/AssignModal';
import {
  Ticket,
  AlertTriangle,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  RefreshCw,
  User,
} from 'lucide-react';

export default function AdminDashboard({ activeView }) {
  const { 
    tickets, 
    loading,
    fetchTickets, 
    getUnassignedTickets, 
    getActiveTickets, 
    assignTicket, 
    getReassignRequests, 
    handleReassign 
  } = useTickets();
  const { getEngineers, getWorkload, engineers } = useAuth();
  const { isDark } = useTheme();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reassignTicket, setReassignTicket] = useState(null);
  const [workload, setWorkload] = useState([]);

  useEffect(() => {
    fetchTickets();
    loadEngineers();
    loadWorkload();
  }, []);

  // Refresh data when view changes to reassignments
  useEffect(() => {
    if (activeView === 'reassignments') {
      fetchTickets();
    }
  }, [activeView]);

  const loadEngineers = async () => {
    await getEngineers();
  };

  const loadWorkload = async () => {
    const data = await getWorkload();
    setWorkload(data);
  };

  const unassigned = getUnassignedTickets();
  const active = getActiveTickets();
  const reassignRequests = getReassignRequests();

  const resolved = tickets.filter((t) => t.status === 'resolved').length;
  const totalActive = tickets.filter((t) => t.status !== 'resolved').length;

  const stats = [
    {
      label: 'Unassigned',
      value: unassigned.length,
      icon: Ticket,
      color: isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600',
      iconBg: isDark ? 'bg-red-900/50' : 'bg-red-100',
    },
    {
      label: 'Active Issues',
      value: active.length,
      icon: AlertTriangle,
      color: isDark ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-50 text-orange-600',
      iconBg: isDark ? 'bg-orange-900/50' : 'bg-orange-100',
    },
    {
      label: 'Reassign Requests',
      value: reassignRequests.length,
      icon: RefreshCw,
      color: isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-600',
      iconBg: isDark ? 'bg-purple-900/50' : 'bg-purple-100',
    },
    {
      label: 'Resolved',
      value: resolved,
      icon: CheckCircle,
      color: isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600',
      iconBg: isDark ? 'bg-green-900/50' : 'bg-green-100',
    },
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-xl border p-5 ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-slate-200'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color.split(' ')[1]}`} />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{stat.value}</p>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Unassigned Tickets */}
        <div className={`lg:col-span-2 rounded-xl border p-6 ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Unassigned Tickets</h3>
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-700'}`}>
              {unassigned.length} pending
            </span>
          </div>
          {unassigned.length > 0 ? (
            <div className="space-y-3">
              {unassigned.slice(0, 3).map((ticket) => (
                <div
                  key={ticket._id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-colors ${
                    isDark ? 'bg-dark-elevated hover:bg-dark-hover' : 'bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-red-900/50' : 'bg-red-100'}`}>
                    <Ticket className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{ticket.ticketId}</p>
                    <p className={`text-sm truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{ticket.problemDescription}</p>
                  </div>
                  <button className="px-3 py-1.5 bg-blue-500 dark:bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 dark:hover:bg-blue-600 transition-colors">
                    Assign
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
              All tickets are assigned!
            </div>
          )}
        </div>

        {/* Engineer Workload */}
        <div className={`rounded-xl border p-6 ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Engineer Workload</h3>
            <Users className={`w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          </div>
          <div className="space-y-3">
            {engineers.map((engineer) => {
              const load = workload.find(w => w.id === engineer._id);
              const count = load?.activeTickets || 0;
              const maxLoad = 5;
              const percentage = Math.min((count / maxLoad) * 100, 100);
              return (
                <div key={engineer._id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{engineer.name}</span>
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{count} tickets</span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-dark-elevated' : 'bg-slate-100'}`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      className={`h-full rounded-full ${
                        percentage > 80 ? 'bg-red-500' : percentage > 50 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUnassigned = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Unassigned Tickets</h2>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tickets waiting for engineer assignment</p>
        </div>
        <span className={`px-3 py-1.5 text-sm font-medium rounded-lg ${isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-700'}`}>
          {unassigned.length} tickets
        </span>
      </div>
      <TicketTable
        tickets={unassigned}
        onRowClick={(ticket) => setSelectedTicket(ticket)}
        showAssignee={false}
      />
    </div>
  );

  const renderActive = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Active Issues</h2>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tickets currently being worked on</p>
        </div>
        <span className={`px-3 py-1.5 text-sm font-medium rounded-lg ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
          {active.length} tickets
        </span>
      </div>
      <TicketTable tickets={active} />
    </div>
  );

  const renderWorkload = () => (
    <div className="space-y-6">
      <div>
        <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Engineer Workload</h2>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Current ticket distribution across engineers</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {engineers.map((engineer) => {
          const load = workload.find(w => w.id === engineer._id);
          const count = load?.activeTickets || 0;
          const engineerTickets = tickets.filter(
            (t) => t.assignedTo?._id === engineer._id && t.status !== 'resolved'
          );

          return (
            <motion.div
              key={engineer._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border p-6 ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-slate-200'}`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                  <span className={`font-semibold ${isDark ? 'text-blue-400' : 'text-blue-500'}`}>
                    {engineer.name.split(' ').map((n) => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{engineer.name}</p>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{engineer.department}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Active Tickets</span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{count}</span>
                </div>
                {engineerTickets.length > 0 && (
                  <div className="space-y-2">
                    {engineerTickets.slice(0, 3).map((ticket) => (
                      <div
                        key={ticket._id}
                        className={`px-3 py-2 rounded-lg text-sm ${isDark ? 'bg-dark-elevated' : 'bg-slate-50'}`}
                      >
                        <span className={`font-mono ${isDark ? 'text-blue-400' : 'text-blue-500'}`}>{ticket.ticketId}</span>
                        <span className={`mx-2 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>·</span>
                        <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>{ticket.callType}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  const renderReassignments = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Reassignment Requests</h2>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Engineers requesting ticket reassignment</p>
        </div>
        <span className={`px-3 py-1.5 text-sm font-medium rounded-lg ${isDark ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-100 text-orange-700'}`}>
          {reassignRequests.length} requests
        </span>
      </div>
      
      {reassignRequests.length > 0 ? (
        <div className="space-y-4">
          {reassignRequests.map((ticket) => (
            <motion.div
              key={ticket._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border overflow-hidden ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-slate-200'}`}
            >
              {/* Header */}
              <div className={`p-5 border-b ${isDark ? 'border-dark-border' : 'border-slate-100'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{ticket.ticketId}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isDark ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-100 text-orange-700'}`}>
                        Reassign Requested
                      </span>
                    </div>
                    <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>{ticket.problemDescription}</p>
                  </div>
                </div>
              </div>
              
              {/* Request Details */}
              <div className={`p-5 ${isDark ? 'bg-dark-elevated' : 'bg-slate-50'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Current Engineer</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                        <User className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                      </div>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{ticket.assignedTo?.name}</span>
                    </div>
                  </div>
                  <div>
                    <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Requested On</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      {new Date(ticket.reassignRequest.requestedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg ${isDark ? 'bg-dark-card' : 'bg-white'}`}>
                  <p className={`text-xs mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Reason for Reassignment</p>
                  <p className={`italic ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>"{ticket.reassignRequest.reason}"</p>
                </div>
              </div>
              
              {/* Actions */}
              <div className={`p-5 border-t flex items-center justify-between ${isDark ? 'border-dark-border' : 'border-slate-100'}`}>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Select a new engineer to reassign this ticket
                </p>
                <button
                  onClick={() => setReassignTicket(ticket)}
                  className="px-4 py-2 bg-blue-500 dark:bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 dark:hover:bg-blue-600 transition-colors"
                >
                  Reassign to Another Engineer
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className={`rounded-xl border p-12 text-center ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-slate-200'}`}>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-green-900/30' : 'bg-green-100'}`}>
            <CheckCircle className={`w-8 h-8 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
          </div>
          <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>No Pending Requests</h3>
          <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>All engineers are happy with their assignments</p>
        </div>
      )}
    </div>
  );

  const handleAssignTicket = async (ticketId, engineerId) => {
    const result = await assignTicket(ticketId, engineerId);
    if (result.success) {
      setSelectedTicket(null);
      fetchTickets();
      loadWorkload(); // Refresh workload after assignment
    }
  };

  const handleReassignTicket = async (ticketId, action, engineerId = null) => {
    const result = await handleReassign(ticketId, action, engineerId);
    if (result.success) {
      setReassignTicket(null);
      fetchTickets();
      loadWorkload(); // Refresh workload after reassignment
    }
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeView === 'dashboard' && renderDashboard()}
          {activeView === 'unassigned' && renderUnassigned()}
          {activeView === 'active' && renderActive()}
          {activeView === 'workload' && renderWorkload()}
          {activeView === 'reassignments' && renderReassignments()}
        </motion.div>
      </AnimatePresence>

      {/* Assign Modal */}
      {selectedTicket && (
        <AssignModal
          ticket={selectedTicket}
          engineers={engineers}
          onAssign={handleAssignTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}

      {/* Reassign Modal */}
      {reassignTicket && (
        <AssignModal
          ticket={reassignTicket}
          engineers={engineers.filter(e => e._id !== reassignTicket.assignedTo?._id)}
          onAssign={(ticketId, engineerId) => {
            handleReassignTicket(ticketId, 'approve', engineerId);
          }}
          onClose={() => setReassignTicket(null)}
          title="Reassign Ticket"
        />
      )}
    </>
  );
}
