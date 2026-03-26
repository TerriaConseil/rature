import { Globe, Languages, Zap, Scale, Target, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import i18n from '@/lib/i18n.ts';
import type { NERModel } from '@/models/utils.ts';

export type Language = 'english' | 'french' | 'multilingual';
export type Speed = 'fast' | 'balanced' | 'accurate';
export type Focus = 'general' | 'pii';

export interface ModelFeatures {
  language: Language;
  speed: Speed;
  focus: Focus;
}

export const DEFAULT_FEATURES: ModelFeatures = {
  language: i18n.language === 'fr' ? 'french' : 'english',
  speed: 'balanced',
  focus: 'pii',
};

export function resolveModel(features: ModelFeatures): NERModel {
  const { language, speed, focus } = features;

  if (language === 'multilingual' || speed === 'fast') {
    return 'distilbertBaseMultiCasedNer';
  }

  if (language === 'english') {
    return 'bertBaseNer';
  }

  // French from here
  if (speed === 'accurate') {
    return 'nermembertLarge4Entities';
  }

  if (focus === 'pii') {
    return 'camembertNerPii';
  }

  return 'nermemberta4Entities';
}

export interface FeatureOption<T> {
  value: T;
  labelKey: string;
  icon: LucideIcon;
}

export const LANGUAGE_OPTIONS: FeatureOption<Language>[] = [
  { value: 'english', labelKey: 'dropzone.lang_english', icon: Languages },
  { value: 'french', labelKey: 'dropzone.lang_french', icon: Languages },
  { value: 'multilingual', labelKey: 'dropzone.lang_multilingual', icon: Globe },
];

export const SPEED_OPTIONS: FeatureOption<Speed>[] = [
  { value: 'fast', labelKey: 'dropzone.speed_fast', icon: Zap },
  { value: 'balanced', labelKey: 'dropzone.speed_balanced', icon: Scale },
  { value: 'accurate', labelKey: 'dropzone.speed_accurate', icon: Target },
];

export const FOCUS_OPTIONS: FeatureOption<Focus>[] = [
  { value: 'general', labelKey: 'dropzone.focus_general', icon: Target },
  { value: 'pii', labelKey: 'dropzone.focus_pii', icon: ShieldCheck },
];
