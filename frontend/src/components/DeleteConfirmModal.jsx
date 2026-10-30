import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export function DeleteConfirmModal({ isOpen, item, onClose, onConfirm, isDeleting }) {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md rounded-3xl bg-white dark:bg-navy-900 border border-cream-200 dark:border-navy-700 p-6 shadow-2xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-4">
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-cream-900 dark:text-white">
              Delete {item.item_type === 'movie' ? 'Movie' : 'Book'}?
            </h3>
            <p className="text-xs text-cream-800/60 dark:text-slate-400">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <p className="text-sm text-cream-800 dark:text-slate-300 mb-6 bg-cream-50 dark:bg-navy-950 p-3.5 rounded-xl border border-cream-100 dark:border-navy-800">
          Are you sure you want to remove <span className="font-bold text-cream-900 dark:text-white">"{item.title}"</span> from your personal library?
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-cream-800 dark:text-slate-300 hover:bg-cream-100 dark:hover:bg-navy-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {isDeleting ? 'Deleting...' : 'Confirm Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
