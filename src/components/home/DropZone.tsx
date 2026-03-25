import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ExternalLink, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button.tsx';
import { cn } from '@/lib/utils.ts';
import {
  DEFAULT_FEATURES,
  LANGUAGE_OPTIONS,
  SPEED_OPTIONS,
  FOCUS_OPTIONS,
  resolveModel,
  type ModelFeatures,
  type Language,
  type Speed,
  type Focus,
} from '@/models/nerModelFeatures.ts';
import { NER_MODELS, type NERModel } from '@/models/utils.ts';

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
  onModelSelect: (model: NERModel) => void
}

interface FeatureChipProps<T extends string> {
  option: { value: T; labelKey: string; icon: React.ComponentType<{ size?: number; className?: string }> };
  selected: boolean;
  onSelect: (value: T) => void;
}

function FeatureChip<T extends string>({ option, selected, onSelect }: FeatureChipProps<T>) {
  const { t } = useTranslation();
  const Icon = option.icon;
  return (
    <button
      type="button"
      onClick={() => onSelect(option.value)}
      className={cn(
        'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer select-none whitespace-nowrap',
        selected
          ? 'bg-accent text-white border-accent shadow-sm'
          : 'bg-transparent text-fg-muted border-border-theme hover:border-accent/60 hover:text-fg',
      )}
    >
      <Icon size={12} />
      {t(option.labelKey)}
    </button>
  );
}

