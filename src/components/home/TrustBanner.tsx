import { Lock, Server, Cpu } from 'lucide-react';

const TRUST_ITEMS = [
  { icon: Lock, text: '100 % traitement local' },
  { icon: Server, text: 'Aucune donnée envoyée à un serveur' },
  { icon: Cpu, text: 'Propulsé par WASM & WebGPU' },
];

export function TrustBanner() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 py-4">
      {TRUST_ITEMS.map(({ icon: Icon, text }) => (
        <span
          key={text}
          className="inline-flex items-center gap-2 rounded-full border border-border-theme bg-card px-4 py-1.5 text-sm text-fg-muted"
        >
          <Icon size={14} className="text-accent shrink-0" />
          {text}
        </span>
      ))}
    </div>
  );
}
