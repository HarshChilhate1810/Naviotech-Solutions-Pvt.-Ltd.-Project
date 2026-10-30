import React from 'react';
import { Library, Heart, ShieldCheck, Database, Layers } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-cream-200/80 dark:border-navy-850 bg-cream-100/50 dark:bg-navy-950/70 py-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cream-800/70 dark:text-slate-400">
          
          <div className="flex items-center gap-2">
            <Library className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="font-semibold text-cream-900 dark:text-slate-200">BiblioBox</span>
            <span>— Personal Movie & Book Library</span>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <span className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-blue-500" />
              PostgreSQL & SQLAlchemy
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-emerald-500" />
              Python FastAPI
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              Argon2id & JWT
            </span>
          </div>

          <div className="text-center sm:text-right">
            <span>Crafted with precision & care</span>
          </div>

        </div>
      </div>
    </footer>
  );
}
