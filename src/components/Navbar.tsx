import { Info, Moon, Settings, Sun, Upload } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme.tsx';

export function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-8 left-1/2 -translate-x-1/2 z-50 max-w-4xl px-4 shadow-card">
      <div className="flex items-center gap-2 rounded-2xl border border-border-theme bg-card/80 backdrop-blur-xl px-4 py-2.5 shadow-lg">
        <a href="#" className="h-14 flex items-center gap-2 mr-4 shrink-0 group">
          <span className="bg-black text-4xl font-bold tracking-tight text-white px-4 pt-0.5 pb-1.5 [font-variant:small-caps]">rature</span>
        </a>

        <nav className="hidden md:flex items-center gap-1">
          <a
            href="/"
            className="p-3 h-full flex flex-1 items-center gap-3 text-sm text-fg-muted hover:text-fg transition-colors hover:bg-surface-subtle"
          >
            <Upload size="24" className='shrink-0' />
            <span className="font-medium hidden md:flex min-w-0">Anonymiser</span>
          </a>
          <a
            href="/settings"
            className="p-3 h-full flex flex-1 items-center gap-3 text-sm text-fg-muted hover:text-fg transition-colors hover:bg-surface-subtle"
          >
            <Settings size="24" className='shrink-0' />
            <span className="font-medium hidden md:flex min-w-0">Paramètres</span>
          </a>
          <a
            href="/about-us"
            className="p-3 h-full flex flex-1 items-center gap-3 text-sm text-fg-muted hover:text-fg transition-colors hover:bg-surface-subtle"
          >
            <Info size="24" className='shrink-0' />
            <span className="font-medium hidden md:flex min-w-0">À propos</span>
          </a>
        </nav>

        <div className="h-10 w-0.5 bg-gray-200 rounded-lg" />

        <div>
          <button
            onClick={toggleTheme}
            aria-label="Basculer le thème"
            className="flex items-center justify-center w-12 h-12 rounded-lg text-fg-muted hover:text-fg hover:bg-surface-subtle transition-all duration-200 cursor-pointer"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
