import React from 'react';
import { 
  X, 
  Star, 
  Heart, 
  BookOpen, 
  Film, 
  Calendar, 
  User, 
  Edit3, 
  Trash2, 
  FileText,
  BookmarkCheck,
  CheckCircle2,
  Play,
  ExternalLink,
  Link2
} from 'lucide-react';

export function ItemDetailModal({ 
  item, 
  onClose, 
  onEdit, 
  onDelete, 
  onToggleFavorite, 
  onOpenReader,
  onWatchMovie
}) {
  if (!item) return null;


  const isBook = item.item_type === 'book';
  const bookDetails = item.book_details || {};
  const movieDetails = item.movie_details || {};

  const readingProgress = isBook && bookDetails.total_pages > 0
    ? Math.min(100, Math.round((bookDetails.current_page / bookDetails.total_pages) * 100))
    : 0;

  const formattedDate = new Date(item.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Dialog Box */}
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-navy-900 border border-cream-200 dark:border-navy-700 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-cream-100 dark:border-navy-800 bg-cream-50/50 dark:bg-navy-950/50">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
              {isBook ? <BookOpen className="w-3.5 h-3.5 text-emerald-500" /> : <Film className="w-3.5 h-3.5 text-amber-500" />}
              {isBook ? 'Book Record' : 'Movie Record'}
            </span>
            <span className="text-xs text-cream-800/50 dark:text-slate-400">
              Added {formattedDate}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite?.(item.id)}
              className={`p-2 rounded-xl transition-colors ${
                item.is_favorite
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-cream-800/60 dark:text-slate-400 hover:text-rose-500 hover:bg-cream-100 dark:hover:bg-navy-800'
              }`}
              title={item.is_favorite ? 'Remove favorite' : 'Mark as favorite'}
            >
              <Heart className={`w-4 h-4 ${item.is_favorite ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-cream-800/60 dark:text-slate-400 hover:text-cream-900 dark:hover:text-white hover:bg-cream-100 dark:hover:bg-navy-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Main Top Banner: Cover & Core Metadata */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            
            {/* Cover art image */}
            <div className="relative w-36 sm:w-44 aspect-[2/3] rounded-2xl overflow-hidden shrink-0 shadow-lg border border-cream-200 dark:border-navy-700 bg-cream-100 dark:bg-navy-950">
              <img
                src={item.cover_image_url || (isBook ? 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80' : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80')}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Title & Metadata details */}
            <div className="flex-1 min-w-0">
              <h2 className="font-display font-bold text-2xl text-cream-900 dark:text-white leading-tight">
                {item.title}
              </h2>

              <p className="text-sm text-cream-800/70 dark:text-slate-300 font-medium mt-1 flex items-center gap-1.5">
                <User className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                {isBook ? (bookDetails.author || 'Author Unknown') : (movieDetails.director ? `Directed by ${movieDetails.director}` : 'Director Unknown')}
              </p>

              {/* Tag Badges */}
              <div className="flex items-center gap-2 flex-wrap mt-3">
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-cream-100 dark:bg-navy-800 text-cream-800 dark:text-slate-200 border border-cream-200 dark:border-navy-700">
                  {item.genre}
                </span>

                {(movieDetails.release_year || bookDetails.publication_year) && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-cream-100 dark:bg-navy-800 text-cream-800 dark:text-slate-200 border border-cream-200 dark:border-navy-700">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {movieDetails.release_year || bookDetails.publication_year}
                  </span>
                )}
              </div>

              {/* Star Rating */}
              <div className="flex items-center gap-1.5 mt-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= item.rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-cream-300 dark:text-navy-700'
                    }`}
                  />
                ))}
                <span className="text-xs font-bold text-cream-900 dark:text-white ml-1">
                  {item.rating} / 5 Stars
                </span>
              </div>

              {/* Book Reading Status & Progress */}
              {isBook ? (
                <div className="mt-5 p-3.5 rounded-xl bg-cream-50 dark:bg-navy-950/70 border border-cream-200 dark:border-navy-800">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-cream-900 dark:text-white capitalize">
                      {bookDetails.reading_status ? bookDetails.reading_status.replace('_', ' ') : 'Want to Read'}
                    </span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {readingProgress}% (p. {bookDetails.current_page} of {bookDetails.total_pages})
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-cream-200 dark:bg-navy-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full"
                      style={{ width: `${readingProgress}%` }}
                    />
                  </div>

                  <div className="mt-3">
                    <button
                      onClick={() => onOpenReader?.(item)}
                      className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all"
                    >
                      <BookOpen className="w-4 h-4" />
                      Open in Interactive Book Reader
                    </button>
                  </div>
                </div>
              ) : (
                /* Movie Watch & Stream Options */
                <div className="mt-5 space-y-2.5">
                  <button
                    onClick={() => onWatchMovie?.(item)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/30 hover:shadow-lg transition-all"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Watch Movie in Theater Player
                  </button>

                  {movieDetails.video_url && (
                    <div className="p-2.5 rounded-xl bg-cream-100 dark:bg-navy-950/70 border border-cream-200 dark:border-navy-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                        <Link2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate text-slate-500 dark:text-slate-400 font-mono text-[11px]" title={movieDetails.video_url}>
                          {movieDetails.video_url}
                        </span>
                      </div>
                      <a
                        href={movieDetails.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline shrink-0"
                      >
                        <span>Open Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Description Section */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-cream-800/60 dark:text-slate-400 mb-2">
              Synopsis & Description
            </h4>
            <p className="text-sm text-cream-900/90 dark:text-slate-300 leading-relaxed bg-cream-50/50 dark:bg-navy-950/40 p-4 rounded-2xl border border-cream-100 dark:border-navy-800">
              {item.description || 'No description provided for this item.'}
            </p>
          </div>

          {/* Personal Notes Section */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-cream-800/60 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Personal Notes & Reflections
            </h4>
            <p className="text-sm italic text-cream-800/80 dark:text-slate-300 leading-relaxed bg-amber-50/40 dark:bg-amber-950/15 p-4 rounded-2xl border border-amber-200/50 dark:border-amber-900/30">
              {item.personal_notes || 'No personal notes yet. Click Edit to record your thoughts, quotes, or review!'}
            </p>
          </div>

        </div>

        {/* Modal Footer: Action Buttons */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-cream-100 dark:border-navy-800 bg-cream-50/50 dark:bg-navy-950/50">
          <button
            onClick={() => onDelete?.(item)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Item
          </button>

          <div className="flex items-center gap-2">
            {!isBook && (
              <button
                onClick={() => onWatchMovie?.(item)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Watch
              </button>
            )}
            <button
              onClick={() => onEdit?.(item)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cream-200/80 dark:bg-navy-800 hover:bg-cream-300 dark:hover:bg-navy-700 text-cream-900 dark:text-white text-xs font-semibold transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Details
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-cream-200 dark:bg-navy-800 hover:bg-cream-300 dark:hover:bg-navy-700 text-cream-900 dark:text-white text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>


      </div>
    </div>
  );
}
