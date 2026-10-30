import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BiblioBoxLogo } from './BiblioBoxLogo';
import { 
  BookOpen, 
  Film, 
  LayoutDashboard, 
  Plus, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  LogOut, 
  User as UserIcon,
  Library,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export function Navbar({ onOpenAddModal }) {
  const { user, logout } = useAuth();
  const { theme, soundEnabled, toggleTheme, toggleSound } = useTheme();
  const location = useLocation();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [addDropdownOpen, setAddDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-cream-50/90 dark:bg-navy-950/90 border-b border-cream-200/50 dark:border-navy-800/50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center group">
          <BiblioBoxLogo className="w-8 h-8" showText={true} textClassName="text-lg" />
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-0.5">
          <Link
            to="/"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              isActive('/')
                ? 'bg-cream-200/80 dark:bg-navy-800 text-cream-900 dark:text-white'
                : 'text-cream-800/70 dark:text-slate-400 hover:text-cream-900 dark:hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </Link>
          <Link
            to="/movies"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              isActive('/movies')
                ? 'bg-cream-200/80 dark:bg-navy-800 text-cream-900 dark:text-white'
                : 'text-cream-800/70 dark:text-slate-400 hover:text-cream-900 dark:hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            Movies
          </Link>
          <Link
            to="/books"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              isActive('/books')
                ? 'bg-cream-200/80 dark:bg-navy-800 text-cream-900 dark:text-white'
                : 'text-cream-800/70 dark:text-slate-400 hover:text-cream-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Books
          </Link>
        </nav>

        {/* Action Controls & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick Add Button */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setAddDropdownOpen(!addDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {addDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setAddDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-navy-900 shadow-xl border border-cream-200 dark:border-navy-700 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <button
                      onClick={() => {
                        setAddDropdownOpen(false);
                        onOpenAddModal?.('movie');
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-cream-900 dark:text-slate-200 hover:bg-cream-100 dark:hover:bg-navy-800 flex items-center gap-2.5 transition-colors"
                    >
                      <Film className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      Add New Movie
                    </button>
                    <button
                      onClick={() => {
                        setAddDropdownOpen(false);
                        onOpenAddModal?.('book');
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-cream-900 dark:text-slate-200 hover:bg-cream-100 dark:hover:bg-navy-800 flex items-center gap-2.5 transition-colors"
                    >
                      <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Add New Book
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Page-turn audio enabled (click to mute)' : 'Page-turn audio muted (click to unmute)'}
            className="p-2 rounded-lg text-cream-700 dark:text-slate-300 hover:bg-cream-200/60 dark:hover:bg-navy-850 transition-colors"
            aria-label="Toggle sound"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to warm light theme' : 'Switch to dark navy theme'}
            className="p-2 rounded-lg text-cream-700 dark:text-slate-300 hover:bg-cream-200/60 dark:hover:bg-navy-850 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-navy-800 hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>

          {/* User Profile / Logout Dropdown */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full bg-cream-200/40 dark:bg-navy-850 border border-cream-200/60 dark:border-navy-700 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-amber-600 text-white text-[11px] font-semibold flex items-center justify-center uppercase">
                  {user.name ? user.name.charAt(0) : 'U'}
                </div>
                <span className="text-xs font-medium text-cream-900 dark:text-slate-200 max-w-[100px] truncate hidden sm:inline">
                  {user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-navy-900 shadow-xl border border-cream-200 dark:border-navy-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-cream-100 dark:border-navy-800">
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Signed In As</p>
                      <p className="text-sm font-medium text-cream-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-sm font-medium text-cream-800 dark:text-slate-200 hover:text-amber-600 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium shadow-sm transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}

        </div>
      </div>

      {/* Mobile navigation bar */}
      <div className="md:hidden flex items-center justify-around py-2 border-t border-cream-200/50 dark:border-navy-800/80 bg-cream-50/95 dark:bg-navy-950/95">
        <Link
          to="/"
          className={`flex flex-col items-center gap-0.5 text-xs ${
            isActive('/') ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>
        <Link
          to="/movies"
          className={`flex flex-col items-center gap-0.5 text-xs ${
            isActive('/movies') ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-slate-500'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Movies</span>
        </Link>
        <Link
          to="/books"
          className={`flex flex-col items-center gap-0.5 text-xs ${
            isActive('/books') ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-slate-500'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Books</span>
        </Link>
      </div>
    </header>
  );
}
