import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  // Demo user helper to test seamlessly
  const fillDemoUser = () => {
    setEmail('jane@example.com');
    setPassword('Password123!');
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-navy-900 border border-cream-200 dark:border-navy-800 p-6 sm:p-8 shadow-xl animate-in zoom-in-95 duration-200">
      
      <div className="mb-6">
        <h2 className="font-display font-bold text-xl text-cream-900 dark:text-white">
          Sign In to Your Library
        </h2>
        <p className="text-xs text-cream-800/60 dark:text-slate-400 mt-1">
          Access your cloud-saved books, movies, ratings, and reading progress
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium animate-in fade-in">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Email */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-cream-800/70 dark:text-slate-300 mb-1.5">
            Email Address
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

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-cream-800/70 dark:text-slate-300">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cream-50 dark:bg-navy-950 border border-cream-200 dark:border-navy-700 text-sm text-cream-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold tracking-wide uppercase shadow-md shadow-amber-600/30 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <LogIn className="w-4 h-4" />
          {loading ? 'Signing In...' : 'Sign In'}
        </button>

      </form>

      {/* Demo Credentials Quick-Fill button */}
      <div className="mt-5 pt-4 border-t border-cream-100 dark:border-navy-800">
        <button
          type="button"
          onClick={fillDemoUser}
          className="w-full py-2 px-3 rounded-xl bg-cream-100 dark:bg-navy-950 hover:bg-cream-200 dark:hover:bg-navy-850 text-cream-800 dark:text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Auto-fill Demo Credentials (jane@example.com)
        </button>
      </div>

      {/* Footer link to sign up */}
      <div className="mt-5 text-center">
        <p className="text-xs text-cream-800/70 dark:text-slate-400">
          Don't have an account yet?{' '}
          <Link
            to="/register"
            className="font-bold text-amber-600 dark:text-amber-400 hover:underline"
          >
            Create an Account
          </Link>
        </p>
      </div>

    </div>
  );
}
