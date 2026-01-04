import { useState, useCallback } from 'react';
import { Language, getTranslation, TranslationKeys } from '@/locales';

export function useLanguage(defaultLang: Language = 'en') {
  const [language, setLanguage] = useState<Language>(() => {
    // Check URL params first
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang') as Language;
    if (langParam && ['en', 'es', 'pt'].includes(langParam)) {
      return langParam;
    }
    
    // Check localStorage
    const saved = localStorage.getItem('preferred-language') as Language;
    if (saved && ['en', 'es', 'pt'].includes(saved)) {
      return saved;
    }
    
    // Check browser language
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'es') return 'es';
    if (browserLang === 'pt') return 'pt';
    
    return defaultLang;
  });

  const t = getTranslation(language);

  const changeLanguage = useCallback((newLang: Language) => {
    setLanguage(newLang);
    localStorage.setItem('preferred-language', newLang);
  }, []);

  return {
    language,
    setLanguage: changeLanguage,
    t,
  };
}
