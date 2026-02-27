import type { ReactNode } from 'react';

import { usePdfProcessing } from '@/hooks/usePdfProcessing.ts';
import { NER_MODELS, type NERModel } from '@/models/utils.ts';
import type { GroupedEntity } from '@/types/index.ts';
import { useAnonymization } from '@/hooks/useAnonymization.ts';
import { cn } from '@/lib/utils.ts';

type CreateTextPartsParams = {
  model: NERModel;
  text: string;
  textOffset: number;
  entities: GroupedEntity[];
  highlightedEntityId: string | null;
  onEntityClick: (id: string) => void;
};

const createTextParts = ({
  model,
  text,
  textOffset,
  entities,
  highlightedEntityId,
  onEntityClick,
}: CreateTextPartsParams) => {
  const textParts: ReactNode[] = [];
  const parsedText = text.replaceAll(/\n/g, ' ').replaceAll(/\s+/g, ' ');
  let cursor = 0;

  for (const entity of entities) {
    if (!entity.text) continue;

    const start = entity.start - textOffset;

    if (cursor < start) {
      textParts.push(
        <span
          key={crypto.randomUUID()}
          data-offset={cursor + textOffset}
        >
          {parsedText.slice(cursor, start)}
        </span>
      );
    }

    const meta = NER_MODELS[model].entities[entity.type];
    const isSelected = !!highlightedEntityId && highlightedEntityId === entity.id;
    const isIncluded = entity.included;

    textParts.push(
      <span
        key={entity.id}
        onClick={() => onEntityClick(entity.id)}
        className={cn(
          'inline cursor-pointer px-0.5 transition-all duration-150',
          isIncluded ? meta.highlight : 'border-b-2 border-gray-400 dark:border-gray-500',
          isSelected && 'ring-2 ring-offset-1 ring-accent',
        )}
      >
        {entity.text}
      </span>
    );

    cursor = entity.end;
  }

  if (cursor < parsedText.length) {
    textParts.push(<span key="tail" data-offset={cursor + textOffset}>{parsedText.slice(cursor)}</span>);
  }

  return textParts;
};

interface PDFViewerProps {
  currentPage: number;
  entities: GroupedEntity[];
  selectedEntityId: string | null;
  onEntityClick: (id: string) => void;
}

export function PDFViewer({ currentPage, entities, selectedEntityId, onEntityClick }: PDFViewerProps) {
  const { modelName } = useAnonymization();
  const { extractedText } = usePdfProcessing();

  const pageContent = extractedText[currentPage] ?? extractedText[0];
  const pageEntities = entities.filter(e => e.page === currentPage).sort((a, b) => a.start - b.start);

  const textParts = createTextParts({
    model: modelName,
    text: pageContent.text,
    textOffset: pageContent.offset,
    entities: pageEntities,
    highlightedEntityId: selectedEntityId,
    onEntityClick,
  });

  return (
    <div className="flex-1 overflow-auto bg-surface-subtle flex justify-center py-8 px-4">
      <div
        className="bg-white dark:bg-[#2a2a36] rounded-lg shadow-lg w-full max-w-2xl min-h-210.5 p-12 relative"
        style={{ boxShadow: '0 4px 32px rgb(0 0 0 / 0.12)' }}
      >
        <div className="absolute top-3 right-4 text-[10px] text-gray-400 tabular-nums">
          Page {currentPage}
        </div>

        <div className="font-mono text-[13px] leading-[1.9] text-gray-800 dark:text-gray-200 space-y-0">
          {textParts}
        </div>
      </div>
    </div>
  );
}
