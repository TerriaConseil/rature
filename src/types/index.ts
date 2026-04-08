export const CUSTOM_ENTITY_TYPES = ['R-EMAIL', 'R-DATE', 'R-URL', 'R-ID', 'R-IP'] as const;

export interface NERPipelineEntity {
  entity: string;
  score: number;
  index: number;
  word: string;
  start?: number;
  end?: number;
};

export interface CustomEntity {
  type: typeof CUSTOM_ENTITY_TYPES[number];
  word: string;
};

export interface GroupedEntity {
  id: string;
  text: string;
  type: string;
  score: number;
  page: number;
  start: number;
  end: number;
  included: boolean;
};

export interface DetectedImage {
  id: string;
  page: number;
  rect: [number, number, number, number];
  width: number;
  height: number;
  fingerprint: string;
  included: boolean;
}

export type ImageRedactionMethod = 'none' | 'pixels' | 'remove';

export type WorkflowMode = 'edition' | 'preview';
