import React from 'react';
import { Search, Filter, X, ArrowUpDown, Star, Heart, BookOpen, Film, RotateCcw } from 'lucide-react';

export function FilterBar({
  search,
  onSearchChange,
  itemType,
  onItemTypeChange,
  genre,
  onGenreChange,
  rating,
  onRatingChange,
  isFavorite,
  onFavoriteChange,
  readingStatus,
  onReadingStatusChange,
  sortBy,
  onSortChange,
  onClearFilters,
  hasActiveFilters,
  availableGenres = [],
  showTypeFilter = true,
  showReadingFilter = true,
}) {
  return (
    <div className="bg-white dark:bg-navy-900 border border-cream-200/50 dark:border-navy-800/50 rounded-xl p-4 mb-6 transition-colors">
      
      {/* Top Row: Search and Sort */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-cream-800/50 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by title, author, director..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-cream-50 dark:bg-navy-950 border border-cream-200 dark:border-navy-700 text-sm text-cream-900 dark:text-slate-100 placeholder:text-cream-800/40 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-cream-800/40 dark:text-slate-400 hover:text-cream-900 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-52">
            <ArrowUpDown className="w-4 h-4 text-cream-800/50 dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-cream-50 dark:bg-navy-950 border border-cream-200 dark:border-navy-700 text-sm text-cream-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all appearance-none cursor-pointer"
            >
              <option value="recently_added">Recently Added</option>
              <option value="title_asc">Title (A – Z)</option>
              <option value="title_desc">Title (Z – A)</option>
              <option value="rating_high">Highest Rated</option>
              <option value="rating_low">Lowest Rated</option>
              <option value="year_newest">Newest Year</option>
              <option value="year_oldest">Oldest Year</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>

      </div>

      {/* Filter Row: Pills / Dropdowns */}
      <div className="mt-3 pt-3 border-t border-cream-100 dark:border-navy-800 flex items-center gap-2 flex-wrap">
        
        {/* Type Filter */}
        {showTypeFilter && (
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-cream-100 dark:bg-navy-950 border border-cream-200 dark:border-navy-800">
            <button
              onClick={() => onItemTypeChange('')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                !itemType
                  ? 'bg-white dark:bg-navy-800 text-cream-900 dark:text-white shadow-xs font-semibold'
                  : 'text-cream-800/70 dark:text-slate-400 hover:text-cream-900 dark:hover:text-white'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => onItemTypeChange('movie')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                itemType === 'movie'
                  ? 'bg-amber-600 text-white shadow-xs font-semibold'
                  : 'text-cream-800/70 dark:text-slate-400 hover:text-cream-900 dark:hover:text-white'
              }`}
            >
              <Film className="w-3 h-3" />
              Movies
            </button>
            <button
              onClick={() => onItemTypeChange('book')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                itemType === 'book'
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'text-cream-800/70 dark:text-slate-400 hover:text-cream-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3 h-3" />
              Books
            </button>
          </div>
        )}

        {/* Genre Selector */}
        <select
          value={genre}
          onChange={(e) => onGenreChange(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-cream-50 dark:bg-navy-950 border border-cream-200 dark:border-navy-700 text-xs text-cream-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
        >
          <option value="">All Genres</option>
          {availableGenres.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
          {/* Default fallback genres if list is loading */}
          {availableGenres.length === 0 && (
            <>
              <option value="Sci-Fi">Sci-Fi</option>
              <option value="Mystery">Mystery</option>
              <option value="Drama">Drama</option>
              <option value="Classic">Classic</option>
              <option value="Fantasy">Fantasy</option>
              <option value="Thriller">Thriller</option>
              <option value="Adventure">Adventure</option>
            </>
          )}
        </select>

        {/* Rating Filter */}
        <select
          value={rating}
          onChange={(e) => onRatingChange(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-cream-50 dark:bg-navy-950 border border-cream-200 dark:border-navy-700 text-xs text-cream-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
        >
          <option value="">All Ratings</option>
          <option value="5">★★★★★ (5 Stars)</option>
          <option value="4">★★★★☆ (4+ Stars)</option>
          <option value="3">★★★☆☆ (3+ Stars)</option>
        </select>

        {/* Reading Status Filter (shown when viewing books) */}
        {showReadingFilter && (
          <select
            value={readingStatus}
            onChange={(e) => onReadingStatusChange(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-cream-50 dark:bg-navy-950 border border-cream-200 dark:border-navy-700 text-xs text-cream-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
          >
            <option value="">All Reading Statuses</option>
            <option value="currently_reading">Currently Reading</option>
            <option value="want_to_read">Want to Read</option>
            <option value="completed">Completed</option>
          </select>
        )}

        {/* Favorites Only Toggle */}
        <button
          onClick={() => onFavoriteChange(isFavorite ? '' : 'true')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            isFavorite
              ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
              : 'bg-cream-50 dark:bg-navy-950 text-cream-800 dark:text-slate-300 border-cream-200 dark:border-navy-700 hover:border-rose-400'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : 'text-rose-500'}`} />
          Favorites Only
        </button>

      </div>
    </div>
  );
}
