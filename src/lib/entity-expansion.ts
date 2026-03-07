import type { TextExtract } from '@/context/pdfProcessing.tsx';
import type { GroupedEntity } from '@/types/index.ts';

export type EntityMatch = {
  page: number;
  start: number;
  end: number;
  text: string;
};

function isWordBoundary(pageText: string, start: number, end: number): boolean {
  const before = start === 0 || /\W/.test(pageText[start - 1]);
  const after = end === pageText.length || /\W/.test(pageText[end]);
  return before && after;
}

/**
 * Finds all occurrences of `searchText` across all pages, skipping positions
 * that already overlap with an existing entity.
 */
export function findAllOccurrences(
  searchText: string,
  pages: TextExtract[],
  existingEntities: GroupedEntity[],
): EntityMatch[] {
  const results: EntityMatch[] = [];

  const searchLower = searchText.toLowerCase();

  for (const { page, text: pageText } of pages) {
    const pageTextLower = pageText.toLowerCase();
    let searchFrom = 0;

    while (searchFrom < pageText.length) {
      const pos = pageTextLower.indexOf(searchLower, searchFrom);
      if (pos === -1) break;

      const end = pos + searchText.length;

      if (isWordBoundary(pageText, pos, end)) {
        const overlaps = existingEntities.some(
          e => e.page === page && e.start < end && e.end > pos,
        );

        if (!overlaps) {
          results.push({ page, start: pos, end, text: pageText.slice(pos, end) });
        }
      }

      searchFrom = pos + 1;
    }
  }

  return results.sort((a, b) => a.page - b.page || a.start - b.start);
}
