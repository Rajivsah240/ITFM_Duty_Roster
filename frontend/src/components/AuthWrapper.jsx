import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  LogIn,
  UserPlus,
  Building2,
  User,
  BadgeCheck,
  Lock,
  AlertCircle,
  Mail,
  Phone,
} from 'lucide-react';

export default function AuthWrapper({ children }) {
  const { user, login, register, isLoading } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    department: '',
    phone: '',
    role: 'user',
  });
  const [error, setError] = useState('');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (user) {
    return children;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isLoginMode) {
        const result = await login(formData.email, formData.password);
        if (!result.success) {
          setError(result.error);
        } else {
          toast.success('Login successful! Redirecting...');
        }
      } else {
        if (!formData.name || !formData.email || !formData.password || !formData.department || !formData.role) {
          setError('Name, email, password, department, and role are required');
          setIsSubmitting(false);
          return;
        }
        const result = await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          department: formData.department,
          phone: formData.phone,
          role: formData.role,
        });
        if (!result.success) {
          setError(result.error);
        } else {
          toast.success('Registration successful! Welcome!');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-dark-bg dark:to-dark-card flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl shadow-lg shadow-blue-500/25 mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">ITFM System</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">IT Facilities Management</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl overflow-hidden">
          {/* Tab Header */}
          <div className="flex border-b border-slate-100 dark:border-dark-border">
            <button
              onClick={() => {
                setIsLoginMode(true);
                setError('');
              }}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${
                isLoginMode
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsLoginMode(false);
                setError('');
              }}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${
                !isLoginMode
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {!isLoginMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all bg-white dark:bg-dark-input dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Department Field */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Department
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        placeholder="IT Support"
className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all bg-white dark:bg-dark-input dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Phone (Optional)
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1234567890"
className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all bg-white dark:bg-dark-input dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Role Selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Register as
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: 'user' })}
                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                          formData.role === 'user'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/20 text-blue-500'
                            : 'border-slate-200 dark:border-dark-border hover:border-slate-300 dark:hover:border-dark-hover text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <User className="w-5 h-5" />
                        <span className="font-medium">User</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: 'engineer' })}
                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                          formData.role === 'engineer'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/20 text-blue-500'
                            : 'border-slate-200 dark:border-dark-border hover:border-slate-300 dark:hover:border-dark-hover text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <BadgeCheck className="w-5 h-5" />
                        <span className="font-medium">Engineer</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all bg-white dark:bg-dark-input dark:text-white"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all bg-white dark:bg-dark-input dark:text-white"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-medium py-2.5 rounded-lg transition-colors shadow-lg shadow-blue-500/25"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : isLoginMode ? (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Info Box */}
          <div className="px-6 pb-6">
            <div className="p-4 bg-slate-50 dark:bg-dark-elevated rounded-lg">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                {isLoginMode ? 'Default Admin Credentials:' : 'Registration Info:'}
              </p>
              <div className="text-xs text-slate-600 dark:text-slate-300">
                {isLoginMode ? (
                  <>
                    <p><span className="font-medium">Email:</span> admin@itfm.local</p>
                    <p><span className="font-medium">Password:</span> admin123</p>
                    {/* <p className="mt-2 text-slate-400 dark:text-slate-500">
                      Run `npm run seed` in backend to create admin user
                    </p> */}
                  </>
                ) : (
                  <p>Admin role account cannot be created without permission.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
