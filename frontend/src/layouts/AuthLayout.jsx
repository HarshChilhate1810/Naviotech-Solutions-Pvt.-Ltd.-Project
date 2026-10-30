import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { BiblioBoxLogo } from '../components/BiblioBoxLogo';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function AuthLayout() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-cream-50 dark:bg-navy-950 text-cream-900 dark:text-slate-100 transition-colors duration-200 relative overflow-hidden">
      
      {/* Background ambient lighting blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      {/* Top Bar Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white dark:bg-navy-900 border border-cream-200 dark:border-navy-800 text-cream-800 dark:text-slate-300 hover:bg-cream-100 dark:hover:bg-navy-800 transition-colors shadow-xs"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-navy-800" />}
        </button>
      </div>

      {/* Header Logo */}
      <div className="mb-6 flex flex-col items-center text-center">
        <Link to="/" className="flex flex-col items-center gap-2 group mb-2">
          <BiblioBoxLogo className="w-16 h-16" showText={true} textClassName="text-2xl" />
        </Link>
        <p className="text-xs text-cream-800/60 dark:text-slate-400 max-w-xs">
          Your personal cloud-synchronized movie & book sanctuary
        </p>
      </div>

      {/* Auth Card Container */}
      <div className="w-full max-w-md relative z-10">
        <Outlet />
      </div>

    </div>
  );
}
