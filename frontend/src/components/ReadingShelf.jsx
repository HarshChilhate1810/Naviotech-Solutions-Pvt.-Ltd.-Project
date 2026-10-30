import React from 'react';
import { BookOpen, ArrowRight, Sparkles } from 'lucide-react';

export function ReadingShelf({ books = [], onOpenReader, onBrowseBooks }) {
  if (!books || books.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-cream-300 dark:border-navy-800 p-8 text-center bg-cream-50/50 dark:bg-navy-950/40">
        <BookOpen className="w-8 h-8 text-cream-400 dark:text-slate-600 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-cream-900 dark:text-slate-200">
          No books currently in progress
        </h4>
        <p className="text-xs text-cream-800/60 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          Pick a book from your collection to start reading with realistic page-turning.
        </p>
        <button
          onClick={onBrowseBooks}
          className="mt-4 px-4 py-1.5 rounded-xl bg-amber-600/10 hover:bg-amber-600 text-amber-700 dark:text-amber-300 hover:text-white text-xs font-semibold border border-amber-500/20 transition-all"
        >
          Explore Books
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {books.map((book) => {
        const details = book.book_details || {};
        const currentPage = details.current_page || 1;
        const totalPages = details.total_pages || 100;
        const progress = Math.min(100, Math.round((currentPage / totalPages) * 100));

        return (
          <div
            key={book.id}
            className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-navy-900 border border-cream-200/80 dark:border-navy-800 shadow-xs hover:shadow-md transition-all group"
          >
            {/* Book Cover Thumbnail */}
            <div className="relative w-16 h-24 rounded-lg overflow-hidden shrink-0 shadow-sm bg-cream-200 dark:bg-navy-950">
              <img
                src={book.cover_image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80'}
                alt={book.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>

            {/* Info and Progress */}
            <div className="flex-1 min-w-0">
              <h4 className="font-display font-bold text-sm text-cream-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {book.title}
              </h4>
              <p className="text-xs text-cream-800/60 dark:text-slate-400 truncate mt-0.5">
                {details.author || 'Unknown Author'}
              </p>

              {/* Progress bar and page stats */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] mb-1 font-mono text-cream-800/70 dark:text-slate-400">
                  <span>Page {currentPage} of {totalPages}</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{progress}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-cream-200 dark:bg-navy-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Resume Button */}
              <div className="mt-3">
                <button
                  onClick={() => onOpenReader(book)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Resume Reading
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
