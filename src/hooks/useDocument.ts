import { useContext } from 'react';
import { DocumentContext } from '@/context/document.tsx';

export function useDocument() {
  const ctx = useContext(DocumentContext);
  if (!ctx) throw new Error('useDocument must be used within DocumentProvider');
  return ctx;
}
