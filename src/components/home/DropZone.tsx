import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils.ts';

const TEXT_LINES = [
  { width: '85%' },
  { width: '92%' },
  { width: '68%' },
  { width: '96%' },
  { width: '55%' },
  { width: '88%' },
  { width: '73%' },
];

interface DropZoneProps {
  onFileSelect: (file: File) => void
}

export function DropZone({ onFileSelect }: DropZoneProps) {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (file.type === 'application/pdf') {
        onFileSelect(file);
      }
    },
    [onFileSelect],
  );

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
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

  const isActive = isDragging || isHovering;

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={cn(
        'relative flex flex-row items-center justify-center gap-16 px-16 py-10 cursor-pointer select-none overflow-hidden transition-colors duration-300',
        isActive
          ? 'bg-accent/80 dark:bg-neutral-200'
          : 'bg-white/5',
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="sr-only"
        onChange={onInputChange}
      />

      <div style={{ animation: 'doc-float 4.5s ease-in-out infinite' }}>
        <div
          style={{
            transform: isActive ? 'scale(1.06) rotate(0deg)' : 'rotate(-3deg)',
            transition: 'transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <div
            className={cn(
              'relative w-36 h-44 border overflow-hidden transition-all duration-300',
              isActive
                ? 'bg-neutral-100 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-500 shadow-[0_12px_32px_rgba(13,148,136,0.2)]'
                : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 shadow-[0_6px_24px_rgba(0,0,0,0.10)]',
            )}
          >
            <div className={cn(
              'absolute top-0 left-0 right-0 h-1 transition-colors duration-500',
              isActive ? 'bg-accent' : 'bg-neutral-200 dark:bg-neutral-700',
            )} />

            <div className="px-4 pt-5 pb-3 flex flex-col gap-2">
              <div
                className={cn(
                  'h-2.5 mb-1 transition-colors duration-300',
                  isActive
                    ? 'bg-neutral-900 dark:bg-neutral-100'
                    : 'bg-neutral-400 dark:bg-neutral-500',
                )}
                style={{ width: '55%' }}
              />

              {TEXT_LINES.map((line, i) => (
                <div key={i} className="relative h-1.5">
                  <div
                    className="absolute inset-y-0 left-0 rounded-sm bg-neutral-200 dark:bg-neutral-600"
                    style={{ width: line.width }}
                  />
                  <div
                    className={cn(
                      'absolute inset-y-0 left-0 origin-left rounded-sm',
                      isActive
                        ? 'bg-neutral-900 dark:bg-neutral-100'
                        : 'bg-accent',
                    )}
                    style={{
                      width: line.width,
                      transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                      transition: `transform 0.38s cubic-bezier(0.4, 0, 0.2, 1) ${
                        isActive ? i * 40 : 0
                      }ms, background-color 0.3s ease`,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className={cn(
          'font-semibold text-sm tracking-wide transition-colors duration-300',
          isActive
            ? 'text-neutral-100 dark:text-neutral-900'
            : 'text-fg',
        )}>
          {isDragging ? t('dropzone.drop') : t('dropzone.idle')}
        </p>
      </div>
    </div>
  );
}
