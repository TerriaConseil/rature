import type { DetectedEntity } from '@/types/index.ts';

export const MOCK_ENTITIES: DetectedEntity[] = [
  { id: '1', text: 'Jean Dupont', type: 'person', page: 1, included: true },
  { id: '2', text: 'Marie Martin', type: 'person', page: 1, included: true },
  { id: '3', text: 'Cabinet Lefebvre & Associés', type: 'organization', page: 1, included: true },
  { id: '4', text: 'Tribunal de Commerce de Paris', type: 'organization', page: 1, included: false },
  { id: '5', text: '15 mars 2024', type: 'date', page: 1, included: true },
  { id: '6', text: 'Pierre Bernard', type: 'person', page: 2, included: true },
  { id: '7', text: '12 rue de la Paix, 75001 Paris', type: 'address', page: 2, included: true },
  { id: '8', text: '75008 Paris', type: 'address', page: 2, included: false },
  { id: '9', text: '01/01/2023', type: 'date', page: 2, included: false },
  { id: '10', text: 'N° SIRET 123 456 789 00012', type: 'id', page: 3, included: true },
  { id: '11', text: 'FR7612345678901234567890189', type: 'id', page: 3, included: true },
  { id: '12', text: '31 décembre 2024', type: 'date', page: 3, included: true },
];

export const ENTITY_META = {
  person:       { label: 'Personne',       dot: 'bg-blue-500',   badge: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',   highlight: 'bg-blue-200/60 border-b-2 border-blue-400 dark:bg-blue-800/40 dark:border-blue-500' },
  date:         { label: 'Date',           dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800', highlight: 'bg-orange-200/60 border-b-2 border-orange-400 dark:bg-orange-800/40 dark:border-orange-500' },
  address:      { label: 'Adresse',        dot: 'bg-green-500',  badge: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800',  highlight: 'bg-green-200/60 border-b-2 border-green-400 dark:bg-green-800/40 dark:border-green-500' },
  id:           { label: 'Identifiant',    dot: 'bg-purple-500', badge: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800', highlight: 'bg-purple-200/60 border-b-2 border-purple-400 dark:bg-purple-800/40 dark:border-purple-500' },
  organization: { label: 'Organisation',  dot: 'bg-amber-500',  badge: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',  highlight: 'bg-amber-200/60 border-b-2 border-amber-400 dark:bg-amber-800/40 dark:border-amber-500' },
} as const;
