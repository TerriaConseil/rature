import { FileText } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border-theme py-8">
      <div className="mx-auto max-w-300 px-6 flex flex-wrap items-center justify-between gap-4">
        <a href="#" className="flex items-center gap-2 text-fg-muted hover:text-fg transition-colors">
          <span className="flex items-center justify-center w-6 h-6 rounded-[5px] bg-accent text-accent-foreground">
            <FileText size={13} strokeWidth={2.5} />
          </span>
          <span className="text-sm font-semibold">Rature</span>
        </a>

        <p className="text-xs text-fg-subtle">
          © {new Date().getFullYear()} Terria Conseil. Tous droits réservés.
        </p>

        <nav className="flex items-center gap-4">
          <a href="#" className="text-xs text-fg-subtle hover:text-fg-muted transition-colors">
            Politique de confidentialité
          </a>
          <a href="#" className="text-xs text-fg-subtle hover:text-fg-muted transition-colors">
            Terria Conseil
          </a>
        </nav>
      </div>
    </footer>
  );
}
