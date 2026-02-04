import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTickets } from '../context/TicketContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import StatusStepper from '../components/StatusStepper';
import Chatbot from '../components/Chatbot';
import {
  Plus,
  Ticket,
  Monitor,
  MapPin,
  FileText,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Send,
  AlertTriangle,
} from 'lucide-react';

const callTypes = [
  { value: 'hardware', label: 'Hardware Issue' },
  { value: 'software', label: 'Software Issue' },
  { value: 'network', label: 'Network Issue' },
  { value: 'access', label: 'Access Issue' },
  { value: 'other', label: 'Other' },
];

const severityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

export default function UserDashboard({ activeView }) {
  const { createTicket, fetchTickets, getTicketsByUser, tickets, loading } = useTickets();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    assetId: '',
    callType: '',
    problemDescription: '',
    location: '',
    severity: 'medium',
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const myTickets = getTicketsByUser(user?.id || user?._id);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.assetId || !formData.callType || !formData.problemDescription || !formData.location) {
      setError('All fields are required');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await createTicket(formData);
      if (result.success) {
        setFormData({ assetId: '', callType: '', problemDescription: '', location: '', severity: 'medium' });
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 3000);
        fetchTickets();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to submit ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRaiseQuery = () => (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl border overflow-hidden ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-slate-200'}`}
      >
        {/* Header */}
        <div className={`p-6 border-b ${isDark ? 'border-dark-border' : 'border-slate-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
              <Plus className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-800'}`} />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Raise a Query</h2>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Submit a new IT support ticket</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <AnimatePresence>
          {submitSuccess && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`p-4 border-b ${isDark ? 'bg-green-900/30 border-green-800' : 'bg-green-50 border-green-100'}`}
            >
              <div className={`flex items-center gap-2 ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Ticket submitted successfully!</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`flex items-center gap-2 p-3 rounded-lg text-sm ${isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-700'}`}
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Asset ID */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Asset ID *
            </label>
            <div className="relative">
              <Monitor className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                type="text"
                name="assetId"
                value={formData.assetId}
                onChange={handleChange}
                placeholder="e.g., ASSET-PC-101"
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-800/20 dark:focus:ring-blue-500/30 focus:border-blue-800 dark:focus:border-blue-500 outline-none transition-all ${
                  isDark ? 'bg-dark-input border-dark-border text-white placeholder-slate-400' : 'bg-white border-slate-200 text-slate-800'
                }`}
              />
            </div>
          </div>

          {/* Call Type */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Call Type *
            </label>
            <div className="relative">
              <Ticket className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <select
                name="callType"
                value={formData.callType}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-800/20 dark:focus:ring-blue-500/30 focus:border-blue-800 dark:focus:border-blue-500 outline-none transition-all appearance-none ${
                  isDark ? 'bg-dark-input border-dark-border text-white' : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <option value="">Select call type</option>
                {callTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Location *
            </label>
            <div className="relative">
              <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Building A, Floor 2, Room 201"
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-800/20 dark:focus:ring-blue-500/30 focus:border-blue-800 dark:focus:border-blue-500 outline-none transition-all ${
                  isDark ? 'bg-dark-input border-dark-border text-white placeholder-slate-400' : 'bg-white border-slate-200 text-slate-800'
                }`}
              />
            </div>
          </div>

          {/* Problem Description */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Problem Description *
            </label>
            <div className="relative">
              <FileText className={`absolute left-3 top-3 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <textarea
                name="problemDescription"
                value={formData.problemDescription}
                onChange={handleChange}
                placeholder="Describe the issue in detail..."
                rows={4}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-800/20 dark:focus:ring-blue-500/30 focus:border-blue-800 dark:focus:border-blue-500 outline-none transition-all resize-none ${
                  isDark ? 'bg-dark-input border-dark-border text-white placeholder-slate-400' : 'bg-white border-slate-200 text-slate-800'
                }`}
              />
            </div>
          </div>

          
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Severity
            </label>
            <div className="relative">
              <AlertTriangle className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <select
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-800/20 dark:focus:ring-blue-500/30 focus:border-blue-800 dark:focus:border-blue-500 outline-none transition-all appearance-none ${
                  isDark ? 'bg-dark-input border-dark-border text-white' : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                {severityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-blue-800 hover:bg-blue-900 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:bg-blue-800/50 dark:disabled:bg-blue-500/50 text-white font-medium py-3 rounded-lg transition-colors shadow-lg shadow-blue-800/25 dark:shadow-blue-500/25"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Ticket
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );

  const renderMyTickets = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>My Tickets</h2>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Track the status of your submitted tickets</p>
        </div>
        <span className={`px-3 py-1.5 text-sm font-medium rounded-lg ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
          {myTickets.length} tickets
        </span>
      </div>

      {myTickets.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl border p-12 text-center ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-slate-200'}`}
        >
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-dark-elevated' : 'bg-slate-100'}`}>
            <Ticket className={`w-8 h-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          </div>
          <h3 className={`text-lg font-medium mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>No tickets yet</h3>
          <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>You haven't raised any tickets yet.</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {myTickets.map((ticket) => {
            const isExpanded = expandedTicket === ticket._id;
            return (
              <motion.div
                key={ticket._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl border overflow-hidden ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-slate-200'}`}
              >
                {/* Card Header */}
                <div
                  onClick={() => setExpandedTicket(isExpanded ? null : ticket._id)}
                  className={`p-5 cursor-pointer transition-colors ${isDark ? 'hover:bg-dark-hover' : 'hover:bg-slate-50'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                        <Ticket className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-800'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{ticket.ticketId}</h3>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            ticket.status === 'resolved'
                              ? isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'
                              : ticket.status === 'in-progress'
                              ? isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
                              : ticket.status === 'assigned'
                              ? isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                              : isDark ? 'bg-dark-elevated text-slate-300' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {ticket.status === 'in-progress' ? 'In Progress' : 
                             ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                          </span>
                        </div>
                        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{ticket.problemDescription}</p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className={`w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    ) : (
                      <ChevronDown className={`w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    )}
                  </div>
                </div>

                {/* Expanded Content - Status Stepper */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className={`border-t p-5 ${isDark ? 'border-dark-border' : 'border-slate-100'}`}>
                        {/* Ticket Details */}
                        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 rounded-lg ${isDark ? 'bg-dark-elevated' : 'bg-slate-50'}`}>
                          <div>
                            <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Asset ID</p>
                            <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{ticket.assetId}</p>
                          </div>
                          <div>
                            <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Call Type</p>
                            <p className={`text-sm font-medium capitalize ${isDark ? 'text-white' : 'text-slate-800'}`}>{ticket.callType}</p>
                          </div>
                          <div>
                            <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Location</p>
                            <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{ticket.location}</p>
                          </div>
                          <div>
                            <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Assigned To</p>
                            <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                              {ticket.assignedTo?.name || 'Pending Assignment'}
                            </p>
                          </div>
                        </div>

                        {/* Status Stepper */}
                        <div>
                          <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Ticket Progress</h4>
                          <StatusStepper ticket={ticket} showActionLogs={true} />
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
    </div>
  );

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
          {activeView === 'raise' && renderRaiseQuery()}
          {activeView === 'mytickets' && renderMyTickets()}
        </motion.div>
      </AnimatePresence>
      
      {/* AI Chatbot */}
      <Chatbot />
    </>
  );
}
