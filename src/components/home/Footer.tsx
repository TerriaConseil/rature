export function Footer() {
  return (
    <footer className="border-t border-border-theme py-8">
      <div className="mx-auto max-w-300 px-6 flex flex-wrap items-center justify-center gap-3">
        <p className="text-sm text-fg/70">
          © {new Date().getFullYear()} Terria Conseil
        </p>
        <p className="text-sm text-fg/80">•</p>
        <a
          href="https://github.com/TerriaConseil/rature"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-fg/70 hover:text-fg transition-colors"
        >
          Code source
        </a>
        <p className="text-sm text-fg/80">•</p>
        <nav className="flex items-center gap-4">
          <a href="#" className="text-sm text-fg/70 hover:text-fg transition-colors">
            Politique de confidentialité
          </a>
          {/* <p className="text-xs text-fg-subtle">•</p>
          <a href="#" className="text-xs text-fg hover:text-fg-subtle transition-colors">
            Terria Conseil
          </a> */}
        </nav>
      </div>
    </footer>
  );
}
