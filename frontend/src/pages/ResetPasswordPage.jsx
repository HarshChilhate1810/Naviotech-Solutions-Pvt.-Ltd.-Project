import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, KeyRound, CheckCircle2, ArrowRight } from 'lucide-react';
import { authService } from '../services/authService';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('A valid reset token is required');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await authService.resetPassword(email.trim(), token.trim(), newPassword);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to reset password. The reset token may be expired or invalid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-navy-900 border border-cream-200 dark:border-navy-800 p-6 sm:p-8 shadow-xl animate-in zoom-in-95 duration-200">
      
      <div className="mb-6">
        <h2 className="font-display font-bold text-xl text-cream-900 dark:text-white">
          Choose a New Password
        </h2>
        <p className="text-xs text-cream-800/60 dark:text-slate-400 mt-1">
          Enter your verification token and secure new password
        </p>
      </div>

      {success ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs">
            <div className="flex items-center gap-2 font-bold mb-1 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              Password Successfully Updated
            </div>
            Your account password has been changed with Argon2id encryption. All older sessions have been safely terminated.
          </div>

          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold tracking-wide uppercase shadow-md shadow-amber-600/30 transition-all flex items-center justify-center gap-2"
          >
            <span>Proceed to Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
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
              Account Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 dark:bg-navy-950 border border-cream-200 dark:border-navy-700 text-sm text-cream-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-cream-800/70 dark:text-slate-300 mb-1.5">
              Reset Token
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste token received in email or demo helper"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cream-50 dark:bg-navy-950 border border-cream-200 dark:border-navy-700 text-xs font-mono text-cream-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-cream-800/70 dark:text-slate-300 mb-1.5">
              New Password (Min. 6 chars)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cream-50 dark:bg-navy-950 border border-cream-200 dark:border-navy-700 text-sm text-cream-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-cream-800/70 dark:text-slate-300 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cream-50 dark:bg-navy-950 border border-cream-200 dark:border-navy-700 text-sm text-cream-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold tracking-wide uppercase shadow-md shadow-amber-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Updating Password...' : 'Save New Password'}
          </button>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="text-xs font-medium text-cream-800/70 dark:text-slate-400 hover:text-cream-900 dark:hover:text-white"
            >
              Cancel and Return to Sign In
            </Link>
          </div>

        </form>
      )}

    </div>
  );
}
