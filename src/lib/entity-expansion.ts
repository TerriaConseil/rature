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

/**
 * Attempts to apply a character-offset delta to a sibling entity's span.
 * Returns null if the result would be out of bounds, empty, or overlap another entity.
 *
 * @param entity       The sibling entity to expand/contract.
 * @param deltaStart   Chars to add to the left (entity.start decreases by this amount).
 * @param deltaEnd     Chars to add to the right (entity.end increases by this amount).
 * @param pageText     Full text of the page this entity lives on.
 * @param allEntities  All entities (used for overlap detection; the sibling itself is excluded).
 */
export function tryApplyExpansionDelta(
  entity: GroupedEntity,
  deltaStart: number,
  deltaEnd: number,
  pageText: string,
  allEntities: GroupedEntity[],
): { start: number; end: number; text: string } | null {
  const newStart = entity.start - deltaStart;
  const newEnd = entity.end + deltaEnd;

  if (newStart < 0 || newEnd > pageText.length || newStart >= newEnd) return null;

  const newText = pageText.slice(newStart, newEnd);
  if (!newText.trim()) return null;

  const overlaps = allEntities.some(
    other =>
      other.id !== entity.id &&
      other.page === entity.page &&
      other.start < newEnd &&
      other.end > newStart,
  );
  if (overlaps) return null;

  return { start: newStart, end: newEnd, text: newText };
}
