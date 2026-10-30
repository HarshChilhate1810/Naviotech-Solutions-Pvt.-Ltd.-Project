import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BookOpen, Plus, RefreshCw } from 'lucide-react';
import { libraryService } from '../services/libraryService';
import { useDebounce } from '../hooks/useDebounce';
import { FilterBar } from '../components/FilterBar';
import { ItemCard } from '../components/ItemCard';
import { Pagination } from '../components/Pagination';
import { ItemDetailModal } from '../components/ItemDetailModal';
import { ItemFormModal } from '../components/ItemFormModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { BookReaderModal } from '../components/BookReaderModal';

export function BooksPage() {
  const { handleOpenAdd } = useOutletContext() || {};

  // Filters & State
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [genre, setGenre] = useState('');
  const [rating, setRating] = useState('');
  const [isFavorite, setIsFavorite] = useState('');
  const [readingStatus, setReadingStatus] = useState('');
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
  const [readingBook, setReadingBook] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load books from backend
  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await libraryService.getItems({
        item_type: 'book',
        search: debouncedSearch || undefined,
        genre: genre || undefined,
        min_rating: rating ? parseInt(rating, 10) : undefined,
        is_favorite: isFavorite ? true : undefined,
        reading_status: readingStatus || undefined,
        sort_by: sortBy,
        page,
        page_size: pageSize,
      });

      setItems(data.items);
      setTotal(data.total);
      setTotalPages(data.total_pages);
    } catch (err) {
      setError(err.message || 'Failed to fetch books');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, genre, rating, isFavorite, readingStatus, sortBy, page]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, genre, rating, isFavorite, readingStatus, sortBy]);

  useEffect(() => {
    fetchBooks();

    const handleLibraryChanged = () => fetchBooks();
    window.addEventListener('library:changed', handleLibraryChanged);
    return () => window.removeEventListener('library:changed', handleLibraryChanged);
  }, [fetchBooks]);

  // Clear filters
  const handleClearFilters = () => {
    setSearch('');
    setGenre('');
    setRating('');
    setIsFavorite('');
    setReadingStatus('');
    setSortBy('recently_added');
    setPage(1);
  };

  const hasActiveFilters = Boolean(search || genre || rating || isFavorite || readingStatus || sortBy !== 'recently_added');

  // Toggle favorite
  const handleToggleFavorite = async (itemId) => {
    try {
      await libraryService.toggleFavorite(itemId);
      fetchBooks();
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
    fetchBooks();
  };

  // Delete item
  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      await libraryService.deleteItem(deletingItem.id);
      setDeletingItem(null);
      setSelectedItem(null);
      fetchBooks();
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
          <h1 className="font-sans font-semibold text-xl sm:text-2xl text-cream-900 dark:text-white">
            Books
          </h1>
          <p className="text-xs text-cream-800/50 dark:text-slate-500 mt-0.5">
            Your personal collection
          </p>
        </div>

        <button
          onClick={() => handleOpenAdd?.('book')}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-cream-900 dark:bg-white hover:opacity-90 text-white dark:text-cream-900 text-xs font-medium transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Book
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
        readingStatus={readingStatus}
        onReadingStatusChange={setReadingStatus}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
        showTypeFilter={false}
        showReadingFilter={true}
        availableGenres={['Mystery / Detective', 'Romance / Classic', 'Science Fiction', 'Fantasy', 'Historical Fiction', 'Philosophy', 'Biography', 'Thriller', 'Non-Fiction']}
      />

      {/* Books Grid / Empty States */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-cream-800/60 dark:text-slate-400">Loading books...</p>
        </div>
      ) : items.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {items.map((book) => (
              <ItemCard
                key={book.id}
                item={book}
                onClick={(it) => setSelectedItem(it)}
                onToggleFavorite={handleToggleFavorite}
                onOpenReader={(it) => setReadingBook(it)}
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
          <BookOpen className="w-12 h-12 text-cream-400 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-cream-900 dark:text-white">
            {hasActiveFilters ? 'No books match your filters' : 'No books in your library yet'}
          </h3>
          <p className="text-xs text-cream-800/60 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {hasActiveFilters
              ? 'Try modifying your search query or clearing your active filters.'
              : 'Add your favorite novels, essays, or memoirs to start reading and tracking pages.'}
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
                onClick={() => handleOpenAdd?.('book')}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm"
              >
                Add Your First Book
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
          onOpenReader={(it) => {
            setSelectedItem(null);
            setReadingBook(it);
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

      {/* Interactive Realistic Book Reader Modal */}
      {readingBook && (
        <BookReaderModal
          book={readingBook}
          onClose={() => setReadingBook(null)}
          onProgressUpdated={() => fetchBooks()}
        />
      )}

    </div>
  );
}
