import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  MapPin,
  Monitor,
  Clock,
  User,
} from 'lucide-react';

export default function TicketTable({ tickets, onRowClick, showAssignee = true }) {
  const { isDark } = useTheme();
  
  const severityConfig = {
    critical: { label: 'Critical', color: isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-700', icon: AlertTriangle },
    high: { label: 'High', color: isDark ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-100 text-orange-700', icon: AlertCircle },
    medium: { label: 'Medium', color: isDark ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-700', icon: Info },
    low: { label: 'Low', color: isDark ? 'bg-dark-elevated text-slate-400' : 'bg-slate-100 text-slate-600', icon: Info },
  };

  const statusConfig = {
    open: { label: 'Open', color: isDark ? 'bg-dark-elevated text-slate-300' : 'bg-slate-100 text-slate-700' },
    assigned: { label: 'Assigned', color: isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700' },
    'in-progress': { label: 'In Progress', color: isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700' },
    resolved: { label: 'Resolved', color: isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700' },
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (tickets.length === 0) {
    return (
      <div className={`rounded-xl border p-12 text-center ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-slate-200'}`}>
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-dark-elevated' : 'bg-slate-100'}`}>
          <Info className={`w-8 h-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
        </div>
        <h3 className={`text-lg font-medium mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>No tickets found</h3>
        <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>There are no tickets matching this criteria.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border overflow-hidden ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-slate-200'}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`border-b ${isDark ? 'bg-dark-table-header border-dark-border' : 'bg-slate-50 border-slate-200'}`}>
              <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Ticket ID
              </th>
              <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Asset ID
              </th>
              <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Call Type
              </th>
              <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Problem Description
              </th>
              <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Location
              </th>
              <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Status
              </th>
              <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Severity
              </th>
              {showAssignee && (
                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Assigned To
                </th>
              )}
              <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Raised
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-dark-border' : 'divide-slate-100'}`}>
            {tickets.map((ticket, index) => {
              const status = statusConfig[ticket.status] || statusConfig.open;
              const severity = ticket.severity ? severityConfig[ticket.severity] : null;
              const SeverityIcon = severity?.icon;

              return (
                <motion.tr
                  key={ticket._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onRowClick && onRowClick(ticket)}
                  className={`transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  } ${isDark ? 'hover:bg-dark-hover' : 'hover:bg-slate-50'}`}
                >
                  <td className="px-4 py-4">
                    <span className={`font-mono text-sm font-medium ${isDark ? 'text-blue-400' : 'text-blue-500'}`}>
                      {ticket.ticketId}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Monitor className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                      <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{ticket.assetId}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-sm capitalize ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{ticket.callType}</span>
                  </td>
                  <td className="px-4 py-4 max-w-xs">
                    <p className={`text-sm truncate ${isDark ? 'text-slate-300' : 'text-slate-700'}`} title={ticket.problemDescription}>
                      {ticket.problemDescription}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <MapPin className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                      <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{ticket.location}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {severity ? (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${severity.color}`}>
                        <SeverityIcon className="w-3 h-3" />
                        {severity.label}
                      </span>
                    ) : (
                      <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>-</span>
                    )}
                  </td>
                  {showAssignee && (
                    <td className="px-4 py-4">
                      {ticket.assignedTo?.name ? (
                        <div className="flex items-center gap-2">
                          <User className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                          <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{ticket.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Unassigned</span>
                      )}
                    </td>
                  )}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Clock className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                      <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {formatDate(ticket.createdAt)}
                      </span>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
