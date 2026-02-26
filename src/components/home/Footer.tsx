export function Footer() {
  return (
    <footer className="border-t border-border-theme py-8">
      <div className="mx-auto max-w-300 px-6 flex flex-wrap items-center justify-between gap-4">
        <a href="#">
          <span className="bg-neutral-800 text-lg font-bold tracking-tight text-neutral-100 dark:bg-neutral-200 dark:text-neutral-800 px-3 pt-0.5 pb-1 [font-variant:small-caps]">rature</span>
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
