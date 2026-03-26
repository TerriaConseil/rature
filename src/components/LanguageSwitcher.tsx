import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils.ts';
import { Button } from '@/components/ui/button.tsx';

const LANGUAGES = [
  { code: 'fr', label: 'FR', flag: '🇫🇷', name: 'Français' },
  { code: 'en', label: 'EN', flag: '🇬🇧', name: 'English' },
] as const;

interface LanguageSwitcherProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export function LanguageSwitcher({ variant = 'compact', className }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language.startsWith('fr') ? 'fr' : 'en';

  const handleSwitch = (code: string) => {
    void i18n.changeLanguage(code);
  };

  if (variant === 'full') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {LANGUAGES.map((lang) => (
          <Button
            key={lang.code}
            size="lg"
            variant={currentLang === lang.code ? 'primary' : 'secondary'}
            onClick={() => handleSwitch(lang.code)}
            aria-label={lang.name}
            className="w-full flex-1 transition-all"
          >
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg border border-border-theme bg-card overflow-hidden',
        className,
      )}
      role="group"
      aria-label="Language switcher"
    >
      {LANGUAGES.map((lang, idx) => (
        <button
          key={lang.code}
          onClick={() => handleSwitch(lang.code)}
          aria-pressed={currentLang === lang.code}
          aria-label={lang.name}
          className={cn(
            'relative flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer select-none',
            currentLang === lang.code
              ? 'bg-accent text-white'
              : 'text-fg/50 hover:text-fg',
            idx === 0 && 'pr-2',
            idx === 1 && 'pl-2',
          )}
        >
          <span className="text-[10px] leading-none">{lang.flag}</span>
          <span>{lang.label}</span>
        </button>
      ))}
    </div>
  );
}
