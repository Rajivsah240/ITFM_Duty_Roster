import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTickets } from '../context/TicketContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ActionLogger from '../components/ActionLogger';
import {
  ChevronDown,
  ChevronUp,
  Monitor,
  MapPin,
  Clock,
  User,
  AlertTriangle,
  AlertCircle,
  Info,
  Wrench,
  CheckCircle,
  RefreshCw,
  X,
} from 'lucide-react';

const severityConfig = {
  1: { label: 'Critical', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle },
  2: { label: 'High', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: AlertCircle },
  3: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Info },
};

const statusConfig = {
  assigned: { label: 'Assigned', color: 'bg-blue-100 text-blue-700' },
  inProgress: { label: 'In Progress', color: 'bg-purple-100 text-purple-700' },
};

export default function EngineerDashboard() {
  const { getTicketsByEngineer, addActionLog, resolveTicket, requestReassign } = useTickets();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [showReassignModal, setShowReassignModal] = useState(null);
  const [reassignReason, setReassignReason] = useState('');

  const myTickets = getTicketsByEngineer(user.id);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAddAction = (ticketId, description) => {
    addActionLog(ticketId, description, user);
  };

  const handleResolve = (ticketId) => {
    const result = resolveTicket(ticketId);
    if (!result.success) {
      alert(result.error);
    } else {
      setExpandedTicket(null);
    }
  };

  const handleRequestReassign = (ticketId) => {
    if (!reassignReason.trim()) {
      alert('Please provide a reason for reassignment');
      return;
    }
    requestReassign(ticketId, reassignReason, user);
    setShowReassignModal(null);
    setReassignReason('');
  };

  if (myTickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-green-900/30' : 'bg-green-100'}`}>
          <CheckCircle className={`w-10 h-10 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
        </div>
        <h2 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>All Caught Up!</h2>
        <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>You have no tickets assigned to you at the moment.</p>
      </div>
    );
  }

  return (
    <>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>My Assigned Tickets</h2>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tickets requiring your attention</p>
        </div>
        <span className={`px-3 py-1.5 text-sm font-medium rounded-lg ${isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
          {myTickets.length} tickets
        </span>
      </div>

      <div className="space-y-4">
        {myTickets.map((ticket) => {
          const isExpanded = expandedTicket === ticket.id;
          const severity = severityConfig[ticket.severity];
          const status = statusConfig[ticket.status];
          const SeverityIcon = severity?.icon;
          const hasReassignRequest = ticket.reassignRequest !== null;

          return (
            <motion.div
              key={ticket.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border overflow-hidden ticket-card shadow-sm ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
              }`}
            >
              {/* Reassign Request Banner */}
              {hasReassignRequest && (
                <div className={`px-5 py-2 flex items-center gap-2 ${isDark ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-50 text-orange-700'}`}>
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-sm font-medium">Reassignment requested - awaiting admin approval</span>
                </div>
              )}
              
              {/* Card Header */}
              <div
                onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)}
                className={`p-5 cursor-pointer transition-colors ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
                      <Wrench className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-800'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{ticket.id}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                        {severity && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${severity.color}`}>
                            <SeverityIcon className="w-3 h-3" />
                            {severity.label}
                          </span>
                        )}
                      </div>
                      <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>{ticket.problemDescription}</p>
                      <div className={`flex items-center gap-4 mt-3 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <span className="flex items-center gap-1">
                          <Monitor className="w-4 h-4" />
                          {ticket.assetId}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {ticket.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Raised by</p>
                      <p className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{ticket.raisedByName}</p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className={`w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    ) : (
                      <ChevronDown className={`w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={`border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                      {/* Ticket Details */}
                      <div className={`p-5 grid grid-cols-2 md:grid-cols-4 gap-4 ${isDark ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
                        <div>
                          <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Call Type</p>
                          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{ticket.callType}</p>
                        </div>
                        <div>
                          <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Raised</p>
                          <p className={`text-sm font-medium flex items-center gap-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            <Clock className="w-3 h-3" />
                            {formatDate(ticket.timestamps.raised)}
                          </p>
                        </div>
                        <div>
                          <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Assigned</p>
                          <p className={`text-sm font-medium flex items-center gap-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            <Clock className="w-3 h-3" />
                            {formatDate(ticket.timestamps.assigned)}
                          </p>
                        </div>
                        <div>
                          <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>In Progress</p>
                          <p className={`text-sm font-medium flex items-center gap-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            {ticket.timestamps.inProgress ? (
                              <>
                                <Clock className="w-3 h-3" />
                                {formatDate(ticket.timestamps.inProgress)}
                              </>
                            ) : (
                              <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>-</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Action Logger */}
                      <div className="p-5">
                        <ActionLogger
                          ticket={ticket}
                          onAddAction={(description) => handleAddAction(ticket.id, description)}
                          onResolve={() => handleResolve(ticket.id)}
                        />
                        
                        {/* Request Reassign Button */}
                        {!hasReassignRequest && (
                          <div className={`mt-4 pt-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                            <button
                              onClick={() => setShowReassignModal(ticket.id)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isDark 
                                  ? 'bg-orange-900/30 text-orange-300 hover:bg-orange-900/50' 
                                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                              }`}
                            >
                              <RefreshCw className="w-4 h-4" />
                              Request Reassignment
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
    
    {/* Reassign Modal */}
    <AnimatePresence>
      {showReassignModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowReassignModal(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-white'}`}
          >
            <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
              <div>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Request Reassignment</h2>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{showReassignModal}</p>
              </div>
              <button
                onClick={() => setShowReassignModal(null)}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
              >
                <X className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Reason for Reassignment *
                </label>
                <textarea
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  placeholder="Explain why you need this ticket reassigned..."
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800 outline-none transition-all resize-none ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleRequestReassign(showReassignModal)}
                  className="flex-1 py-2.5 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Submit Request
                </button>
                <button
                  onClick={() => {
                    setShowReassignModal(null);
                    setReassignReason('');
                  }}
                  className={`px-6 py-2.5 font-medium rounded-lg transition-colors ${
                    isDark 
                      ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
