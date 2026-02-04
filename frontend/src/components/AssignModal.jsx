import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, AlertTriangle, AlertCircle, Info, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function AssignModal({ ticket, engineers, onAssign, onClose, title = 'Assign Ticket' }) {
  const [selectedEngineer, setSelectedEngineer] = useState('');
  const [severity, setSeverity] = useState(ticket.severity || '');
  const { isDark } = useTheme();
  const isReassign = title.toLowerCase().includes('reassign');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedEngineer) return;
    if (!isReassign && !severity) return;

    const engineer = engineers.find((e) => e._id === selectedEngineer);
    if (isReassign) {
      onAssign(ticket._id, engineer._id, engineer.name);
    } else {
      onAssign(ticket._id, engineer._id, engineer.name, severity);
    }
    onClose();
  };

  const severityOptions = [
    { value: 'critical', label: 'Critical', desc: 'System down, business impact', icon: AlertTriangle, color: isDark ? 'border-red-700 bg-red-900/30' : 'border-red-300 bg-red-50' },
    { value: 'high', label: 'High', desc: 'Major functionality affected', icon: AlertCircle, color: isDark ? 'border-orange-700 bg-orange-900/30' : 'border-orange-300 bg-orange-50' },
    { value: 'medium', label: 'Medium', desc: 'Minor issue, workaround exists', icon: Info, color: isDark ? 'border-yellow-700 bg-yellow-900/30' : 'border-yellow-300 bg-yellow-50' },
    { value: 'low', label: 'Low', desc: 'Low priority, non-urgent', icon: Info, color: isDark ? 'border-dark-border bg-dark-elevated' : 'border-slate-300 bg-slate-50' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className={`rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden ${isDark ? 'bg-dark-card' : 'bg-white'}`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-dark-border' : 'border-slate-100'}`}>
            <div>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{title}</h2>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{ticket.ticketId}</p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-dark-hover' : 'hover:bg-slate-100'}`}
            >
              <X className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            </button>
          </div>

          {/* Ticket Info */}
          <div className={`px-6 py-4 border-b ${isDark ? 'bg-dark-elevated border-dark-border' : 'bg-slate-50 border-slate-100'}`}>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Asset ID</p>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{ticket.assetId}</p>
              </div>
              <div>
                <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Call Type</p>
                <p className={`font-medium capitalize ${isDark ? 'text-white' : 'text-slate-800'}`}>{ticket.callType}</p>
              </div>
              <div className="col-span-2">
                <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Problem</p>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{ticket.problemDescription}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Engineer Selection */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {isReassign ? 'Reassign to Engineer *' : 'Assign to Engineer *'}
              </label>
              <div className="space-y-2">
                {engineers.map((engineer) => (
                  <label
                    key={engineer._id}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedEngineer === engineer._id
                        ? isDark ? 'border-blue-500 bg-blue-500/20' : 'border-blue-500 bg-blue-50'
                        : isDark ? 'border-dark-border hover:border-dark-hover' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="engineer"
                      value={engineer._id}
                      checked={selectedEngineer === engineer._id}
                      onChange={(e) => setSelectedEngineer(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                      <User className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{engineer.name}</p>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{engineer.department}</p>
                    </div>
                    {selectedEngineer === engineer._id && (
                      <Check className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Severity Selection - only for new assignments */}
            {!isReassign && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Set Severity *
                </label>
                <div className="space-y-2">
                  {severityOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                    <label
                      key={option.value}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                        severity === option.value
                          ? `${option.color} border-2`
                          : isDark ? 'border-dark-border hover:border-dark-hover' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="severity"
                        value={option.value}
                        checked={severity === option.value}
                        onChange={(e) => setSeverity(e.target.value)}
                        className="sr-only"
                      />
                      <Icon className={`w-5 h-5 ${
                        option.value === 'critical' ? 'text-red-500' :
                        option.value === 'high' ? 'text-orange-500' : 
                        option.value === 'medium' ? 'text-yellow-500' : 'text-slate-500'
                      }`} />
                      <div className="flex-1">
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{option.label}</p>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{option.desc}</p>
                      </div>
                      {severity === option.value && (
                        <Check className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4">
              <button
                type="submit"
                disabled={!selectedEngineer || (!isReassign && !severity)}
                className="flex-1 py-2.5 bg-blue-500 dark:bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isReassign ? 'Reassign Ticket' : 'Assign Ticket'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className={`px-6 py-2.5 font-medium rounded-lg transition-colors ${
                  isDark ? 'bg-dark-elevated text-slate-300 hover:bg-dark-hover' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
