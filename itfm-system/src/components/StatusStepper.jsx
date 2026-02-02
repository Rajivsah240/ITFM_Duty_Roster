import { motion } from 'framer-motion';
import { Check, Circle, Clock, Wrench, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const steps = [
  { key: 'raised', label: 'Raised', description: 'Ticket submitted' },
  { key: 'assigned', label: 'Assigned', description: 'Engineer assigned' },
  { key: 'inProgress', label: 'In Progress', description: 'Being worked on' },
  { key: 'resolved', label: 'Resolved', description: 'Issue fixed' },
];

const statusOrder = ['raised', 'assigned', 'inProgress', 'resolved'];

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

  return (
    <div className="py-4">
      <div className="relative">
        {/* Progress Line */}
        <div className={`absolute left-6 top-6 bottom-6 w-0.5 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="absolute left-6 top-6 w-0.5 bg-blue-800"
          style={{ maxHeight: 'calc(100% - 48px)' }}
        />

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isPending = index > currentIndex;
            const timestamp = ticket.timestamps[step.key];
            const showActionsForStep = showActionLogs && step.key === 'inProgress' && 
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
                      ? 'bg-blue-800 text-white'
                      : isCurrent
                      ? isDark ? 'bg-blue-800 text-white ring-4 ring-blue-900' : 'bg-blue-800 text-white ring-4 ring-blue-200'
                      : isDark ? 'bg-slate-700 text-slate-500' : 'bg-slate-100 text-slate-400'
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
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
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
                    <div className={`mt-4 p-4 rounded-lg ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-slate-50 border border-slate-200'}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <Wrench className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                        <h5 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                          Actions Taken ({ticket.actionLogs.length})
                        </h5>
                      </div>
                      <div className="space-y-3">
                        {ticket.actionLogs.map((log) => (
                          <div 
                            key={log.id} 
                            className={`pl-4 border-l-2 ${isDark ? 'border-blue-600' : 'border-blue-400'}`}
                          >
                            <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              {log.description}
                            </p>
                            <div className={`flex items-center gap-3 mt-1 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {log.engineerName}
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
