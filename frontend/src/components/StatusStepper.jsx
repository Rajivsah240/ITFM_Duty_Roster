import { motion } from 'framer-motion';
import { Check, Circle, Clock, Wrench, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const steps = [
  { key: 'open', label: 'Open', description: 'Ticket submitted' },
  { key: 'assigned', label: 'Assigned', description: 'Engineer assigned' },
  { key: 'in-progress', label: 'In Progress', description: 'Being worked on' },
  { key: 'resolved', label: 'Resolved', description: 'Issue fixed' },
];

const statusOrder = ['open', 'assigned', 'in-progress', 'resolved'];

export default function StatusStepper({ ticket, showActionLogs = false }) {
  const currentIndex = statusOrder.indexOf(ticket.status);
  const { isDark } = useTheme();

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get timestamp for each status from action logs or ticket dates
  const getTimestampForStatus = (statusKey) => {
    if (statusKey === 'open') {
      return ticket.createdAt;
    }
    // Find the action log that matches the status change
    const statusActionLog = ticket.actionLogs?.find(log => {
      const action = log.action?.toLowerCase() || '';
      if (statusKey === 'assigned') return action.includes('assigned');
      if (statusKey === 'in-progress') return action.includes('progress') || action.includes('started');
      if (statusKey === 'resolved') return action.includes('resolved');
      return false;
    });
    return statusActionLog?.timestamp || null;
  };

  return (
    <div className="py-4">
      <div className="relative">
        {/* Progress Line */}
        <div className={`absolute left-6 top-6 bottom-6 w-0.5 ${isDark ? 'bg-dark-border' : 'bg-slate-200'}`} />
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`absolute left-6 top-6 w-0.5 ${isDark ? 'bg-blue-500' : 'bg-blue-500'}`}
          style={{ maxHeight: 'calc(100% - 48px)' }}
        />

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isPending = index > currentIndex;
            const timestamp = getTimestampForStatus(step.key);
            const showActionsForStep = showActionLogs && step.key === 'in-progress' && 
              (isCurrent || isCompleted) && ticket.actionLogs && ticket.actionLogs.length > 0;

            return (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex items-start gap-4"
              >
                {/* Icon */}
                <div
                  className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-blue-500 dark:bg-blue-500 text-white'
                      : isCurrent
                      ? isDark ? 'bg-blue-500 text-white ring-4 ring-blue-500/30' : 'bg-blue-500 text-white ring-4 ring-blue-200'
                      : isDark ? 'bg-dark-elevated text-slate-500' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : isCurrent ? (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <Clock className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-3">
                    <h4
                      className={`font-medium ${
                        isPending 
                          ? isDark ? 'text-slate-500' : 'text-slate-400' 
                          : isDark ? 'text-white' : 'text-slate-800'
                      }`}
                    >
                      {step.label}
                    </h4>
                    {isCurrent && (
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-500'}`}>
                        Current
                      </span>
                    )}
                  </div>
                  <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{step.description}</p>
                  {timestamp && (
                    <p className={`text-xs mt-1 flex items-center gap-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      <Clock className="w-3 h-3" />
                      {formatDate(timestamp)}
                    </p>
                  )}
                  
                  {/* Action Logs for In Progress Step */}
                  {showActionsForStep && (
                    <div className={`mt-4 p-4 rounded-lg ${isDark ? 'bg-dark-card border border-dark-border' : 'bg-slate-50 border border-slate-200'}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <Wrench className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                        <h5 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                          Actions Taken ({ticket.actionLogs.length})
                        </h5>
                      </div>
                      <div className="space-y-3">
                        {ticket.actionLogs.map((log) => (
                          <div 
                            key={log._id} 
                            className={`pl-4 border-l-2 ${isDark ? 'border-blue-500' : 'border-blue-400'}`}
                          >
                            <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              {log.action}
                            </p>
                            <div className={`flex items-center gap-3 mt-1 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {log.performedBy?.name || 'System'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(log.timestamp)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
