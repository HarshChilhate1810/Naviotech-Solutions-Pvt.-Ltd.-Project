import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { 
  Film, 
  BookOpen, 
  Star, 
  Heart, 
  Plus, 
  ArrowRight, 
  Sparkles, 
  BookCheck, 
  Library,
  Clock,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';
import { libraryService } from '../services/libraryService';
import { StatsCard } from '../components/StatsCard';
import { ItemCard } from '../components/ItemCard';
import { ReadingShelf } from '../components/ReadingShelf';
import { ItemDetailModal } from '../components/ItemDetailModal';
import { ItemFormModal } from '../components/ItemFormModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { BookReaderModal } from '../components/BookReaderModal';
import { MoviePlayerModal } from '../components/MoviePlayerModal';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { handleOpenAdd } = useOutletContext() || {};

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [readingBook, setReadingBook] = useState(null);
  const [watchingMovie, setWatchingMovie] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);


  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    const handleLibraryChanged = () => {
      fetchStats();
    };

    window.addEventListener('library:changed', handleLibraryChanged);
    return () => window.removeEventListener('library:changed', handleLibraryChanged);
  }, [fetchStats]);

  // Toggle favorite
  const handleToggleFavorite = async (itemId) => {
    try {
      await libraryService.toggleFavorite(itemId);
      fetchStats();
    } catch (e) {
      console.error(e);
    }
  };

  // Edit item
  const handleEditSubmit = async (payload) => {
    if (!editingItem) return;
    await libraryService.updateItem(editingItem.id, payload);
    setEditingItem(null);
    fetchStats();
  };

  // Delete item
  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      await libraryService.deleteItem(deletingItem.id);
      setDeletingItem(null);
      setSelectedItem(null);
      fetchStats();
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-medium text-cream-800/60 dark:text-slate-400">Loading your private collection...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cream-100 via-amber-500/10 to-cream-100 dark:from-navy-900 dark:via-navy-850 dark:to-navy-900 border border-cream-200/80 dark:border-navy-800 p-6 sm:p-8 shadow-xs">
        
        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-600/15 text-amber-800 dark:text-amber-300 border border-amber-500/20">
                <Sparkles className="w-3 h-3" />
                Personal Archive
              </span>
              <span className="text-xs text-cream-800/60 dark:text-slate-400">
                Cloud Synced
              </span>
            </div>

            <h1 className="font-display font-bold text-2xl sm:text-3xl text-cream-900 dark:text-white tracking-tight">
              Welcome back, {user?.name || 'Bibliophile'}
            </h1>
            <p className="mt-1 text-sm text-cream-800/70 dark:text-slate-300 max-w-xl">
              Manage your personal movie and book collections, resume reading in realistic page-turn view, and organize your ratings across all your devices.
            </p>
          </div>

          {/* Quick Action Add Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => handleOpenAdd?.('movie')}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-sm shadow-amber-600/30 transition-all"
            >
              <Film className="w-4 h-4" />
              Add Movie
            </button>
            <button
              onClick={() => handleOpenAdd?.('book')}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm shadow-emerald-600/30 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              Add Book
            </button>
          </div>
        </div>

      </div>

      {/* Metrics Row: 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Movies"
          value={stats?.total_movies ?? 0}
          subtitle="In your collection"
          icon={Film}
          colorClass="bg-amber-600"
        />
        <StatsCard
          title="Total Books"
          value={stats?.total_books ?? 0}
          subtitle="In your library"
          icon={BookOpen}
          colorClass="bg-emerald-600"
        />
        <StatsCard
          title="Avg Movie Rating"
          value={stats?.avg_movie_rating ? `${stats.avg_movie_rating} ★` : '—'}
          subtitle="Out of 5.0 stars"
          icon={Star}
          colorClass="bg-blue-600"
        />
        <StatsCard
          title="Avg Book Rating"
          value={stats?.avg_book_rating ? `${stats.avg_book_rating} ★` : '—'}
          subtitle="Out of 5.0 stars"
          icon={Sparkles}
          colorClass="bg-purple-600"
        />
      </div>

      {/* Currently Reading Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-bold text-lg text-cream-900 dark:text-white flex items-center gap-2">
              <BookCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Currently Reading
            </h2>
            <p className="text-xs text-cream-800/60 dark:text-slate-400">
              Continue reading right where you left off
            </p>
          </div>

          <button
            onClick={() => navigate('/books')}
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            All Books <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <ReadingShelf
          books={stats?.currently_reading || []}
          onOpenReader={(b) => setReadingBook(b)}
          onBrowseBooks={() => navigate('/books')}
        />
      </section>

      {/* Favorites Shelf */}
      {stats?.favorite_items && stats.favorite_items.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-bold text-lg text-cream-900 dark:text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-current" />
                Favorite Highlights
              </h2>
              <p className="text-xs text-cream-800/60 dark:text-slate-400">
                Your highest-rated and handpicked favorites
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {stats.favorite_items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onClick={(it) => setSelectedItem(it)}
                onToggleFavorite={handleToggleFavorite}
                onOpenReader={(it) => setReadingBook(it)}
                onWatchMovie={(it) => setWatchingMovie(it)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recently Added Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-bold text-lg text-cream-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              Recently Added
            </h2>
            <p className="text-xs text-cream-800/60 dark:text-slate-400">
              Latest additions to your personal archive
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/movies')}
              className="text-xs font-medium text-cream-800/70 dark:text-slate-300 hover:text-amber-600"
            >
              Browse Movies
            </button>
            <span className="text-xs opacity-40">•</span>
            <button
              onClick={() => navigate('/books')}
              className="text-xs font-medium text-cream-800/70 dark:text-slate-300 hover:text-emerald-600"
            >
              Browse Books
            </button>
          </div>
        </div>

        {stats?.recent_items && stats.recent_items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {stats.recent_items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onClick={(it) => setSelectedItem(it)}
                onToggleFavorite={handleToggleFavorite}
                onOpenReader={(it) => setReadingBook(it)}
                onWatchMovie={(it) => setWatchingMovie(it)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-cream-300 dark:border-navy-800 p-8 text-center bg-cream-50/50 dark:bg-navy-950/40">
            <Library className="w-8 h-8 text-cream-400 dark:text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-cream-900 dark:text-slate-200">
              Your library is waiting to be filled
            </h4>
            <p className="text-xs text-cream-800/60 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Add your favorite movies and books to start tracking your reading and watching history.
            </p>
          </div>
        )}
      </section>

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
          onWatchMovie={(it) => {
            setSelectedItem(null);
            setWatchingMovie(it);
          }}
        />
      )}

      {/* Edit Modal */}
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
          onProgressUpdated={() => fetchStats()}
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

