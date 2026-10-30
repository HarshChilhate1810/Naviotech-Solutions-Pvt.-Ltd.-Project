import React from 'react';

export function StatsCard({ title, value, subtitle, icon: Icon, colorClass, badgeText }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-navy-900 border border-cream-200/80 dark:border-navy-800 p-5 shadow-sm hover:shadow-md transition-all duration-200 group">
      
      {/* Background soft glow accent */}
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 group-hover:scale-125 transition-transform duration-300 pointer-events-none ${colorClass}`} />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider uppercase text-cream-800/60 dark:text-slate-400">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-sans tracking-tight text-cream-900 dark:text-white">
              {value}
            </span>
            {badgeText && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-cream-100 dark:bg-navy-800 text-cream-800 dark:text-slate-300">
                {badgeText}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-cream-800/50 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>

        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-sm ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
