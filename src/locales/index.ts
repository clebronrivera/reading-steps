import en from './en.json';
import es from './es.json';
import pt from './pt.json';

export type Language = 'en' | 'es' | 'pt';

export type TranslationKeys = typeof en;

// Deep merge function to fill missing keys from English
function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result = { ...source };
  for (const key of Object.keys(target)) {
    if (target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
      result[key] = deepMerge(
        target[key] as Record<string, unknown>,
        (source[key] as Record<string, unknown>) || {}
      );
    } else if (target[key] !== undefined && (source[key] === undefined || source[key] === null || 
      (typeof source[key] === 'object' && Object.keys(source[key] as object).length === 0))) {
      result[key] = target[key];
    }
  }
  return result;
}

// Merge translations with English as fallback
const mergedEs = deepMerge(en as Record<string, unknown>, es as Record<string, unknown>) as TranslationKeys;
const mergedPt = deepMerge(en as Record<string, unknown>, pt as Record<string, unknown>) as TranslationKeys;

export const translations: Record<Language, TranslationKeys> = {
  en: en as TranslationKeys,
  es: mergedEs,
  pt: mergedPt,
};

export function getTranslation(lang: Language): TranslationKeys {
  return translations[lang];
}

export const languageOptions: { value: Language; label: string; flag: string }[] = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
  { value: 'pt', label: 'Português', flag: '🇧🇷' },
];