export function DropZone({ onFileSelect, onModelSelect }: DropZoneProps) {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [features, setFeatures] = useState<ModelFeatures>(DEFAULT_FEATURES);
  const inputRef = useRef<HTMLInputElement>(null);

  const resolvedModel = resolveModel(features);
  const modelMeta = NER_MODELS[resolvedModel];

  const isAdvanced =
    features.language !== DEFAULT_FEATURES.language ||
    features.speed !== DEFAULT_FEATURES.speed ||
    features.focus !== DEFAULT_FEATURES.focus;

  const activeLanguage = LANGUAGE_OPTIONS.find(o => o.value === features.language)!;
  const activeSpeed = SPEED_OPTIONS.find(o => o.value === features.speed)!;
  const activeFocus = FOCUS_OPTIONS.find(o => o.value === features.focus)!;
  const activeFeatures = [activeLanguage, activeSpeed, activeFocus];

  useEffect(() => {
    onModelSelect(resolvedModel);
  }, [resolvedModel, onModelSelect]);

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

  const setLanguage = (language: Language) => setFeatures(f => ({ ...f, language }));
  const setSpeed = (speed: Speed) => setFeatures(f => ({ ...f, speed }));
  const setFocus = (focus: Focus) => setFeatures(f => ({ ...f, focus }));

  const isActive = isDragging || isHovering;

  return (
    <div className="flex flex-col overflow-hidden">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className={cn(
          'relative flex flex-row items-center gap-16 px-16 py-10 cursor-pointer select-none overflow-hidden transition-colors duration-300',
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

        <div className="w-full h-full flex flex-col gap-8">
          <div className="flex flex-col">
            <p className={cn(
              'font-extrabold text-lg tracking-wide transition-colors duration-300',
              isActive
                ? 'text-neutral-100 dark:text-neutral-900'
                : 'text-fg',
            )}>
              {isDragging ? t('dropzone.drop') : t('dropzone.idle')}
            </p>
            <p className={cn(
              'mt-4 text-xs font-semibold transition-colors duration-300',
              isActive
                ? 'text-neutral-100 dark:text-neutral-900'
                : 'text-fg'
            )}>
              {t('dropzone.steps')}
            </p>
            <ol className="mt-2 flex flex-col gap-2">
              <li className={cn(
                'text-xs transition-colors duration-300',
                isActive
                  ? 'text-neutral-100 dark:text-neutral-900'
                  : 'text-fg'
              )}>
                {t('dropzone.step1')}
              </li>
              <li className={cn(
                'text-xs transition-colors duration-300',
                isActive
                  ? 'text-neutral-100 dark:text-neutral-900'
                  : 'text-fg'
              )}>
                {t('dropzone.step2')}
              </li>
              <li className={cn(
                'text-xs transition-colors duration-300',
                isActive
                  ? 'text-neutral-100 dark:text-neutral-900'
                  : 'text-fg'
              )}>
                {t('dropzone.step3')}
              </li>
              <li className={cn(
                'text-xs transition-colors duration-300',
                isActive
                  ? 'text-neutral-100 dark:text-neutral-900'
                  : 'text-fg'
              )}>
                {t('dropzone.step4')}
              </li>
            </ol>
          </div>

          <div
            onClick={e => e.stopPropagation()}
            className={cn(
              'pl-3 border-l-2 border-accent transition-all duration-300 mt-auto',
            )}
          >
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                key={isAdvanced ? 'advanced' : 'standard'}
                className={cn(
                  'inline-flex items-center px-1.5 py-px rounded-full text-[9px] font-bold uppercase tracking-widest transition-colors duration-300',
                  isAdvanced && isActive && 'bg-accent text-white dark:bg-neutral-800/10 dark:text-accent',
                  isAdvanced && !isActive && 'bg-accent/15 text-accent',
                  !isAdvanced && isActive && 'bg-white/20 text-white/85 dark:bg-neutral-900/20 dark:text-neutral-900/75',
                  !isAdvanced && !isActive && 'bg-neutral-100 dark:bg-neutral-800 text-fg-muted',
                )}
                style={{ animation: 'fade-up 0.15s ease both' }}
              >
                {isAdvanced ? t('dropzone.advanced') : t('dropzone.standard')}
              </span>

              <span
                key={resolvedModel}
                className={cn(
                  'text-sm font-bold transition-colors duration-300',
                  isActive ? 'text-white dark:text-neutral-900' : 'text-fg',
                )}
                style={{ animation: 'fade-up 0.18s ease both' }}
              >
                {modelMeta.label}
              </span>

              <span
                key={resolvedModel + '-size'}
                className={cn(
                  'text-[11px] font-medium tabular-nums transition-colors duration-300',
                  isActive ? 'text-white/60 dark:text-neutral-700' : 'text-fg-muted',
                )}
                style={{ animation: 'fade-up 0.18s ease both' }}
              >
                {modelMeta.size}
              </span>

              <a
                href={modelMeta.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('dropzone.learnMore')}
                className={cn(
                  'transition-colors duration-200',
                  isActive
                    ? 'text-white/60 hover:text-white dark:text-neutral-600 dark:hover:text-neutral-900'
                    : 'text-accent hover:text-accent/70',
                )}
              >
                <ExternalLink size={11} />
              </a>
            </div>

            <div className="mt-1.5 flex items-center gap-1 flex-wrap">
              {activeFeatures.map((opt, i) => {
                const Icon = opt.icon;
                return (
                  <span
                    key={i}
                    className={cn(
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors duration-300',
                      isActive
                        ? 'bg-white/20 text-white/85 dark:bg-neutral-900/20 dark:text-neutral-900/75'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-fg-muted',
                    )}
                  >
                    <Icon size={10} />
                    {t(opt.labelKey)}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsAdvancedOpen(v => !v)}
        className={cn(
          'w-full flex items-center justify-center gap-1.5 px-4 py-2.5',
          'border-t border-border-theme bg-surface-subtle',
          'bg-black/5 text-xs font-medium text-fg-muted cursor-pointer',
          'hover:text-accent hover:bg-accent/5 transition-all duration-200',
        )}
      >
        {t('dropzone.advanced')}
        <ChevronDown
          size={12}
          className={cn('transition-transform duration-300', isAdvancedOpen && 'rotate-180')}
        />
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: isAdvancedOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-3 px-4 pt-3 pb-4 border-t border-border-theme bg-black/5">

            <div className="flex items-center gap-3">
              <p className="w-32 shrink-0 text-right text-xs font-bold text-fg uppercase tracking-wider">
                {t('dropzone.language')}
              </p>
              <div className="flex items-center gap-1.5 flex-wrap">
                {LANGUAGE_OPTIONS.map(opt => (
                  <FeatureChip
                    key={opt.value}
                    option={opt}
                    selected={features.language === opt.value}
                    onSelect={setLanguage}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <p className="w-32 shrink-0 text-right text-xs font-bold text-fg uppercase tracking-wider">
                {t('dropzone.speed')}
              </p>
              <div className="flex items-center gap-1.5 flex-wrap">
                {SPEED_OPTIONS.map(opt => (
                  <FeatureChip
                    key={opt.value}
                    option={opt}
                    selected={features.speed === opt.value}
                    onSelect={setSpeed}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <p className="w-32 shrink-0 text-right text-xs font-bold text-fg uppercase tracking-wider">
                {t('dropzone.focus')}
              </p>
              <div className="flex items-center gap-1.5 flex-wrap">
                {FOCUS_OPTIONS.map(opt => (
                  <FeatureChip
                    key={opt.value}
                    option={opt}
                    selected={features.focus === opt.value}
                    onSelect={setFocus}
                  />
                ))}
              </div>
            </div>

            {isAdvanced && (
              <div className="pt-1 flex justify-end">
                <Button
                  variant="ghost"
                  onClick={() => setFeatures(DEFAULT_FEATURES)}
                >
                  <RotateCcw size={11} />
                  {t('dropzone.reset')}
                </Button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
