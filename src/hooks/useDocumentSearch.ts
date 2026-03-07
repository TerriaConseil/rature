import { useState, useRef, useEffect } from 'react';
import { findAllOccurrences, type EntityMatch } from '@/lib/entity-expansion.ts';
import type { TextExtract } from '@/context/pdfProcessing.tsx';

export function useDocumentSearch(
  extractedText: TextExtract[],
  containerRef: HTMLDivElement | null,
  onPageChange: (page: number) => void,
) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchMatches, setSearchMatches] = useState<EntityMatch[]>([]);
  const [searchMatchIndex, setSearchMatchIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedQuery.length < 3) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchMatches([]);
      setSearchMatchIndex(0);
      return;
    }
    const matches = findAllOccurrences(debouncedQuery, extractedText, []);
    setSearchMatches(matches);
    setSearchMatchIndex(0);
    if (matches.length > 0) onPageChange(matches[0].page);
  }, [debouncedQuery, extractedText, onPageChange]);

  // Ctrl/Cmd+F keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-focus input when search opens
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [searchOpen]);

  // Scroll focused match into view
  useEffect(() => {
    if (!containerRef || searchMatches.length === 0) return;
    const el = containerRef.querySelector('[data-search-match="focused"]');
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [containerRef, searchMatchIndex, searchMatches.length]);

  const navigateMatch = (direction: 'prev' | 'next') => {
    if (searchMatches.length === 0) return;
    const newIndex = direction === 'next'
      ? (searchMatchIndex + 1) % searchMatches.length
      : (searchMatchIndex - 1 + searchMatches.length) % searchMatches.length;
    setSearchMatchIndex(newIndex);
    onPageChange(searchMatches[newIndex].page);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
    setDebouncedQuery('');
    setSearchMatches([]);
    setSearchMatchIndex(0);
  };

  return {
    searchOpen,
    setSearchOpen,
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    searchMatches,
    searchMatchIndex,
    searchInputRef,
    navigateMatch,
    closeSearch,
  };
}
