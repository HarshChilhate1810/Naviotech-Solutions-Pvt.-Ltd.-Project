import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Film, Plus, RefreshCw, Layers } from 'lucide-react';
import { libraryService } from '../services/libraryService';
import { useDebounce } from '../hooks/useDebounce';
import { FilterBar } from '../components/FilterBar';
import { ItemCard } from '../components/ItemCard';
import { Pagination } from '../components/Pagination';
import { ItemDetailModal } from '../components/ItemDetailModal';
import { ItemFormModal } from '../components/ItemFormModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { MoviePlayerModal } from '../components/MoviePlayerModal';

export function MoviesPage() {
  const { handleOpenAdd } = useOutletContext() || {};

  // Filters & State
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [genre, setGenre] = useState('');
  const [rating, setRating] = useState('');
  const [isFavorite, setIsFavorite] = useState('');
  const [sortBy, setSortBy] = useState('recently_added');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Data
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [watchingMovie, setWatchingMovie] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);


  // Load movies from backend
  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await libraryService.getItems({
        item_type: 'movie',
        search: debouncedSearch || undefined,
        genre: genre || undefined,
        min_rating: rating ? parseInt(rating, 10) : undefined,
        is_favorite: isFavorite ? true : undefined,
        sort_by: sortBy,
        page,
        page_size: pageSize,
      });

      setItems(data.items);
      setTotal(data.total);
      setTotalPages(data.total_pages);
    } catch (err) {
      setError(err.message || 'Failed to fetch movies');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, genre, rating, isFavorite, sortBy, page]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, genre, rating, isFavorite, sortBy]);

  useEffect(() => {
    fetchMovies();

    const handleLibraryChanged = () => fetchMovies();
    window.addEventListener('library:changed', handleLibraryChanged);
    return () => window.removeEventListener('library:changed', handleLibraryChanged);
  }, [fetchMovies]);

  // Clear filters
  const handleClearFilters = () => {
    setSearch('');
    setGenre('');
    setRating('');
    setIsFavorite('');
    setSortBy('recently_added');
    setPage(1);
  };

  const hasActiveFilters = Boolean(search || genre || rating || isFavorite || sortBy !== 'recently_added');

  // Toggle favorite
  const handleToggleFavorite = async (itemId) => {
    try {
      await libraryService.toggleFavorite(itemId);
      fetchMovies();
      if (selectedItem?.id === itemId) {
        setSelectedItem(prev => ({ ...prev, is_favorite: !prev.is_favorite }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Edit item
  const handleEditSubmit = async (payload) => {
    if (!editingItem) return;
    await libraryService.updateItem(editingItem.id, payload);
    setEditingItem(null);
    fetchMovies();
  };

  // Delete item
  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      await libraryService.deleteItem(deletingItem.id);
      setDeletingItem(null);
      setSelectedItem(null);
      fetchMovies();
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-cream-900 dark:text-white flex items-center gap-2.5">
            <Film className="w-7 h-7 text-amber-600 dark:text-amber-400" />
            Movie Collection
          </h1>
          <p className="text-xs sm:text-sm text-cream-800/60 dark:text-slate-400 mt-1">
            Browse, rate, and manage your private film library
          </p>
        </div>

        <button
          onClick={() => handleOpenAdd?.('movie')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-sm shadow-amber-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Movie
        </button>
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        genre={genre}
        onGenreChange={setGenre}
        rating={rating}
        onRatingChange={setRating}
        isFavorite={isFavorite}
        onFavoriteChange={setIsFavorite}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
        showTypeFilter={false}
        showReadingFilter={false}
        availableGenres={['Sci-Fi', 'Drama', 'Action', 'Animation', 'Comedy', 'Thriller', 'Horror', 'Documentary', 'Fantasy', 'Romance']}
      />

      {/* Movies Grid / Empty States */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-cream-800/60 dark:text-slate-400">Loading movies...</p>
        </div>
      ) : items.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {items.map((movie) => (
              <ItemCard
                key={movie.id}
                item={movie}
                onClick={(it) => setSelectedItem(it)}
                onToggleFavorite={handleToggleFavorite}
                onWatchMovie={(it) => setWatchingMovie(it)}
              />
            ))}
          </div>

          {/* Server-Side Pagination */}
          <Pagination
            page={page}
            totalPages={totalPages}
            totalRecords={total}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </>
      ) : (
        <div className="rounded-3xl border border-dashed border-cream-300 dark:border-navy-800 p-12 text-center bg-cream-50/50 dark:bg-navy-950/40">
          <Film className="w-12 h-12 text-cream-400 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-cream-900 dark:text-white">
            {hasActiveFilters ? 'No movies match your filters' : 'No movies added yet'}
          </h3>
          <p className="text-xs text-cream-800/60 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {hasActiveFilters
              ? 'Try adjusting your search keywords, rating filters, or clearing your active filters.'
              : 'Start by adding your favorite films, classic cinema, or must-watch titles.'}
          </p>

          <div className="mt-5 flex items-center justify-center gap-3">
            {hasActiveFilters ? (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 rounded-xl bg-cream-200 dark:bg-navy-800 text-xs font-semibold text-cream-900 dark:text-white"
              >
                Clear All Filters
              </button>
            ) : (
              <button
                onClick={() => handleOpenAdd?.('movie')}
                className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold shadow-sm"
              >
                Add Your First Movie
              </button>
            )}
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onEdit={(it) => {
            setSelectedItem(null);
            setEditingItem(it);
          }}
          onDelete={(it) => {
            setSelectedItem(null);
            setDeletingItem(it);
          }}
          onToggleFavorite={handleToggleFavorite}
          onWatchMovie={(it) => {
            setSelectedItem(null);
            setWatchingMovie(it);
          }}
        />
      )}

      {/* Edit Form Modal */}
      {editingItem && (
        <ItemFormModal
          isOpen={true}
          initialData={editingItem}
          onClose={() => setEditingItem(null)}
          onSubmit={handleEditSubmit}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <DeleteConfirmModal
          isOpen={true}
          item={deletingItem}
          isDeleting={isDeleting}
          onClose={() => setDeletingItem(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {/* Movie Player Modal */}
      {watchingMovie && (
        <MoviePlayerModal
          movie={watchingMovie}
          onClose={() => setWatchingMovie(null)}
        />
      )}


    </div>
  );
}
