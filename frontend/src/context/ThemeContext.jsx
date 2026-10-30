import React, { createContext, useContext, useState, useEffect } from 'react';
import { preferencesService } from '../services/preferencesService';
import { useAuth } from './AuthContext';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('athenaeum_theme') || 'dark';
  });
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('athenaeum_sound');
    return saved !== null ? saved === 'true' : true;
  });

  // Apply class to HTML element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('athenaeum_theme', theme);
  }, [theme]);

  // Sync with PostgreSQL on authenticated login
  useEffect(() => {
    if (isAuthenticated) {
      preferencesService.getPreferences()
        .then((pref) => {
          if (pref.theme && pref.theme !== theme) {
            setTheme(pref.theme);
          }
          if (pref.page_turn_sound_enabled !== undefined) {
            setSoundEnabled(pref.page_turn_sound_enabled);
            localStorage.setItem('athenaeum_sound', String(pref.page_turn_sound_enabled));
          }
        })
        .catch(() => {
          // Keep local preferences if backend fetch fails
        });
    }
  }, [isAuthenticated]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (isAuthenticated) {
      preferencesService.updatePreferences(nextTheme, soundEnabled).catch(() => {});
    }
  };

  const toggleSound = () => {
    const nextSound = !soundEnabled;
    setSoundEnabled(nextSound);
    localStorage.setItem('athenaeum_sound', String(nextSound));
    if (isAuthenticated) {
      preferencesService.updatePreferences(theme, nextSound).catch(() => {});
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, soundEnabled, toggleTheme, toggleSound }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
