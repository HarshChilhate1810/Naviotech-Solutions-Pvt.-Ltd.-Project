import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ page, totalPages, totalRecords, pageSize, onPageChange }) {
  if (totalRecords === 0) return null;

  const startRecord = Math.min((page - 1) * pageSize + 1, totalRecords);
  const endRecord = Math.min(page * pageSize, totalRecords);

  // Generate page numbers array with ellipsis for clean navigation
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-8 border-t border-cream-200/80 dark:border-navy-800 text-sm">
      
      {/* Result Range Information */}
      <div className="text-xs text-cream-800/70 dark:text-slate-400">
        Showing <span className="font-semibold text-cream-900 dark:text-white">{startRecord}</span> –{' '}
        <span className="font-semibold text-cream-900 dark:text-white">{endRecord}</span> of{' '}
        <span className="font-semibold text-cream-900 dark:text-white">{totalRecords}</span> items
      </div>

      {/* Navigation Buttons and Page Numbers */}
      <div className="flex items-center gap-1.5">
        
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-cream-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-xs font-medium text-cream-900 dark:text-slate-200 hover:bg-cream-100 dark:hover:bg-navy-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="px-2 text-xs text-slate-400">
                  ...
                </span>
              );
            }
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-8 h-8 rounded-xl text-xs font-medium transition-all ${
                  page === p
                    ? 'bg-amber-600 text-white font-bold shadow-sm'
                    : 'text-cream-800 dark:text-slate-300 hover:bg-cream-100 dark:hover:bg-navy-800'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-cream-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-xs font-medium text-cream-900 dark:text-slate-200 hover:bg-cream-100 dark:hover:bg-navy-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}
