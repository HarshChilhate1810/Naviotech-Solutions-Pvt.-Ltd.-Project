import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ItemFormModal } from '../components/ItemFormModal';
import { libraryService } from '../services/libraryService';

export function RootLayout() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [modalType, setModalType] = useState('movie');

  const handleOpenAdd = (type = 'movie') => {
    setModalType(type);
    setAddModalOpen(true);
  };

  const handleCreateItem = async (payload) => {
    await libraryService.createItem(payload);
    // Dispatch global event so active pages reload their data
    window.dispatchEvent(new CustomEvent('library:changed'));
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream-50 dark:bg-navy-950 text-cream-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar onOpenAddModal={handleOpenAdd} />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet context={{ handleOpenAdd }} />
      </main>

      <Footer />

      {/* Global Quick Add Modal */}
      <ItemFormModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleCreateItem}
        initialType={modalType}
      />
    </div>
  );
}
