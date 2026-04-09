// Stub — full implementation in Step 6
import type { WorkflowMode } from '@/types/index.ts';

export interface RepeatedImageModalProps {
  open: boolean;
  thumbnail: string | undefined;
  duplicateCount: number;
  onClose: () => void;
  onThisOnly: () => void;
  onAllOccurrences: () => void;
}

// Suppress unused import warning from WorkflowMode until Step 6 replaces this file
export type { WorkflowMode as _Unused };

export function RepeatedImageModal(_props: RepeatedImageModalProps) {
  return null;
}
