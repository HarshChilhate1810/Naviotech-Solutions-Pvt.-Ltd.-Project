import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide your name');
      return;
    }
    if (!email.trim()) {
      setError('Please provide a valid email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await register(name.trim(), email.trim(), password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. This email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-navy-900 border border-cream-200 dark:border-navy-800 p-6 sm:p-8 shadow-xl animate-in zoom-in-95 duration-200">
      
      <div className="mb-6">
        <h2 className="font-display font-bold text-xl text-cream-900 dark:text-white">
          Create Your Private Library
        </h2>
        <p className="text-xs text-cream-800/60 dark:text-slate-400 mt-1">
          Start your personalized movie and book collection with cloud sync
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium animate-in fade-in">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-cream-800/70 dark:text-slate-300 mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jane Reader"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cream-50 dark:bg-navy-950 border border-cream-200 dark:border-navy-700 text-sm text-cream-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
            />
          </div>
        </div>

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
          <label className="block text-xs font-semibold uppercase tracking-wider text-cream-800/70 dark:text-slate-300 mb-1.5">
            Password (Min. 6 chars)
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cream-50 dark:bg-navy-950 border border-cream-200 dark:border-navy-700 text-sm text-cream-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-cream-800/70 dark:text-slate-300 mb-1.5">
            Confirm Password
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
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cream-50 dark:bg-navy-950 border border-cream-200 dark:border-navy-700 text-sm text-cream-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
            />
          </div>
        </div>

        {/* Security badge notice */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>Passwords secured with military-grade Argon2id hashing</span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold tracking-wide uppercase shadow-md shadow-amber-600/30 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <UserPlus className="w-4 h-4" />
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

      </form>

      {/* Footer link to login */}
      <div className="mt-6 text-center">
        <p className="text-xs text-cream-800/70 dark:text-slate-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-bold text-amber-600 dark:text-amber-400 hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>

    </div>
  );
}
