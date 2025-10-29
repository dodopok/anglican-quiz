
import React from 'react';
import { useI18n } from '../hooks/useI18n';

const LanguageSwitcher: React.FC = () => {
  const { lang, setLang, t } = useI18n();

  const commonClasses = "px-3 py-1 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50";
  const activeClasses = "bg-purple-600 text-white";
  const inactiveClasses = "bg-gray-200 text-gray-700 hover:bg-gray-300";

  return (
    <div className="absolute top-4 right-4 flex space-x-2 no-print">
      <button 
        onClick={() => setLang('en')} 
        className={`${commonClasses} ${lang === 'en' ? activeClasses : inactiveClasses}`}
        aria-pressed={lang === 'en'}
      >
        {t('lang_en')}
      </button>
      <button 
        onClick={() => setLang('pt')} 
        className={`${commonClasses} ${lang === 'pt' ? activeClasses : inactiveClasses}`}
        aria-pressed={lang === 'pt'}
        >
        {t('lang_pt')}
      </button>
    </div>
  );
};

export default LanguageSwitcher;