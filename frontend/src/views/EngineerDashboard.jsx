import { useState, useEffect } from 'react';
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
  critical: { label: 'Critical', color: 'bg-red-100 text-red-700 border-red-200', darkColor: 'bg-red-900/50 text-red-300', icon: AlertTriangle },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700 border-orange-200', darkColor: 'bg-orange-900/50 text-orange-300', icon: AlertCircle },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', darkColor: 'bg-yellow-900/50 text-yellow-300', icon: Info },
  low: { label: 'Low', color: 'bg-green-100 text-green-700 border-green-200', darkColor: 'bg-green-900/50 text-green-300', icon: Info },
};

const statusConfig = {
  assigned: { label: 'Assigned', color: 'bg-blue-100 text-blue-700', darkColor: 'bg-blue-500/20 text-blue-400' },
  'in-progress': { label: 'In Progress', color: 'bg-purple-100 text-purple-700', darkColor: 'bg-purple-900/50 text-purple-300' },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-700', darkColor: 'bg-green-900/50 text-green-300' },
};

export default function EngineerDashboard() {
  const { tickets, loading, fetchTickets, getTicketsByEngineer, getEngineerTicketHistory, addActionLog, resolveTicket, requestReassign } = useTickets();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [showReassignModal, setShowReassignModal] = useState(null);
  const [reassignReason, setReassignReason] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const myTickets = getTicketsByEngineer(user?.id || user?._id);
  const ticketHistory = getEngineerTicketHistory(user?.id || user?._id);
  
  // Separate counts for resolved and reassignment requested
  const resolvedCount = ticketHistory.filter(t => t.assignedTo?._id === (user?.id || user?._id) && t.status === 'resolved').length;
  const reassignRequestedCount = ticketHistory.filter(t => t.reassignRequest?.requestedBy?._id === (user?.id || user?._id) && t.reassignRequest?.requested).length;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAddAction = async (ticketId, action, details) => {
    const result = await addActionLog(ticketId, action, details);
    if (result.success) {
      fetchTickets();
    }
  };

  const handleResolve = async (ticketId) => {
    const result = await resolveTicket(ticketId);
    if (!result.success) {
      alert(result.error);
    } else {
      setExpandedTicket(null);
      fetchTickets();
    }
  };

  const handleRequestReassign = async (ticketId) => {
    if (!reassignReason.trim()) {
      alert('Please provide a reason for reassignment');
      return;
    }
    const result = await requestReassign(ticketId, reassignReason);
    if (result.success) {
      setShowReassignModal(null);
      setReassignReason('');
      fetchTickets();
    } else {
      alert(result.error);
    }
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (myTickets.length === 0 && ticketHistory.length === 0) {
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
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`rounded-xl border p-4 ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
              <Wrench className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{myTickets.length}</p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Active</p>
            </div>
          </div>
        </div>
        <div className={`rounded-xl border p-4 ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-green-900/50' : 'bg-green-100'}`}>
              <CheckCircle className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{resolvedCount}</p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Resolved</p>
            </div>
          </div>
        </div>
        <div className={`rounded-xl border p-4 ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-orange-900/50' : 'bg-orange-100'}`}>
              <RefreshCw className={`w-5 h-5 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{reassignRequestedCount}</p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Reassign Req.</p>
            </div>
          </div>
        </div>
        <div className={`rounded-xl border p-4 ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
              <Clock className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{myTickets.length + ticketHistory.length}</p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Tabs */}
      <div className={`flex gap-2 p-1 rounded-lg ${isDark ? 'bg-dark-card' : 'bg-slate-100'}`}>
        <button
          onClick={() => setShowHistory(false)}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            !showHistory
              ? 'bg-blue-500 dark:bg-blue-500 text-white'
              : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          Active Tickets ({myTickets.length})
        </button>
        <button
          onClick={() => setShowHistory(true)}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            showHistory
              ? 'bg-blue-500 dark:bg-blue-500 text-white'
              : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          History ({ticketHistory.length})
        </button>
      </div>

      {/* Active Tickets Section */}
      {!showHistory && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>My Assigned Tickets</h2>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tickets requiring your attention</p>
            </div>
            <span className={`px-3 py-1.5 text-sm font-medium rounded-lg ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
              {myTickets.length} tickets
            </span>
          </div>

          {myTickets.length === 0 ? (
            <div className={`rounded-xl border p-12 text-center ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-slate-200'}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-green-900/30' : 'bg-green-100'}`}>
                <CheckCircle className={`w-8 h-8 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>No Active Tickets</h3>
              <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>You have no tickets requiring your attention right now.</p>
            </div>
          ) : (
            <div className="space-y-4">
        {myTickets.map((ticket) => {
          const isExpanded = expandedTicket === ticket._id;
          const severity = severityConfig[ticket.severity];
          const status = statusConfig[ticket.status];
          const SeverityIcon = severity?.icon;
          const hasReassignRequest = ticket.reassignRequest?.status === 'pending';

          return (
            <motion.div
              key={ticket._id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border overflow-hidden ticket-card shadow-sm ${
                isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-slate-200'
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
                onClick={() => setExpandedTicket(isExpanded ? null : ticket._id)}
                className={`p-5 cursor-pointer transition-colors ${isDark ? 'hover:bg-dark-hover' : 'hover:bg-slate-50'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                      <Wrench className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{ticket.ticketId}</h3>
                        {status && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isDark ? status.darkColor : status.color}`}>
                            {status.label}
                          </span>
                        )}
                        {severity && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${isDark ? severity.darkColor : severity.color}`}>
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
                      <p className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{ticket.raisedBy?.name}</p>
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
                    <div className={`border-t ${isDark ? 'border-dark-border' : 'border-slate-100'}`}>
                      {/* Ticket Details */}
                      <div className={`p-5 grid grid-cols-2 md:grid-cols-4 gap-4 ${isDark ? 'bg-dark-elevated' : 'bg-slate-50'}`}>
                        <div>
                          <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Call Type</p>
                          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{ticket.callType}</p>
                        </div>
                        <div>
                          <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Raised</p>
                          <p className={`text-sm font-medium flex items-center gap-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            <Clock className="w-3 h-3" />
                            {formatDate(ticket.createdAt)}
                          </p>
                        </div>
                        <div>
                          <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Assigned</p>
                          <p className={`text-sm font-medium flex items-center gap-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            <Clock className="w-3 h-3" />
                            {formatDate(ticket.updatedAt)}
                          </p>
                        </div>
                        <div>
                          <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Status</p>
                          <p className={`text-sm font-medium flex items-center gap-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            {ticket.status}
                          </p>
                        </div>
                      </div>

                      {/* Action Logger */}
                      <div className="p-5">
                        <ActionLogger
                          ticket={ticket}
                          onAddAction={(action, details) => handleAddAction(ticket._id, action, details)}
                          onResolve={() => handleResolve(ticket._id)}
                        />
                        
                        {/* Request Reassign Button */}
                        {!hasReassignRequest && (
                          <div className={`mt-4 pt-4 border-t ${isDark ? 'border-dark-border' : 'border-slate-200'}`}>
                            <button
                              onClick={() => setShowReassignModal(ticket._id)}
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
          )}
        </>
      )}

      {/* History Section */}
      {showHistory && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Ticket History</h2>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Previously assigned tickets (resolved or reassigned)</p>
            </div>
            <span className={`px-3 py-1.5 text-sm font-medium rounded-lg ${isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'}`}>
              {ticketHistory.length} tickets
            </span>
          </div>

          {ticketHistory.length === 0 ? (
            <div className={`rounded-xl border p-12 text-center ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-slate-200'}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-dark-elevated' : 'bg-slate-100'}`}>
                <Clock className={`w-8 h-8 ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
              </div>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>No History Yet</h3>
              <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>You haven't resolved or reassigned any tickets yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ticketHistory.map((ticket) => {
                const hasReassignRequest = ticket.reassignRequest?.requestedBy?._id === (user?.id || user?._id) && ticket.reassignRequest?.requested;
                const wasResolved = ticket.status === 'resolved' && ticket.assignedTo?._id === (user?.id || user?._id);
                const reassignStatus = ticket.reassignRequest?.status;
                
                // Determine badge style based on reassign status
                const getReassignBadgeStyle = () => {
                  if (reassignStatus === 'approved') return isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700';
                  if (reassignStatus === 'rejected') return isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-700';
                  return isDark ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-700'; // pending
                };
                
                const getReassignLabel = () => {
                  if (reassignStatus === 'approved') return 'Reassigned';
                  if (reassignStatus === 'rejected') return 'Reassign Rejected';
                  return 'Reassign Pending';
                };
                
                return (
                  <motion.div
                    key={ticket._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl border overflow-hidden ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-slate-200'}`}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className={`px-2.5 py-1 text-xs font-bold rounded ${
                              statusConfig[ticket.priority]?.color || 'bg-slate-100 text-slate-600'
                            }`}>
                              {ticket.priority?.toUpperCase()}
                            </span>
                            {wasResolved ? (
                              <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                                isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'
                              }`}>
                                Resolved
                              </span>
                            ) : hasReassignRequest && (
                              <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getReassignBadgeStyle()}`}>
                                {getReassignLabel()}
                              </span>
                            )}
                            <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                              {ticket.ticketId}
                            </span>
                          </div>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{ticket.problemDescription}</p>
                          <div className={`flex items-center gap-4 mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
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
                        <div className="text-right shrink-0">
                          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {wasResolved ? 'Resolved on' : hasReassignRequest ? 'Requested on' : 'Updated on'}
                          </p>
                          <p className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            {formatDate(wasResolved ? ticket.updatedAt : ticket.reassignRequest?.requestedAt || ticket.updatedAt)}
                          </p>
                          {hasReassignRequest && ticket.reassignRequest?.reason && (
                            <p className={`text-xs mt-1 max-w-[150px] truncate ${isDark ? 'text-orange-400/70' : 'text-orange-600/70'}`}>
                              Reason: {ticket.reassignRequest.reason}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}
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
            className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${isDark ? 'bg-dark-card' : 'bg-white'}`}
          >
            <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-dark-border' : 'border-slate-100'}`}>
              <div>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Request Reassignment</h2>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{showReassignModal}</p>
              </div>
              <button
                onClick={() => setShowReassignModal(null)}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-dark-hover' : 'hover:bg-slate-100'}`}
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
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none ${
                    isDark 
                      ? 'bg-dark-input border-dark-border text-white placeholder-slate-400' 
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                />
                <p className={`text-xs mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Admin will review your request and assign to another engineer.
                </p>
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
                      ? 'bg-dark-elevated text-slate-300 hover:bg-dark-hover' 
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
