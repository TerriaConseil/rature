import { Moon, Sun, FileText } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme.tsx';
import { Button } from '@/components/ui/button.tsx';
import { cn } from '@/lib/utils.ts';

interface NavbarProps {
  onUploadClick: () => void
  transparent?: boolean
}

export function Navbar({ onUploadClick, transparent = false }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full',
        transparent
          ? 'bg-transparent'
          : 'bg-surface/80 backdrop-blur-md border-b border-border-theme',
      )}
    >
      <div className="mx-auto max-w-300 px-6 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 shrink-0 group">
          <span className="flex items-center justify-center w-7 h-7 rounded-md bg-accent text-accent-foreground">
            <FileText size={15} strokeWidth={2.5} />
          </span>
          <span className="text-[17px] font-bold tracking-tight text-fg">Rature</span>
        </a>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          <a
            href="#how-it-works"
            className="px-3 py-1.5 text-sm text-fg-muted hover:text-fg transition-colors rounded-md hover:bg-surface-subtle"
          >
            Comment ça marche
          </a>
          <a
            href="#features"
            className="px-3 py-1.5 text-sm text-fg-muted hover:text-fg transition-colors rounded-md hover:bg-surface-subtle"
          >
            Fonctionnalités
          </a>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Basculer le thème"
            className="flex items-center justify-center w-9 h-9 rounded-lg text-fg-muted hover:text-fg hover:bg-surface-subtle transition-all duration-200 cursor-pointer"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <Button onClick={onUploadClick} size="md">
            Anonymiser un document
          </Button>
        </div>
      </div>
    </header>
  );
}
