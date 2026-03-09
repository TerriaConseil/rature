import { useState, useRef, useCallback } from 'react';
import { FileText, Upload } from 'lucide-react';
import { cn } from '@/lib/utils.ts';

interface DropZoneProps {
  onFileSelect: (file: File) => void
}

export function DropZone({ onFileSelect }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (file.type === 'application/pdf') {
        onFileSelect(file);
      }
    },
    [onFileSelect],
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        'relative flex flex-col items-center justify-center gap-4 p-10 cursor-pointer transition-all duration-200 group select-none',
        isDragging
          ? 'border-accent bg-teal-50/50 dark:bg-teal-950/20 scale-[1.01]'
          : 'border-border-strong hover:border-accent hover:bg-neutral-800 dark:hover:bg-neutral-200',
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="sr-only"
        onChange={onInputChange}
      />

      <div
        className={cn(
          'flex items-center justify-center w-14 h-14 transition-all duration-300',
          isDragging
            ? 'bg-accent text-accent-foreground'
            : 'bg-surface-subtle text-fg-muted dark:bg-neutral-200 dark:text-neutral-800 group-hover:bg-accent group-hover:text-neutral-100 group-hover:dark:bg-accent group-hover:dark:text-neutral-100',
        )}
      >
        {isDragging ? (
          <FileText size={26} strokeWidth={1.5} />
        ) : (
          <Upload size={26} strokeWidth={1.5} />
        )}
      </div>

      <div className="text-center space-y-1">
        <p className="text-sm font-bold text-neutral-800 group-hover:text-neutral-100 dark:text-neutral-100 group-hover:dark:text-neutral-800">
          {isDragging ? 'Déposez votre PDF ici' : 'Déposez votre PDF ou cliquez pour importer'}
        </p>
      </div>
    </div>
  );
}
