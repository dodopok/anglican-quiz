import React, { createContext, useState, useCallback, useMemo } from 'react';
import en from '../locales/en.json';
import pt from '../locales/pt.json';
import type { Question, TitleCategory } from '../types';

type Language = 'en' | 'pt';

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, params?: { [key: string]: string | number }) => string;
  questions: Question[];
  titleGrid: TitleCategory;
}

export const I18nContext = createContext<I18nContextType | null>(null);

const translations = { en, pt };

const getInitialLang = (): Language => {
  const browserLang = navigator.language.split('-')[0];
  return browserLang === 'pt' ? 'pt' : 'en';
};

// Helper to get nested values from JSON
const getNestedTranslation = (obj: any, key: string): string | undefined => {
    return key.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
}


export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(getInitialLang());

  const t = useCallback((key: string, params?: { [key: string]: string | number }) => {
    let translation = getNestedTranslation(translations[lang], key) || key;
    
    if (params) {
      Object.keys(params).forEach(paramKey => {
        translation = translation.replace(`{{${paramKey}}}`, String(params[paramKey]));
      });
    }
    
    return translation;
  }, [lang]);
  
  const questions = useMemo(() => translations[lang].quiz.questions as Question[], [lang]);
  const titleGrid = useMemo(() => translations[lang].title_grid as TitleCategory, [lang]);

  const value = useMemo(() => ({
    lang,
    setLang,
    t,
    questions,
    titleGrid
  }), [lang, t, questions, titleGrid]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};