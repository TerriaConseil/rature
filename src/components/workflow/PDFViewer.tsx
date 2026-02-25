import { ENTITY_META } from '@/data/mockEntities.ts';
import type { DetectedEntity } from '@/types/index.ts';
import { cn } from '@/lib/utils.ts';

interface PDFViewerProps {
  currentPage: number
  entities: DetectedEntity[]
  selectedEntityId: string | null
  onEntityClick: (id: string) => void
}

// Mock PDF page content with fake text lines and entity positions
const PAGE_CONTENT: Record<number, { lines: string[]; highlights: { text: string; entityId: string; lineIndex: number; charStart: number }[] }> = {
  1: {
    lines: [
      'CONTRAT DE PRESTATION DE SERVICES',
      '',
      'Entre les soussignés :',
      '',
      'Maître Jean Dupont, avocat au Barreau de Paris,',
      'membre du Cabinet Lefebvre & Associés,',
      'ci-après dénommé « le Prestataire »,',
      '',
      'Et',
      '',
      'Madame Marie Martin, directrice juridique,',
      'ci-après dénommée « le Client »,',
      '',
      'Il a été convenu ce qui suit en date du 15 mars 2024,',
      'devant le Tribunal de Commerce de Paris.',
      '',
      'Article 1 — Objet du contrat',
      '',
      'Le présent contrat a pour objet de définir les conditions',
      'dans lesquelles le Prestataire s\'engage à fournir au Client',
      'des services de conseil juridique en matière de conformité.',
    ],
    highlights: [
      { text: 'Jean Dupont', entityId: '1', lineIndex: 4, charStart: 8 },
      { text: 'Cabinet Lefebvre & Associés', entityId: '3', lineIndex: 5, charStart: 10 },
      { text: 'Marie Martin', entityId: '2', lineIndex: 10, charStart: 9 },
      { text: '15 mars 2024', entityId: '5', lineIndex: 13, charStart: 42 },
      { text: 'Tribunal de Commerce de Paris', entityId: '4', lineIndex: 14, charStart: 10 },
    ],
  },
  2: {
    lines: [
      'Article 2 — Durée et conditions',
      '',
      'Monsieur Pierre Bernard, représentant légal,',
      'domicilié au 12 rue de la Paix, 75001 Paris,',
      'code postal 75008 Paris,',
      '',
      'Le présent contrat est conclu pour une durée déterminée',
      'à compter du 01/01/2023 jusqu\'à expiration des délais légaux.',
      '',
      'Article 3 — Rémunération',
      '',
      'Les honoraires convenus entre les parties s\'élèvent',
      'à un montant forfaitaire défini en annexe confidentielle.',
      '',
      'Article 4 — Confidentialité',
      '',
      'Les parties s\'engagent à maintenir la stricte confidentialité',
      'de toutes les informations échangées dans le cadre du présent',
      'contrat, conformément aux dispositions légales en vigueur.',
    ],
    highlights: [
      { text: 'Pierre Bernard', entityId: '8', lineIndex: 2, charStart: 10 },
      { text: '12 rue de la Paix, 75001 Paris', entityId: '7', lineIndex: 3, charStart: 14 },
      { text: '75008 Paris', entityId: '9', lineIndex: 4, charStart: 14 },
      { text: '01/01/2023', entityId: '6', lineIndex: 7, charStart: 24 },
    ],
  },
  3: {
    lines: [
      'Article 5 — Identification des parties',
      '',
      'Numéro d\'identification fiscale :',
      'N° SIRET 123 456 789 00012',
      '',
      'Référence bancaire internationale :',
      'FR7612345678901234567890189',
      '',
      'Le présent contrat prend fin le 31 décembre 2024.',
      '',
      'Article 6 — Litiges',
      '',
      'En cas de litige, les parties conviennent de recourir',
      'à une procédure de médiation avant toute action en justice.',
      '',
      'Fait en deux exemplaires originaux,',
      'le présent jour à Paris.',
      '',
      'Signatures des parties',
      '_______________________          _______________________',
    ],
    highlights: [
      { text: 'N° SIRET 123 456 789 00012', entityId: '10', lineIndex: 3, charStart: 0 },
      { text: 'FR7612345678901234567890189', entityId: '11', lineIndex: 6, charStart: 0 },
      { text: '31 décembre 2024', entityId: '12', lineIndex: 8, charStart: 30 },
    ],
  },
};

export function PDFViewer({ currentPage, entities, selectedEntityId, onEntityClick }: PDFViewerProps) {
  const content = PAGE_CONTENT[currentPage] ?? PAGE_CONTENT[1];
  const pageEntities = entities.filter(e => e.page === currentPage);

  const getEntityForHighlight = (entityId: string) =>
    pageEntities.find(e => e.id === entityId);

  return (
    <div className="flex-1 overflow-auto bg-surface-subtle flex justify-center py-8 px-4">
      {/* PDF page mock */}
      <div
        className="bg-white dark:bg-[#2a2a36] rounded-lg shadow-lg w-full max-w-2xl min-h-[842px] p-12 relative"
        style={{ boxShadow: '0 4px 32px rgb(0 0 0 / 0.12)' }}
      >
        {/* Page number indicator */}
        <div className="absolute top-3 right-4 text-[10px] text-gray-400 tabular-nums">
          Page {currentPage}
        </div>

        {/* Mock PDF text content */}
        <div className="font-mono text-[13px] leading-[1.9] text-gray-800 dark:text-gray-200 space-y-0">
          {content.lines.map((line, lineIdx) => {
            const highlight = content.highlights.find(h => h.lineIndex === lineIdx);

            if (!highlight) {
              return (
                <div key={lineIdx} className={cn(lineIdx === 0 && 'font-bold text-center text-base mb-2')}>
                  {line || '\u00A0'}
                </div>
              );
            }

            const entity = getEntityForHighlight(highlight.entityId);
            if (!entity) {
              return <div key={lineIdx}>{line || '\u00A0'}</div>;
            }

            const meta = ENTITY_META[entity.type];
            const before = line.substring(0, highlight.charStart);
            const after = line.substring(highlight.charStart + highlight.text.length);
            const isSelected = selectedEntityId === entity.id;
            const isIncluded = entity.included;

            return (
              <div key={lineIdx}>
                {before}
                <span
                  onClick={() => onEntityClick(entity.id)}
                  title={`${meta.label} — cliquer pour sélectionner`}
                  className={cn(
                    'inline cursor-pointer rounded-sm px-0.5 transition-all duration-150',
                    isIncluded ? meta.highlight : 'bg-gray-200/60 dark:bg-gray-700/40 border-b-2 border-gray-400 dark:border-gray-500',
                    isSelected && 'ring-2 ring-offset-1 ring-accent',
                    !isIncluded && 'opacity-50',
                  )}
                >
                  {isIncluded ? highlight.text : '█'.repeat(Math.ceil(highlight.text.length * 0.7))}
                </span>
                {after}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
