import en from './en.json';
import es from './es.json';
import pt from './pt.json';

export type Language = 'en' | 'es' | 'pt';

export const translations = {
  en,
  es,
  pt,
} as const;

export type TranslationKeys = typeof en;

export function getTranslation(lang: Language): TranslationKeys {
  return translations[lang];
}

export const languageOptions: { value: Language; label: string; flag: string }[] = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
  { value: 'pt', label: 'Português', flag: '🇧🇷' },
];
