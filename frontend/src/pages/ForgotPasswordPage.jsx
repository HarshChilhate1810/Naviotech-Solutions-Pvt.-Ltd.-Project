import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle2, KeyRound } from 'lucide-react';
import { authService } from '../services/authService';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [demoToken, setDemoToken] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your registered email address');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await authService.forgotPassword(email);
      setMessage(data.message);
      if (data.demo_reset_token) {
        setDemoToken(data.demo_reset_token);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit reset request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-navy-900 border border-cream-200 dark:border-navy-800 p-6 sm:p-8 shadow-xl animate-in zoom-in-95 duration-200">
      
      <div className="mb-6">
        <h2 className="font-display font-bold text-xl text-cream-900 dark:text-white">
          Reset Your Password
        </h2>
        <p className="text-xs text-cream-800/60 dark:text-slate-400 mt-1">
          Enter your account email to receive secure recovery instructions
        </p>
      </div>

      {message ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs">
            <div className="flex items-center gap-2 font-bold mb-1 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              Reset Instructions Sent
            </div>
            {message}
          </div>

          {demoToken && (
            <div className="p-4 rounded-2xl bg-cream-100 dark:bg-navy-950 border border-cream-200 dark:border-navy-800 space-y-2">
              <p className="text-xs font-semibold text-cream-900 dark:text-white flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                Quick Evaluation Token Generated
              </p>
              <p className="text-[11px] font-mono text-slate-500 break-all p-2 rounded bg-white dark:bg-navy-900 border border-cream-200 dark:border-navy-800">
                {demoToken}
              </p>
              <button
                onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(demoToken)}`)}
                className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-xs"
              >
                Proceed to Reset Password Form
              </button>
            </div>
          )}

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-cream-800/70 dark:text-slate-300 mb-1.5">
              Registered Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cream-50 dark:bg-navy-950 border border-cream-200 dark:border-navy-700 text-sm text-cream-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold tracking-wide uppercase shadow-md shadow-amber-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Submitting...' : 'Send Reset Instructions'}
          </button>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="text-xs font-medium text-cream-800/70 dark:text-slate-400 hover:text-cream-900 dark:hover:text-white flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>

        </form>
      )}

    </div>
  );
}
