import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const MONTHS_EN = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const MONTHS = [...MONTHS_FR, ...MONTHS_EN].join('|');
export const DATE_REGEX = new RegExp(`\\b(?:\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4}|\\d{4}[/-]\\d{1,2}[/-]\\d{1,2}|\\d{1,2}[/-]\\d{2,4}|(?:\\d{1,2})?\\s(?:${MONTHS})\\s\\d{2,4})\\b`, 'g');

// Matches Email RFC 2822
// eslint-disable-next-line no-control-regex
export const EMAIL_REGEX = new RegExp(/\b(?:[^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22(?:[^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(?:\x2e(?:[^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22(?:[^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40(?:[^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b(?:[^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(?:\x2e(?:[^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b(?:[^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*\b/, 'g');

const ID_PATTERNS = {
  iban: /\b[A-Za-z]{2}\d{2}(?:\s?[a-zA-Z0-9]{4}){4,7}(?:\s?[0-9]{3})?\b/,
  postalCode: /\b(?:\d{5}|\d{2}\s\d{3})\b/, // Code postal (FR), TOOD: other countries ?
  ssn: /\b[12][0-9]{2}(0[1-9]|1[0-2])(2[AB]|[0-9]{2})[0-9]{3}[0-9]{3}[0-9]{2}\b/, // Sécurité sociale (FR), TODO: other countries ?
  twoDigitGroups: /\b\d{2}(?:\s\d{2})+\b/g, // 2-digit groups separated by spaces: "01 02 03 04 05"
  threeDigitGroups: /\b\d{3}(?:\s\d{3})+\b/g, // 3-digit groups separated by spaces: "465 349 431"
};
// Match all groups of letters or numbers and flag them as IDs
export const ID_REGEX = new RegExp(
  Object.values(ID_PATTERNS).map((regex) => regex.source).join('|'),
  'g'
);

export const IP_ADDRESS_REGEX = new RegExp(/\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/, 'g');

export const URL_REGEX = new RegExp(/\b(?:https?:\/\/)?(?:www\.)?(?:(?:[-a-zA-Z0-9@:%._+~#=]{2,256}\.)+[a-zA-Z]{2,6})\/?(?:[/\d\w.-]*)*(?:[?])*(?:[^\s]+)*\b/, 'g');
