import React, { useState, useEffect } from 'react';
import { X, Star, Heart, BookOpen, Film, Image as ImageIcon, Sparkles, Check } from 'lucide-react';

const PRESET_COVERS = {
  movie: [
    { label: 'Interstellar', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80' },
    { label: 'Neon Sci-Fi', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80' },
    { label: 'Cinema Reel', url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80' },
    { label: 'Classic Noir', url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80' },
  ],
  book: [
    { label: 'Sherlock Holmes', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80' },
    { label: 'Classic Literature', url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80' },
    { label: 'Antique Leather', url: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=600&q=80' },
    { label: 'Library Tome', url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80' },
  ]
};

export function ItemFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  initialType = 'movie',
}) {
  if (!isOpen) return null;

  const isEditing = !!initialData;

  const [itemType, setItemType] = useState(initialData?.item_type || initialType);
  const [title, setTitle] = useState(initialData?.title || '');
  const [genre, setGenre] = useState(initialData?.genre || '');
  const [rating, setRating] = useState(initialData?.rating || 5);
  const [hoverRating, setHoverRating] = useState(0);
  const [description, setDescription] = useState(initialData?.description || '');
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.cover_image_url || '');
  const [isFavorite, setIsFavorite] = useState(initialData?.is_favorite || false);
  const [personalNotes, setPersonalNotes] = useState(initialData?.personal_notes || '');

  // Movie specific
  const [releaseYear, setReleaseYear] = useState(initialData?.movie_details?.release_year || new Date().getFullYear());
  const [director, setDirector] = useState(initialData?.movie_details?.director || '');
  const [videoUrl, setVideoUrl] = useState(initialData?.movie_details?.video_url || '');

  // Book specific
  const [author, setAuthor] = useState(initialData?.book_details?.author || '');
  const [publicationYear, setPublicationYear] = useState(initialData?.book_details?.publication_year || new Date().getFullYear());
  const [readingStatus, setReadingStatus] = useState(initialData?.book_details?.reading_status || 'want_to_read');
  const [currentPage, setCurrentPage] = useState(initialData?.book_details?.current_page || 1);
  const [totalPages, setTotalPages] = useState(initialData?.book_details?.total_pages || 250);
  const [sampleContent, setSampleContent] = useState(initialData?.book_details?.sample_content || '');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!genre.trim()) {
      setError('Genre is required');
      return;
    }

    setSubmitting(true);
    setError('');

    const payload = {
      item_type: itemType,
      title: title.trim(),
      genre: genre.trim(),
      rating: parseInt(rating, 10),
      description: description.trim() || null,
      cover_image_url: coverImageUrl.trim() || null,
      is_favorite: Boolean(isFavorite),
      personal_notes: personalNotes.trim() || null,
    };

    if (itemType === 'movie') {
      payload.movie_details = {
        release_year: releaseYear ? parseInt(releaseYear, 10) : null,
        director: director.trim() || null,
        video_url: videoUrl.trim() || null,
      };
    } else {

      payload.book_details = {
        author: author.trim() || null,
        publication_year: publicationYear ? parseInt(publicationYear, 10) : null,
        reading_status: readingStatus,
        current_page: parseInt(currentPage, 10) || 1,
        total_pages: parseInt(totalPages, 10) || 100,
        sample_content: sampleContent.trim() || null,
      };
    }

    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save item');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Dialog */}
      <div 
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-navy-900 border border-cream-200 dark:border-navy-700 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-cream-100 dark:border-navy-800 bg-cream-50/50 dark:bg-navy-950/50">
          <div>
            <h3 className="font-display font-bold text-lg text-cream-900 dark:text-white">
              {isEditing ? `Edit ${itemType === 'movie' ? 'Movie' : 'Book'}` : 'Add to Your Collection'}
            </h3>
            <p className="text-xs text-cream-800/60 dark:text-slate-400">
              {isEditing ? 'Update the details for this item' : 'Enter details to expand your personal library'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-cream-800/60 dark:text-slate-400 hover:text-cream-900 dark:hover:text-white hover:bg-cream-100 dark:hover:bg-navy-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Item Type Switcher (only when adding new) */}
          {!isEditing && (
            <div className="flex rounded-xl bg-cream-100 dark:bg-navy-950 p-1 border border-cream-200 dark:border-navy-800">
              <button
                type="button"
                onClick={() => setItemType('movie')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                  itemType === 'movie'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-cream-800/70 dark:text-slate-400 hover:text-cream-900 dark:hover:text-white'
                }`}
              >
                <Film className="w-4 h-4" />
                Movie
              </button>
              <button
                type="button"
                onClick={() => setItemType('book')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                  itemType === 'book'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-cream-800/70 dark:text-slate-400 hover:text-cream-900 dark:hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Book
              </button>
            </div>
          )}

          {/* Title & Genre */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-cream-800/70 dark:text-slate-300 mb-1.5">
                Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={itemType === 'movie' ? 'e.g. Interstellar' : 'e.g. The Hobbit'}
                className="w-full px-3.5 py-2 rounded-xl bg-cream-50 dark:bg-navy-950 border border-cream-200 dark:border-navy-700 text-sm text-cream-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-cream-800/70 dark:text-slate-300 mb-1.5">
                Genre *
              </label>
              <input
                type="text"
                required
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder={itemType === 'movie' ? 'e.g. Sci-Fi / Drama' : 'e.g. Fantasy / Adventure'}
                className="w-full px-3.5 py-2 rounded-xl bg-cream-50 dark:bg-navy-950 border border-cream-200 dark:border-navy-700 text-sm text-cream-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Conditional Movie Fields */}
          {itemType === 'movie' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-cream-800/70 dark:text-slate-300 mb-1.5">
                    Director
                  </label>
                  <input
                    type="text"
                    value={director}
                    onChange={(e) => setDirector(e.target.value)}
                    placeholder="e.g. Christopher Nolan"
                    className="w-full px-3.5 py-2 rounded-xl bg-cream-50 dark:bg-navy-950 border border-cream-200 dark:border-navy-700 text-sm text-cream-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-cream-800/70 dark:text-slate-300 mb-1.5">
                    Release Year
                  </label>
                  <input
                    type="number"
                    min="1880"
                    max="2100"
                    value={releaseYear}
                    onChange={(e) => setReleaseYear(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-cream-50 dark:bg-navy-950 border border-cream-200 dark:border-navy-700 text-sm text-cream-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Video Stream URL for Movie Player */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-cream-800/70 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Movie Stream / Video URL (Optional)</span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal">Plays in Theater Player</span>
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Direct .mp4/.webm video link, or YouTube/Vimeo embed"
                  className="w-full px-3.5 py-2 rounded-xl bg-cream-50 dark:bg-navy-950 border border-cream-200 dark:border-navy-700 text-sm text-cream-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />

                {/* Quick Video Presets */}
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] text-cream-800/60 dark:text-slate-400">Stream Presets:</span>
                  <button
                    type="button"
                    onClick={() => setVideoUrl('https://www.youtube.com/watch?v=zSWdZVtXT7E')}
                    className="px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-cream-100 dark:bg-navy-800 text-cream-800 dark:text-slate-300 hover:bg-amber-500/20 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                  >
                    Interstellar (YouTube)
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoUrl('https://www.youtube.com/watch?v=YoHD9XEInc0')}
                    className="px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-cream-100 dark:bg-navy-800 text-cream-800 dark:text-slate-300 hover:bg-amber-500/20 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                  >
                    Inception (YouTube)
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoUrl('https://www.youtube.com/watch?v=EXeTwQWrcwY')}
                    className="px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-cream-100 dark:bg-navy-800 text-cream-800 dark:text-slate-300 hover:bg-amber-500/20 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                  >
                    Dark Knight (YouTube)
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4')}
                    className="px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-cream-100 dark:bg-navy-800 text-cream-800 dark:text-slate-300 hover:bg-amber-500/20 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                  >
                    Tears of Steel (MP4)
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4')}
                    className="px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-cream-100 dark:bg-navy-800 text-cream-800 dark:text-slate-300 hover:bg-amber-500/20 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                  >
                    Big Buck Bunny (MP4)
                  </button>
                </div>
              </div>
            </div>
          ) : (

            /* Conditional Book Fields */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-cream-800/70 dark:text-slate-300 mb-1.5">
                    Author
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. J.R.R. Tolkien"
                    className="w-full px-3.5 py-2 rounded-xl bg-cream-50 dark:bg-navy-950 border border-cream-200 dark:border-navy-700 text-sm text-cream-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-cream-800/70 dark:text-slate-300 mb-1.5">
                    Publication Year
                  </label>
                  <input
                    type="number"
                    min="1000"
                    max="2100"
                    value={publicationYear}
                    onChange={(e) => setPublicationYear(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-cream-50 dark:bg-navy-950 border border-cream-200 dark:border-navy-700 text-sm text-cream-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-cream-800/70 dark:text-slate-300 mb-1.5">
                    Reading Status
                  </label>
                  <select
                    value={readingStatus}
                    onChange={(e) => setReadingStatus(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-cream-50 dark:bg-navy-950 border border-cream-200 dark:border-navy-700 text-sm text-cream-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 cursor-pointer"
                  >
                    <option value="want_to_read">Want to Read</option>
                    <option value="currently_reading">Currently Reading</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-cream-800/70 dark:text-slate-300 mb-1.5">
                    Current Page
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={currentPage}
                    onChange={(e) => setCurrentPage(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-cream-50 dark:bg-navy-950 border border-cream-200 dark:border-navy-700 text-sm text-cream-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-cream-800/70 dark:text-slate-300 mb-1.5">
                    Total Pages
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={totalPages}
                    onChange={(e) => setTotalPages(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-cream-50 dark:bg-navy-950 border border-cream-200 dark:border-navy-700 text-sm text-cream-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Sample Content for Reader */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-cream-800/70 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Interactive Reader Content (Optional text / excerpt)</span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal">Appears in Realistic Book Reader</span>
                </label>
                <textarea
                  rows={3}
                  value={sampleContent}
                  onChange={(e) => setSampleContent(e.target.value)}
                  placeholder="Paste story chapters, literary excerpts, or notes to read with physical page-turn animations..."
                  className="w-full px-3.5 py-2 rounded-xl bg-cream-50 dark:bg-navy-950 border border-cream-200 dark:border-navy-700 text-xs font-serif leading-relaxed text-cream-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {/* Rating & Favorite */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-cream-50/70 dark:bg-navy-950/60 border border-cream-200 dark:border-navy-800">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-cream-800/70 dark:text-slate-300 mb-1">
                Your Rating (1 – 5 Stars)
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-125 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= (hoverRating || rating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-cream-300 dark:text-navy-700'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-cream-900 dark:text-white ml-2">
                  {hoverRating || rating}.0
                </span>
              </div>
            </div>

            {/* Favorite Checkbox */}
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isFavorite}
                onChange={(e) => setIsFavorite(e.target.checked)}
                className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500 accent-rose-500"
              />
              <span className="text-xs font-semibold text-cream-900 dark:text-white flex items-center gap-1">
                <Heart className={`w-4 h-4 text-rose-500 ${isFavorite ? 'fill-current' : ''}`} />
                Mark as Favorite
              </span>
            </label>
          </div>

          {/* Cover Image URL & Quick Presets */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-cream-800/70 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Cover / Poster Image URL</span>
              <span className="text-[10px] text-cream-800/50 dark:text-slate-400 font-normal">Direct image link</span>
            </label>
            <input
              type="url"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://example.com/poster.jpg"
              className="w-full px-3.5 py-2 rounded-xl bg-cream-50 dark:bg-navy-950 border border-cream-200 dark:border-navy-700 text-sm text-cream-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />

            {/* Quick preset selector buttons */}
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-cream-800/60 dark:text-slate-400">Quick Presets:</span>
              {PRESET_COVERS[itemType]?.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setCoverImageUrl(preset.url)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-cream-100 dark:bg-navy-800 text-cream-800 dark:text-slate-300 hover:bg-amber-500/20 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-cream-800/70 dark:text-slate-300 mb-1.5">
              Description / Synopsis
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief overview or summary of the plot..."
              className="w-full px-3.5 py-2 rounded-xl bg-cream-50 dark:bg-navy-950 border border-cream-200 dark:border-navy-700 text-sm text-cream-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
          </div>

          {/* Personal Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-cream-800/70 dark:text-slate-300 mb-1.5">
              Personal Notes & Review
            </label>
            <textarea
              rows={2}
              value={personalNotes}
              onChange={(e) => setPersonalNotes(e.target.value)}
              placeholder="Your private reflections, favorite quotes, or memorable moments..."
              className="w-full px-3.5 py-2 rounded-xl bg-cream-50 dark:bg-navy-950 border border-cream-200 dark:border-navy-700 text-sm text-cream-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-cream-100 dark:border-navy-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-cream-800 dark:text-slate-300 hover:bg-cream-100 dark:hover:bg-navy-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-sm hover:shadow-md transition-all disabled:opacity-50"
            >
              {submitting ? 'Saving...' : isEditing ? 'Save Changes' : `Add ${itemType === 'movie' ? 'Movie' : 'Book'}`}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
