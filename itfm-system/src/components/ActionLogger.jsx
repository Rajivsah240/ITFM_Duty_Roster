import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import {
  Plus,
  Clock,
  User,
  FileText,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export default function ActionLogger({ ticket, onAddAction, onResolve }) {
  const [isAdding, setIsAdding] = useState(false);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const { isDark } = useTheme();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Action description is required');
      return;
    }
    onAddAction(description);
    setDescription('');
    setIsAdding(false);
    setError('');
  };

  const handleResolve = () => {
    if (ticket.actionLogs.length === 0) {
      setError('You must add at least one action log before resolving the ticket');
      return;
    }
    onResolve();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className={`font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
          <FileText className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-800'}`} />
          Action Log
        </h3>
        <div className="flex items-center gap-2">
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-800 text-white text-sm font-medium rounded-lg hover:bg-blue-900 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Action
            </button>
          )}
          {ticket.status !== 'resolved' && (
            <button
              onClick={handleResolve}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Mark Resolved
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`flex items-center gap-2 p-3 rounded-lg text-sm ${isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-700'}`}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Action Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className={`rounded-lg p-4 space-y-3 ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}
          >
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Action Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setError('');
                }}
                placeholder="Describe the action taken..."
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800 outline-none transition-all resize-none ${
                  isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-slate-200 text-slate-800'
                }`}
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-800 text-white text-sm font-medium rounded-lg hover:bg-blue-900 transition-colors"
              >
                Save Action
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setDescription('');
                  setError('');
                }}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isDark ? 'bg-slate-600 text-slate-200 hover:bg-slate-500' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Action Log Timeline */}
      <div className="space-y-3">
        {ticket.actionLogs.length === 0 ? (
          <div className={`text-center py-8 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
            <FileText className={`w-10 h-10 mx-auto mb-2 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No actions logged yet</p>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Add an action to track progress on this ticket
            </p>
          </div>
        ) : (
          <div className="relative">
            <div className={`absolute left-4 top-0 bottom-0 w-0.5 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
            {ticket.actionLogs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-10 pb-4"
              >
                <div className={`absolute left-2.5 w-3 h-3 bg-blue-800 rounded-full border-2 ${isDark ? 'border-slate-800' : 'border-white'}`} />
                <div className={`rounded-lg p-4 shadow-sm ${isDark ? 'bg-slate-700 border border-slate-600' : 'bg-white border border-slate-200'}`}>
                  <p className={`text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{log.description}</p>
                  <div className={`flex items-center gap-4 mt-3 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
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
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
