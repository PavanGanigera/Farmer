import React, { createContext, useContext, useState } from 'react';
import translations from '../utils/translations';

const LanguageContext = createContext(null);

const LANG_KEY = 'agrismart_lang';

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem(LANG_KEY) || 'en');

  const switchLang = (code) => {
    localStorage.setItem(LANG_KEY, code);
    setLang(code);
  };

  // t('key') returns translated string; falls back to English
  const t = (key) =>
    translations[lang]?.[key] ?? translations['en']?.[key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, switchLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
