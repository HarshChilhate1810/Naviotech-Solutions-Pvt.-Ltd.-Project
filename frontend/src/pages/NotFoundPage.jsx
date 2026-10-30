import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
        <Compass className="w-8 h-8" />
      </div>
      <h1 className="font-display font-bold text-3xl text-cream-900 dark:text-white mb-2">
        404 — Chapter Not Found
      </h1>
      <p className="text-sm text-cream-800/60 dark:text-slate-400 max-w-sm mb-6">
        The page you are looking for has been moved, shelved elsewhere, or never existed in this library.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Dashboard
      </Link>
    </div>
  );
}
