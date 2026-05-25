import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Lock, Mail, ArrowLeft, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';
import Swal from 'sweetalert2';
import usePageTitle from '../hooks/usePageTitle';

export const LoginPage: React.FC = () => {
  usePageTitle('Sign In');
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated && user) {
      const destination = user.role === 'MANAGER' ? '/manager/dashboard' : '/agent/dashboard';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: loggedUser } = response.data;

      login(token, loggedUser);

      // Navigate to corresponding dashboard
      const destination = loggedUser.role === 'MANAGER' ? '/manager/dashboard' : '/agent/dashboard';
      navigate(destination, { replace: true });
    } catch (err: any) {
      console.error('Login submission error:', err);
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Login failed. Please try again.');
      } else {
        setError('Connection to backend failed. Please check if backend is running.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: 'Contact your Admin / Manager',
      text: 'Ask them to reset your password.',
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      background: 'transparent',
      iconColor: '#a78bfa',
      customClass: {
        popup: 'swal-glass-toast',
      },
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Back link */}
      <Link
        to="/"
        className="absolute top-4 left-4 flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 bg-white border border-slate-200 shadow-sm py-1.5 px-3 rounded-lg z-20 transition-all duration-150 min-h-[36px]"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to Home
      </Link>

      {/* 1. Left Side: Brand Panel (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy-950 text-white relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-25"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-brand-purple/20 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2"></div>

        <Link to="/" className="flex items-center space-x-2.5 group z-10">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-purple via-indigo-600 to-purple-500 flex items-center justify-center font-bold text-white shadow-md shadow-brand-purple/25 ring-2 ring-white/10 animate-logo-pulse animate-gradient-shift group-hover:scale-105 transition-transform duration-200">
              <svg className="w-5 h-5 text-white group-hover:animate-phone-ring" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.5 5.5A4 4 0 0 1 12 4a4 4 0 0 1 4 4c0 3-8 3-8 6a4 4 0 0 0 4 4 4 4 0 0 0 3.5-1.5" />
                <circle cx="8.5" cy="5.5" r="1.5" fill="currentColor" />
                <circle cx="15.5" cy="18.5" r="1.5" fill="currentColor" />
              </svg>
            </div>
            <span className="absolute -top-1.5 -right-1.5 text-[7px] font-black uppercase tracking-wide bg-gradient-to-r from-pink-500 to-rose-500 text-white px-1.5 py-0.5 rounded-full leading-none shadow-sm">beta</span>
          </div>
          <div className="flex items-center">
            <span className="font-extrabold text-lg text-white tracking-tight group-hover:text-brand-purple-light transition-colors duration-200">
              SatikFlow
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest text-brand-purple-light bg-brand-purple/25 border border-brand-purple-light/25 px-1.5 py-0.5 rounded-[4px] ml-1.5">
              CRM
            </span>
          </div>
        </Link>

        {/* Benefits text */}
        <div className="z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center space-x-2 bg-brand-purple/25 border border-brand-purple/40 text-brand-purple-light text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Modern Flow</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Streamline your calling team operations.
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Assign custom spreadsheet data, follow-up calls due, track converted prospects, and inspect live reports with zero setup time.
          </p>

          {/* Mini Dashboard Illustration */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-[12px] border border-slate-800 p-4 space-y-3 shadow-2xl">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold uppercase tracking-wider">Recent Activity Logs</span>
              <span className="text-emerald-400 flex items-center"><ShieldCheck className="w-4 h-4 mr-1" /> Secured</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-950/40 rounded-lg border border-slate-850 flex justify-between">
                <span className="text-slate-300">Team Anjali logged call callback</span>
                <span className="text-slate-500">2 mins ago</span>
              </div>
              <div className="p-2.5 bg-slate-950/40 rounded-lg border border-slate-850 flex justify-between">
                <span className="text-slate-300">Manager uploaded 120 Leads</span>
                <span className="text-slate-500">10 mins ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="z-10 text-xs text-slate-500 font-mono">
          © {new Date().getFullYear()} SatikFlow CRM. All rights reserved. Designed with ❤️ in India.
        </div>
      </div>

      {/* 2. Right Side: Login Card (Mobile/Desktop) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md bg-white rounded-[12px] border border-slate-200 shadow-xl p-8 space-y-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-slate-900">Account Sign In</h3>
            <p className="text-sm text-slate-500">Please enter your credentials to open the workspace.</p>
          </div>



          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-[8px] p-3 text-xs flex items-center space-x-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="pl-10 w-full rounded-[8px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple bg-white text-slate-900 text-sm transition-all duration-150 h-11"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Password
                </label>
                <span onClick={handleForgotPassword} className="text-xs text-brand-purple hover:underline cursor-pointer">
                  Forgot Password?
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 w-full rounded-[8px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple bg-white text-slate-900 text-sm transition-all duration-150 h-11"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-purple hover:bg-brand-purple-hover text-white text-sm font-semibold rounded-[8px] transition-all duration-150 shadow-md shadow-brand-purple/20 disabled:opacity-50 h-11 flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Sign In to Workspace'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
