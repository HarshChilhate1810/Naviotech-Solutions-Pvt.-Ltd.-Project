import React from 'react';
import { Star, Heart, BookOpen, Film, Clock, User, Calendar, ExternalLink, Play } from 'lucide-react';

export function ItemCard({ item, onClick, onToggleFavorite, onOpenReader, onWatchMovie }) {
  const isBook = item.item_type === 'book';

  const bookDetails = item.book_details;
  const movieDetails = item.movie_details;

  // Reading status badge color & label
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return { label: 'Completed', class: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20' };
      case 'currently_reading':
        return { label: 'Currently Reading', class: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/20 animate-pulse' };
      default:
        return { label: 'Want to Read', class: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/20' };
    }
  };

  const statusBadge = isBook && bookDetails?.reading_status ? getStatusBadge(bookDetails.reading_status) : null;

  // Reading progress percentage
  const readingProgress = isBook && bookDetails?.total_pages > 0
    ? Math.min(100, Math.round((bookDetails.current_page / bookDetails.total_pages) * 100))
    : 0;

  // Fallback poster background gradient if cover image is missing
  const defaultPoster = isBook
    ? 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'
    : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';

  return (
    <div
      onClick={() => onClick?.(item)}
      className="group relative flex flex-col rounded-xl bg-white dark:bg-navy-900 border border-cream-200/60 dark:border-navy-800/60 overflow-hidden hover:border-cream-300 dark:hover:border-navy-700 transition-all cursor-pointer"
    >
      {/* Cover / Poster Image Container (2:3 Aspect Ratio) */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-cream-200/40 dark:bg-navy-950">
        <img
          src={item.cover_image_url || defaultPoster}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultPoster;
          }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Top Badges: Item Type & Favorite Heart */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium backdrop-blur-sm bg-black/40 text-white/90">
            {isBook ? <BookOpen className="w-3 h-3 text-emerald-400" /> : <Film className="w-3 h-3 text-amber-400" />}
            {isBook ? 'Book' : 'Movie'}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.(item.id);
            }}
            className={`pointer-events-auto p-1.5 rounded-full backdrop-blur-sm transition-colors ${
              item.is_favorite
                ? 'bg-rose-500/80 text-white'
                : 'bg-black/30 text-white/70 hover:text-white'
            }`}
            title={item.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label="Toggle favorite"
          >
            <Heart className={`w-3.5 h-3.5 ${item.is_favorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Overlay bottom info inside image: Genre & Year */}
        <div className="absolute bottom-3 left-3 right-3 text-white pointer-events-none">
          <div className="flex items-center gap-2 text-xs text-white/85 mb-1">
            <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-sm text-[11px] font-medium">
              {item.genre}
            </span>
            {(movieDetails?.release_year || bookDetails?.publication_year) && (
              <span className="text-[11px] opacity-90">
                {movieDetails?.release_year || bookDetails?.publication_year}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Title */}
          <h3 className="font-sans font-semibold text-sm text-cream-900 dark:text-white line-clamp-1">
            {item.title}
          </h3>

          {/* Subtitle / Creator */}
          <p className="text-xs text-cream-800/60 dark:text-slate-400 mt-0.5 line-clamp-1 flex items-center gap-1">
            <User className="w-3 h-3 opacity-60" />
            {isBook
              ? bookDetails?.author || 'Unknown Author'
              : movieDetails?.director ? `Dir. ${movieDetails.director}` : 'Director Unspecified'}
          </p>

          {/* Star Rating display */}
          <div className="flex items-center gap-1 mt-2.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${
                  star <= item.rating
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-cream-300 dark:text-navy-700'
                }`}
              />
            ))}
            <span className="text-xs font-semibold text-cream-800/70 dark:text-slate-300 ml-1">
              {item.rating}.0
            </span>
          </div>

          {/* Book Reading Status & Progress Bar */}
          {isBook && bookDetails && (
            <div className="mt-3 pt-2.5 border-t border-cream-200/60 dark:border-navy-800">
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span className={`px-2 py-0.5 rounded-full border text-[10px] font-medium ${statusBadge.class}`}>
                  {statusBadge.label}
                </span>
                <span className="text-cream-800/60 dark:text-slate-400 font-mono">
                  p. {bookDetails.current_page} / {bookDetails.total_pages}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-cream-200 dark:bg-navy-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${readingProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Card Footer: Quick Actions */}
        <div className="pt-2 flex items-center justify-between border-t border-cream-100 dark:border-navy-800/60">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.(item);
            }}
            className="text-xs font-medium text-cream-800/70 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1 transition-colors"
          >
            Details
          </button>

          {isBook ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenReader?.(item);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600/10 hover:bg-emerald-600 text-emerald-700 dark:text-emerald-400 hover:text-white text-xs font-medium transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Read
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onWatchMovie?.(item);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Watch
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

