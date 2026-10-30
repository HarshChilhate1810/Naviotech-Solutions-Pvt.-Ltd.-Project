import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  BookOpen,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import { playPageTurnSound } from '../services/audioService';
import { useTheme } from '../context/ThemeContext';
import { libraryService } from '../services/libraryService';

export function BookReaderModal({ book, onClose, onProgressUpdated }) {
  const { soundEnabled, toggleSound } = useTheme();
  const bookDetails = book?.book_details || {};

  const totalPages = Math.max(bookDetails.total_pages || 40, 10);

  const [currentPage, setCurrentPage] = useState(() => {
    return Math.max(1, Math.min(bookDetails.current_page || 1, totalPages));
  });

  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState('next');
  const [turningLeaf, setTurningLeaf] = useState(null);
  const [isSaved, setIsSaved] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [ribbonMarked, setRibbonMarked] = useState(true);

  const flipTimeoutRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    return () => {
      if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);
    };
  }, []);

  // Split and format pages content
  const pagesContent = useMemo(() => {
    const rawContent = bookDetails.sample_content || '';

    const textToUse = rawContent.trim() ? rawContent : `Chapter I: A Scandal in Bohemia

To Sherlock Holmes she is always the woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex. It was not that he felt any emotion akin to love for Irene Adler. All emotions, and that one particularly, were abhorrent to his cold, precise but admirably balanced mind.

He was, I take it, the most perfect reasoning and observing machine that the world has seen, but as a lover he would have placed himself in a false position. He never spoke of the softer passions, save with a gibe and a sneer. They were admirable things for the observer—excellent for drawing the veil from men's motives and actions.

Chapter II: The Midnight Visitor

I had seen little of Holmes lately. My marriage had drifted us away from each other. My own complete happiness, and the home-centred interests which rise up around the man who first finds himself master of his own establishment, were sufficient to absorb all my attention.

Holmes, who loathed every form of society with his whole Bohemian soul, remained in our lodgings in Baker Street, buried among his old books, and alternating from week to week between cocaine and ambition, the drowsiness of the drug, and the fierce energy of his own keen nature.

Chapter III: The Baker Street Archive

He was still, as ever, deeply attracted by the study of crime, and occupied his immense faculties and extraordinary powers of observation in following out those clues, and clearing up those mysteries which had been abandoned as hopeless by the official police.

As he spoke, he threw himself into his deep armchair, and lit the cherrywood pipe which was his companion in his deepest reveries. The yellow light of the gas lamp flickered against the leaded panes, while outside the London fog coiled around the street corners like a living phantom.`;

    const paragraphs = textToUse.split('\n\n').filter(p => p.trim());
    const generated = [];

    for (let i = 1; i <= totalPages; i++) {
      const pIdx = (i - 1) % paragraphs.length;
      const nextPIdx = i % paragraphs.length;
      generated.push({
        pageNumber: i,
        chapter: `Chapter ${Math.floor((i - 1) / 4) + 1}`,
        paragraph1: paragraphs[pIdx] || 'The silence of the evening returned, leaving the reader in peaceful contemplation.',
        paragraph2: paragraphs[nextPIdx] || 'Onward through the corridors of memory, each word resonated with quiet depth.',
      });
    }

    return generated;
  }, [bookDetails.sample_content, totalPages]);

  // Save progress
  const saveProgress = useCallback(async (pageToSave) => {
    setIsSaved(false);
    try {
      await libraryService.updateReadingProgress(book.id, pageToSave);
      setIsSaved(true);
      onProgressUpdated?.(book.id, pageToSave);
    } catch (e) {
      console.error('Failed to auto-save reading progress:', e);
      setIsSaved(false);
    }
  }, [book?.id, onProgressUpdated]);

  // Current spread pages
  const currentLeftNum = isMobile ? currentPage : (currentPage % 2 === 0 ? currentPage - 1 : currentPage);
  const currentRightNum = isMobile ? null : Math.min(currentLeftNum + 1, totalPages);

  const leftPageData = pagesContent[currentLeftNum - 1] || { pageNumber: currentLeftNum, chapter: 'Chapter 1', paragraph1: '', paragraph2: '' };
  const rightPageData = currentRightNum ? (pagesContent[currentRightNum - 1] || { pageNumber: currentRightNum, chapter: 'Chapter 1', paragraph1: '', paragraph2: '' }) : null;

  // Navigate with authentic 3D page flip
  const goToPage = useCallback((targetPage, direction = 'next') => {
    const clamped = Math.max(1, Math.min(targetPage, totalPages));
    if (clamped === currentPage || isFlipping) return;

    // Mobile single page flip
    if (isMobile) {
      setIsFlipping(true);
      setFlipDirection(direction);
      playPageTurnSound(soundEnabled, direction);

      setTurningLeaf({
        currentNum: currentPage,
        currentData: pagesContent[currentPage - 1],
        targetNum: clamped,
        targetData: pagesContent[clamped - 1],
        direction,
      });

      if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);
      flipTimeoutRef.current = setTimeout(() => {
        setCurrentPage(clamped);
        setIsFlipping(false);
        setTurningLeaf(null);
        saveProgress(clamped);
      }, 520);
      return;
    }

    // Two-page desktop spread flip
    const nextLeftNum = clamped % 2 === 0 ? clamped - 1 : clamped;
    const nextRightNum = Math.min(nextLeftNum + 1, totalPages);

    let leaf = null;
    if (direction === 'next') {
      // Right page turns over to become the new left page
      leaf = {
        direction: 'next',
        // Front face: old right page
        frontData: rightPageData,
        frontNum: currentRightNum,
        // Back face: new left page
        backData: pagesContent[nextLeftNum - 1],
        backNum: nextLeftNum,
        // Base underneath pages
        baseLeftData: leftPageData,
        baseLeftNum: currentLeftNum,
        baseRightData: pagesContent[nextRightNum - 1],
        baseRightNum: nextRightNum,
      };
    } else {
      // Left page turns backward over to become the new right page
      leaf = {
        direction: 'prev',
        // Front face: old left page
        frontData: leftPageData,
        frontNum: currentLeftNum,
        // Back face: new right page
        backData: pagesContent[nextRightNum - 1],
        backNum: nextRightNum,
        // Base underneath pages
        baseRightData: rightPageData,
        baseRightNum: currentRightNum,
        baseLeftData: pagesContent[nextLeftNum - 1],
        baseLeftNum: nextLeftNum,
      };
    }

    setTurningLeaf(leaf);
    setFlipDirection(direction);
    setIsFlipping(true);
    playPageTurnSound(soundEnabled, direction);

    if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);
    flipTimeoutRef.current = setTimeout(() => {
      setCurrentPage(clamped);
      setIsFlipping(false);
      setTurningLeaf(null);
      saveProgress(clamped);
    }, 560);
  }, [currentPage, totalPages, isFlipping, isMobile, pagesContent, soundEnabled, currentRightNum, leftPageData, rightPageData, currentLeftNum, saveProgress]);

  const handlePrev = useCallback(() => {
    if (isFlipping) return;
    const step = isMobile ? 1 : 2;
    if (currentPage > 1) {
      goToPage(currentPage - step, 'prev');
    }
  }, [currentPage, isMobile, goToPage, isFlipping]);

  const handleNext = useCallback(() => {
    if (isFlipping) return;
    const step = isMobile ? 1 : 2;
    if (currentPage < totalPages) {
      goToPage(currentPage + step, 'next');
    }
  }, [currentPage, totalPages, isMobile, goToPage, isFlipping]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext, onClose]);

  // Dynamic realistic page stack thickness (fore-edge paper block depth)
  const readingProgress = totalPages > 1 ? (currentPage - 1) / (totalPages - 1) : 0;
  const leftStackWidth = Math.round(4 + readingProgress * 14); // 4px to 18px
  const rightStackWidth = Math.round(18 - readingProgress * 14); // 18px to 4px

  // Page Content Renderer
  const renderPageSheet = (pageData, pageNum, side, extraClass = '') => {
    if (!pageData && !pageNum) return null;
    const isLeft = side === 'left';
    const num = pageNum || pageData?.pageNumber || 1;

    return (
      <div className={`relative w-full h-full flex flex-col justify-between p-6 sm:p-8 md:p-10 select-none overflow-hidden ${
        isLeft ? 'paper-sheet-left' : 'paper-sheet-right'
      } text-slate-800 dark:text-slate-200 ${extraClass}`}>

        {/* Subtle organic paper grain texture overlay */}
        <div className="absolute inset-0 opacity-[0.035] dark:opacity-[0.055] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:10px_10px]" />

        {/* Gutter gradient shadow for physical depth */}
        <div className={`absolute inset-y-0 ${
          isLeft 
            ? 'right-0 w-12 bg-gradient-to-l from-black/20 dark:from-black/45 to-transparent' 
            : 'left-0 w-12 bg-gradient-to-r from-black/20 dark:from-black/45 to-transparent'
        } pointer-events-none`} />

        {/* Top Running Header */}
        <div className="relative flex items-center justify-between text-[11px] font-serif tracking-widest text-slate-600/70 dark:text-slate-400/60 pb-2 border-b border-black/5 dark:border-white/5 uppercase">
          <span className="truncate max-w-[140px] font-medium">
            {isLeft ? (book?.title || 'BiblioBox') : (bookDetails?.author || 'BiblioBox')}
          </span>
          <span className="text-[10px] tracking-wider text-amber-900/60 dark:text-amber-300/50">
            {pageData?.chapter || `Chapter ${Math.floor((num - 1) / 4) + 1}`}
          </span>
        </div>

        {/* Page Text Body */}
        <div className="relative my-auto py-3 font-serif text-[14px] sm:text-[15px] md:text-[15.5px] leading-[1.8] text-slate-800 dark:text-slate-200 space-y-4">
          <p className={num === 1 ? 'first-letter:text-4xl first-letter:font-display first-letter:font-bold first-letter:text-amber-800 dark:first-letter:text-amber-400 first-letter:float-left first-letter:mr-2.5 first-letter:leading-none' : ''}>
            {pageData?.paragraph1}
          </p>
          {pageData?.paragraph2 && (
            <p className="text-slate-700/90 dark:text-slate-300/90">
              {pageData?.paragraph2}
            </p>
          )}
        </div>

        {/* Bottom Running Footer */}
        <div className="relative flex items-center justify-between text-[11px] font-serif text-slate-500/70 dark:text-slate-400/50 pt-2 border-t border-black/5 dark:border-white/5">
          {isLeft ? (
            <>
              <span className="font-mono tabular-nums tracking-wider">— {num} —</span>
              <span className="italic text-[10px] text-slate-400 dark:text-slate-500">BiblioBox</span>
            </>
          ) : (
            <>
              <span className="italic text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[120px]">{book?.title || 'BiblioBox'}</span>
              <span className="font-mono tabular-nums tracking-wider">— {num} —</span>
            </>
          )}
        </div>

        {/* Interactive Corner dog-ear curl hover hints */}
        {!isLeft && num < totalPages && (
          <div
            className="corner-curl-br absolute bottom-0 right-0 w-8 h-8 cursor-pointer pointer-events-auto"
            title="Click or press Space / → to turn page"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
          />
        )}
        {isLeft && num > 1 && (
          <div
            className="corner-curl-bl absolute bottom-0 left-0 w-8 h-8 cursor-pointer pointer-events-auto"
            title="Click or press ← to go back"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Reader Modal Wrapper */}
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[820px] flex flex-col rounded-2xl bg-cream-50 dark:bg-navy-950 border border-cream-200/80 dark:border-navy-800/80 shadow-2xl overflow-hidden select-none">

        {/* Top Control Bar */}
        <div className="h-12 px-4 sm:px-6 flex items-center justify-between border-b border-cream-200/80 dark:border-navy-800/80 bg-cream-100/90 dark:bg-navy-900/90 backdrop-blur-sm shrink-0 z-40">

          {/* Book title & details */}
          <div className="flex items-center gap-2.5 min-w-0">
            <BookOpen className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
            <div className="min-w-0 flex items-center gap-2">
              <h3 className="font-serif font-bold text-sm text-cream-900 dark:text-white truncate">
                {book?.title}
              </h3>
              {bookDetails?.author && (
                <span className="hidden md:inline text-xs text-cream-800/50 dark:text-slate-400 truncate">
                  by {bookDetails.author}
                </span>
              )}
            </div>
          </div>

          {/* Progress Slider & Page Range Indicator */}
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-[11px] font-mono font-medium text-cream-800/60 dark:text-slate-400 tabular-nums">
              {currentLeftNum}{currentRightNum ? `–${currentRightNum}` : ''} / {totalPages}
            </span>

            <input
              type="range"
              min="1"
              max={totalPages}
              value={currentPage}
              onChange={(e) => goToPage(parseInt(e.target.value, 10), parseInt(e.target.value, 10) > currentPage ? 'next' : 'prev')}
              className="w-24 lg:w-36 h-1.5 bg-cream-300 dark:bg-navy-700 rounded-full appearance-none cursor-pointer accent-amber-600 hover:accent-amber-500 transition-all"
              title="Jump to page"
            />

            <span className="text-[11px] font-mono text-amber-800 dark:text-amber-400/90 tabular-nums">
              {Math.round((currentPage / totalPages) * 100)}%
            </span>

            {isSaved && (
              <span title="Progress saved">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </span>
            )}
          </div>

          {/* Controls: Ribbon Bookmark, Audio, Close */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setRibbonMarked(prev => !prev)}
              className={`p-1.5 rounded-lg transition-all ${
                ribbonMarked
                  ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
              title={ribbonMarked ? 'Remove ribbon bookmark' : 'Add ribbon bookmark'}
            >
              <Bookmark className="w-4 h-4" />
            </button>

            <button
              onClick={toggleSound}
              className={`p-1.5 rounded-lg transition-all ${
                soundEnabled
                  ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
              title={soundEnabled ? 'Page flip sound active' : 'Sound muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-cream-800/60 dark:text-slate-400 hover:text-cream-900 dark:hover:text-white hover:bg-cream-200/50 dark:hover:bg-navy-800 transition-all"
              title="Close (Esc)"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Ambient Reading Studio Container */}
        <div className="relative flex-1 p-2 sm:p-5 md:p-8 flex items-center justify-center overflow-hidden bg-gradient-to-b from-cream-100/70 via-cream-50 to-cream-100/70 dark:from-navy-950 dark:via-charcoal-900 dark:to-navy-950">

          {/* ─────────────────────────────────────────────────────────────
              PHYSICAL REAL BOOK ASSEMBLY
             ───────────────────────────────────────────────────────────── */}
          <div className="relative w-full max-w-4xl h-full max-h-[660px] flex items-center justify-center book-3d-scene">

            {/* Hardcover Casing with debossed gold foil trim */}
            <div className="relative w-full h-full rounded-2xl book-hardcover-casing book-cover-foil-border p-2 sm:p-3 flex items-center justify-center">

              {/* Left Stack Depth (Fore-Edge page block) */}
              {!isMobile && (
                <div
                  className="page-fore-edge absolute left-0 top-3 bottom-3 rounded-l-sm transition-all duration-300"
                  style={{ width: `${leftStackWidth}px` }}
                  title={`${currentPage} pages read`}
                />
              )}

              {/* Right Stack Depth (Fore-Edge page block) */}
              {!isMobile && (
                <div
                  className="page-fore-edge absolute right-0 top-3 bottom-3 rounded-r-sm transition-all duration-300"
                  style={{ width: `${rightStackWidth}px` }}
                  title={`${totalPages - currentPage} pages remaining`}
                />
              )}

              {/* Spine Cloth Headbands (Top and bottom notch) */}
              {!isMobile && (
                <>
                  <div className="book-headband absolute top-1 left-1/2 -translate-x-1/2 w-8 h-2 rounded-t-sm z-30" />
                  <div className="book-headband absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-2 rounded-b-sm z-30" />
                </>
              )}

              {/* Silky Red Ribbon Bookmark */}
              {!isMobile && ribbonMarked && (
                <div className="book-ribbon-bookmark absolute top-0 left-[52%] w-3 h-48 rounded-b-sm z-40 transition-all pointer-events-none">
                  {/* Triangular notch cut out at ribbon tail */}
                  <div className="absolute bottom-0 left-0 right-0 h-2 bg-transparent border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-paper-light dark:border-b-paper-dark" />
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────
                  PAGES SPREAD CONTAINER
                 ───────────────────────────────────────────────────────── */}
              <div
                className="relative w-full h-full flex rounded-lg overflow-hidden book-3d-scene shadow-inner cursor-pointer"
                style={{
                  marginLeft: !isMobile ? `${leftStackWidth}px` : '0px',
                  marginRight: !isMobile ? `${rightStackWidth}px` : '0px',
                }}
              >
                {/* ── MOBILE SINGLE PAGE VIEW ── */}
                {isMobile ? (
                  <div className="relative w-full h-full">
                    {/* Underlying next/prev page while flipping */}
                    {isFlipping && turningLeaf && (
                      <div className="absolute inset-0 z-10">
                        {renderPageSheet(turningLeaf.targetData, turningLeaf.targetNum, 'right')}
                      </div>
                    )}

                    {/* Active page (or page flipping away) */}
                    <div className={`relative w-full h-full z-20 ${
                      isFlipping && turningLeaf 
                        ? (turningLeaf.direction === 'next' ? 'mobile-leaf-next' : 'mobile-leaf-prev') 
                        : ''
                    }`}>
                      {renderPageSheet(
                        isFlipping && turningLeaf ? turningLeaf.currentData : pagesContent[currentPage - 1],
                        isFlipping && turningLeaf ? turningLeaf.currentNum : currentPage,
                        'right'
                      )}
                    </div>
                  </div>
                ) : (
                  /* ── DESKTOP TWO-PAGE SPREAD ── */
                  <>
                    {/* STATIONARY LEFT PAGE */}
                    <div
                      className="relative w-1/2 h-full cursor-pointer"
                      onClick={handlePrev}
                      title="Click to turn to previous page (←)"
                    >
                      {/* Underlying base left page */}
                      {renderPageSheet(
                        isFlipping && turningLeaf?.direction === 'prev'
                          ? turningLeaf.baseLeftData
                          : leftPageData,
                        isFlipping && turningLeaf?.direction === 'prev'
                          ? turningLeaf.baseLeftNum
                          : currentLeftNum,
                        'left'
                      )}

                      {/* Cast shadow when leaf turns onto left page */}
                      {isFlipping && turningLeaf?.direction === 'next' && (
                        <div className="absolute inset-0 bg-black/40 z-20 pointer-events-none cast-shadow-left" />
                      )}

                      {/* Reveal shadow on newly exposed left page */}
                      {isFlipping && turningLeaf?.direction === 'prev' && (
                        <div className="absolute inset-0 z-20 pointer-events-none reveal-shadow-left" />
                      )}
                    </div>

                    {/* CENTER SPINE GUTTER CREASE */}
                    <div className="relative w-6 h-full shrink-0 z-30 book-spine-gutter flex items-center justify-center pointer-events-none">
                      <div className="w-[1.5px] h-[96%] bg-black/30 dark:bg-white/10 shadow-sm" />
                    </div>

                    {/* STATIONARY RIGHT PAGE */}
                    <div
                      className="relative w-1/2 h-full cursor-pointer"
                      onClick={handleNext}
                      title="Click to turn to next page (→ / Space)"
                    >
                      {/* Underlying base right page */}
                      {renderPageSheet(
                        isFlipping && turningLeaf?.direction === 'next'
                          ? turningLeaf.baseRightData
                          : rightPageData,
                        isFlipping && turningLeaf?.direction === 'next'
                          ? turningLeaf.baseRightNum
                          : currentRightNum,
                        'right'
                      )}

                      {/* Reveal shadow on newly exposed right page */}
                      {isFlipping && turningLeaf?.direction === 'next' && (
                        <div className="absolute inset-0 z-20 pointer-events-none reveal-shadow-right" />
                      )}

                      {/* Cast shadow when leaf turns backward onto right page */}
                      {isFlipping && turningLeaf?.direction === 'prev' && (
                        <div className="absolute inset-0 bg-black/40 z-20 pointer-events-none cast-shadow-right" />
                      )}
                    </div>

                    {/* ── 3D TURNING LEAF (FLIPPER) ── */}
                    {isFlipping && turningLeaf && (
                      <div className={`book-leaf-flipper ${turningLeaf.direction === 'next' ? 'flip-next' : 'flip-prev'}`}>
                        {/* Front Face of Turning Leaf */}
                        <div className="book-leaf-face">
                          {renderPageSheet(
                            turningLeaf.frontData,
                            turningLeaf.frontNum,
                            turningLeaf.direction === 'next' ? 'right' : 'left'
                          )}
                          {/* Dynamic shadow on front face */}
                          <div className="flip-front-shadow" />
                        </div>

                        {/* Back Face of Turning Leaf */}
                        <div className="book-leaf-face-back">
                          {renderPageSheet(
                            turningLeaf.backData,
                            turningLeaf.backNum,
                            turningLeaf.direction === 'next' ? 'left' : 'right'
                          )}
                          {/* Dynamic shadow on back face */}
                          <div className="flip-back-shadow" />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Previous Page Navigation Button */}
            <button
              onClick={handlePrev}
              disabled={currentPage <= 1 || isFlipping}
              className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 p-3 rounded-full bg-cream-50/90 dark:bg-navy-800/90 text-cream-900 dark:text-slate-200 border border-amber-900/20 dark:border-amber-500/20 shadow-xl hover:bg-white dark:hover:bg-navy-700 active:scale-95 disabled:opacity-0 disabled:pointer-events-none transition-all z-50 group"
              title="Previous Page (←)"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>

            {/* Next Page Navigation Button */}
            <button
              onClick={handleNext}
              disabled={currentPage >= totalPages || isFlipping}
              className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 p-3 rounded-full bg-cream-50/90 dark:bg-navy-800/90 text-cream-900 dark:text-slate-200 border border-amber-900/20 dark:border-amber-500/20 shadow-xl hover:bg-white dark:hover:bg-navy-700 active:scale-95 disabled:opacity-0 disabled:pointer-events-none transition-all z-50 group"
              title="Next Page (→ / Space)"
              aria-label="Next page"
            >
              <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>

          </div>
        </div>

        {/* Mobile bottom info bar */}
        <div className="sm:hidden h-10 px-4 flex items-center justify-between border-t border-cream-200 dark:border-navy-800 bg-cream-100 dark:bg-navy-950 text-xs text-cream-800/60 dark:text-slate-400">
          <span className="tabular-nums font-mono">Page {currentPage} of {totalPages}</span>
          <span>Tap sides or swipe to turn</span>
        </div>

      </div>
    </div>
  );
}
