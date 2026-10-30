import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Smartphone, KeyRound, ArrowRight, ShieldCheck, CheckCircle2, RotateCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login, loginWithMobileOtp, requestMobileOtp } = useAuth();
  const navigate = useNavigate();

  // Tab: 'email' | 'mobile'
  const [loginMethod, setLoginMethod] = useState('email');

  // Email form state
  const [email, setEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');

  // Mobile form state
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileAuthMode, setMobileAuthMode] = useState('otp'); // 'otp' | 'password'
  const [mobilePassword, setMobilePassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtp, setDemoOtp] = useState('');
  const [smsDelivered, setSmsDelivered] = useState(false);
  const [smsProvider, setSmsProvider] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Resend OTP countdown timer
  useEffect(() => {
    let timer = null;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCooldown]);

  // Clean raw digits for mobile
  const getCleanMobile = () => {
    return mobileNumber.replace(/\D/g, '');
  };

  // Submit Email Login
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email || !emailPassword) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(email.trim(), emailPassword);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  // Request Mobile OTP
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    const clean = getCleanMobile();
    if (clean.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setInfoMessage('');
      const res = await requestMobileOtp(clean);
      setOtpSent(true);
      setDemoOtp(res.demo_otp || '');
      setSmsDelivered(Boolean(res.sms_delivered));
      setSmsProvider(res.sms_provider || '');
      setResendCooldown(45);
      if (res.sms_delivered) {
        setInfoMessage(`📱 Real SMS verification code dispatched to +91 ${clean.slice(-10)} via ${res.sms_provider?.toUpperCase()}! Check your phone.`);
      } else {
        setInfoMessage(`Verification code generated for +91 ${clean.slice(-10)}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Verify Mobile OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const clean = getCleanMobile();
    if (!otp.trim()) {
      setError('Please enter the 6-digit OTP code');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await loginWithMobileOtp(clean, otp.trim());
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Mobile Password Login
  const handleMobilePasswordSubmit = async (e) => {
    e.preventDefault();
    const clean = getCleanMobile();
    if (clean.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!mobilePassword) {
      setError('Please enter your account password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(clean, mobilePassword);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid mobile number or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-navy-900 border border-cream-200 dark:border-navy-800 p-6 sm:p-8 shadow-xl animate-in zoom-in-95 duration-200">
      
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-display font-bold text-xl text-cream-900 dark:text-white">
          Sign In to Your Library
        </h2>
        <p className="text-xs text-cream-800/60 dark:text-slate-400 mt-1">
          Access your cloud-saved books, movies, ratings, and reading progress
        </p>
      </div>

      {/* Login Method Switcher Tabs */}
      <div className="flex rounded-2xl bg-cream-100 dark:bg-navy-950 p-1 mb-5 border border-cream-200/80 dark:border-navy-800">
        <button
          type="button"
          onClick={() => {
            setLoginMethod('email');
            setError('');
            setInfoMessage('');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            loginMethod === 'email'
              ? 'bg-white dark:bg-navy-800 text-amber-700 dark:text-amber-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Mail className="w-4 h-4" />
          Email Login
        </button>

        <button
          type="button"
          onClick={() => {
            setLoginMethod('mobile');
            setError('');
            setInfoMessage('');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            loginMethod === 'mobile'
              ? 'bg-white dark:bg-navy-800 text-amber-700 dark:text-amber-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          Mobile Number
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium animate-in fade-in">
          {error}
        </div>
      )}

      {/* Info / Success Message */}
      {infoMessage && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{infoMessage}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          EMAIL LOGIN FORM
      ───────────────────────────────────────────────────────────── */}
      {loginMethod === 'email' && (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          
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
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cream-50 dark:bg-navy-950 border border-cream-200 dark:border-navy-700 text-sm text-cream-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold tracking-wide uppercase shadow-md shadow-amber-600/30 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Signing In...' : 'Sign In with Email'}
          </button>
        </form>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MOBILE NUMBER LOGIN FORM
      ───────────────────────────────────────────────────────────── */}
      {loginMethod === 'mobile' && (
        <div className="space-y-4">
          
          {/* Mobile Auth Sub-mode Switcher */}
          <div className="flex items-center justify-between text-xs pb-1 border-b border-cream-100 dark:border-navy-800">
            <span className="font-semibold text-cream-800/80 dark:text-slate-300">
              Mobile Verification Mode:
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => { setMobileAuthMode('otp'); setError(''); }}
                className={`font-semibold transition-colors ${
                  mobileAuthMode === 'otp' ? 'text-amber-600 dark:text-amber-400 underline' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                Instant OTP
              </button>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <button
                type="button"
                onClick={() => { setMobileAuthMode('password'); setError(''); }}
                className={`font-semibold transition-colors ${
                  mobileAuthMode === 'password' ? 'text-amber-600 dark:text-amber-400 underline' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                Password
              </button>
            </div>
          </div>

          {/* Mobile Number Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-cream-800/70 dark:text-slate-300 mb-1.5">
              Mobile Number
            </label>
            <div className="relative flex">
              <span className="inline-flex items-center px-3 rounded-l-xl bg-cream-100 dark:bg-navy-800 border border-r-0 border-cream-200 dark:border-navy-700 text-xs font-bold text-cream-800 dark:text-slate-200">
                +91
              </span>
              <input
                type="tel"
                disabled={otpSent && mobileAuthMode === 'otp'}
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="98765 43210"
                maxLength={15}
                className="w-full px-3.5 py-2.5 rounded-r-xl bg-cream-50 dark:bg-navy-950 border border-cream-200 dark:border-navy-700 text-sm font-mono tracking-wider text-cream-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 disabled:opacity-75 transition-all"
              />
            </div>
          </div>

          {/* MODE 1: OTP VERIFICATION */}
          {mobileAuthMode === 'otp' && (
            <>
              {!otpSent ? (
                /* Step 1: Request OTP */
                <div>
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={loading || getCleanMobile().length < 10}
                    className="w-full mt-2 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold tracking-wide uppercase shadow-md shadow-amber-600/30 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Smartphone className="w-4 h-4" />
                    {loading ? 'Sending Verification Code...' : 'Send OTP Code'}
                  </button>
                  <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 mt-2">
                    Real SMS delivered to mobile phone (Fast2SMS / Twilio). Valid for 5 mins.
                  </p>
                </div>
              ) : (
                /* Step 2: Enter & Verify OTP */
                <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in">
                  
                  {/* Live SMS Delivery Confirmation */}
                  {smsDelivered && (
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="flex-1 text-xs">
                        <div className="font-bold text-emerald-800 dark:text-emerald-300">
                          Real SMS Delivered to Mobile Phone
                        </div>
                        <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 mt-0.5 leading-relaxed">
                          OTP verification code sent via SMS to <strong>+91 {getCleanMobile().slice(-10)}</strong> via <strong>{smsProvider?.toUpperCase()}</strong> Gateway. Please check your SMS inbox.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Dev/Sandbox OTP Helper Banner */}
                  {!smsDelivered && demoOtp && (
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
                          <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span>Sandbox Test Code: <strong className="font-mono text-sm tracking-widest">{demoOtp}</strong></span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setOtp(demoOtp)}
                          className="px-2.5 py-1 rounded-lg bg-amber-600 text-white text-[10px] font-bold shadow-xs hover:bg-amber-500 transition-colors"
                        >
                          Auto Fill
                        </button>
                      </div>
                      <div className="pt-2 border-t border-amber-500/20 text-[11px] text-amber-900/70 dark:text-amber-300/70 flex items-start gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <span>
                          <strong>Real SMS on Phone:</strong> Configure <code className="font-mono text-[10px] bg-amber-200/50 dark:bg-amber-900/40 px-1 py-0.5 rounded">FAST2SMS_API_KEY</code> or Twilio in <code className="font-mono text-[10px] bg-amber-200/50 dark:bg-amber-900/40 px-1 py-0.5 rounded">backend/.env</code> to receive live SMS on your mobile phone.
                        </span>
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-cream-800/70 dark:text-slate-300">
                        Enter 6-Digit OTP
                      </label>
                      <button
                        type="button"
                        onClick={() => { setOtpSent(false); setOtp(''); }}
                        className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline"
                      >
                        Change Number
                      </button>
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      autoFocus
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      className="w-full py-2.5 text-center font-mono text-xl tracking-[0.5em] rounded-xl bg-cream-50 dark:bg-navy-950 border border-cream-200 dark:border-navy-700 text-cream-900 dark:text-white placeholder:tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                    />
                  </div>

                  {/* Resend button */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Didn't receive code?</span>
                    {resendCooldown > 0 ? (
                      <span className="font-mono text-slate-400">Resend in {resendCooldown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRequestOtp}
                        disabled={loading}
                        className="text-amber-600 dark:text-amber-400 font-semibold hover:underline flex items-center gap-1"
                      >
                        <RotateCw className="w-3 h-3" />
                        Resend Code
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold tracking-wide uppercase shadow-md shadow-amber-600/30 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {loading ? 'Verifying...' : 'Verify & Sign In'}
                  </button>
                </form>
              )}
            </>
          )}

          {/* MODE 2: MOBILE PASSWORD LOGIN */}
          {mobileAuthMode === 'password' && (
            <form onSubmit={handleMobilePasswordSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-cream-800/70 dark:text-slate-300">
                    Account Password
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
                    value={mobilePassword}
                    onChange={(e) => setMobilePassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cream-50 dark:bg-navy-950 border border-cream-200 dark:border-navy-700 text-sm text-cream-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold tracking-wide uppercase shadow-md shadow-amber-600/30 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                {loading ? 'Signing In...' : 'Sign In with Mobile'}
              </button>
            </form>
          )}

        </div>
      )}

      {/* Footer link to sign up */}
      <div className="mt-6 pt-5 border-t border-cream-100 dark:border-navy-800 text-center">
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
