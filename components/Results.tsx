import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { getHistoricalFigure } from '../services/geminiService';
import type { Scores, HistoricalFigure } from '../types';
import TernaryPlot from './TernaryPlot';
import Spinner from './Spinner';
import { useI18n } from '../hooks/useI18n';
import { bookCoverBase64 } from '../assets/bookCover';

interface ResultsProps {
  scores: Scores;
  onRestart: () => void;
}

// FIX: Defined BookAd component here to avoid creating a new file and resolve dependency.
const BookAd: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="mt-8 w-full bg-stone-100 p-6 rounded-lg border border-stone-200 no-print">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex-shrink-0">
          <a href="https://loja.uiclap.com/titulo/ua123620" target="_blank" rel="noopener noreferrer">
            <img 
              src={bookCoverBase64} 
              alt={t('book_ad.alt_text')} 
              className="rounded-md shadow-lg w-32 md:w-40 h-auto transform hover:scale-105 transition-transform duration-300" 
            />
          </a>
        </div>
        <div className="text-center md:text-left">
          <h3 className="text-xl font-bold text-gray-800">{t('book_ad.title')}</h3>
          <p className="mt-2 text-gray-600">{t('book_ad.description')}</p>
          <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
            <a 
              href="https://loja.uiclap.com/titulo/ua123620" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-gray-800 text-white font-bold text-sm rounded-full hover:bg-gray-900 transition-colors duration-300"
            >
              {t('book_ad.button_physical')}
            </a>
            <a 
              href="https://amzn.to/4o86ifQ" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-yellow-500 text-gray-900 font-bold text-sm rounded-full hover:bg-yellow-600 transition-colors duration-300"
            >
              {t('book_ad.button_ebook')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};


const Results: React.FC<ResultsProps> = ({ scores, onRestart }) => {
  const { t, lang, titleGrid } = useI18n();
  const [figure, setFigure] = useState<HistoricalFigure | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const getTitle = useMemo(() => {
    return (category: 'catholic' | 'liberal' | 'protestant', score: number): string => {
        const titles = titleGrid[category];
        const found = titles.find(t => score >= t.scoreMin && score <= t.scoreMax);
        return found ? found.title : '';
    };
  }, [titleGrid]);

  useEffect(() => {
    let ignore = false;

    const fetchFigure = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await getHistoricalFigure(scores, lang);
        if (!ignore) {
            setFigure(result);
        }
      } catch (err) {
        if (!ignore) {
            setError(t('results.historical_figure_error'));
            console.error(err);
        }
      } finally {
        if (!ignore) {
            setIsLoading(false);
        }
      }
    };
    
    fetchFigure();

    return () => {
      ignore = true;
    };
  }, [scores, lang, t]);
  
  const generatedTitle = useMemo(() => {
    const sortedScores = Object.entries(scores).sort(([, a], [, b]) => b - a);
    const [primary, secondary] = sortedScores;
    
    const noun = getTitle(primary[0] as keyof Scores, primary[1]);
    const adjective = getTitle(secondary[0] as keyof Scores, secondary[1]);

    if(adjective.toLowerCase().includes('purely-inclined') || adjective.toLowerCase().includes('puramente-inclinado')) {
        return t('results.pure_title_template', { noun });
    }

    return t('results.adjective_title_template', { adjective, noun });
  }, [scores, getTitle, t]);

  const handleTwitterShare = useCallback(() => {
    const text = t('results.share_text', { title: generatedTitle });
    const url = window.location.href;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  }, [t, generatedTitle]);

  const handleFacebookShare = useCallback(() => {
    const url = window.location.href;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'noopener,noreferrer');
  }, []);

  const handleCopy = useCallback(async () => {
    const textToCopy = t('results.copy_text', { title: generatedTitle, url: window.location.href });
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }, [generatedTitle, t]);


  return (
    <div className="flex flex-col items-center animate-fade-in">
      <h2 className="text-2xl font-bold mb-4">{t('results.title')}</h2>
      
      <div className="w-full flex flex-col md:flex-row gap-8 items-center">
        <div className="w-full md:w-1/2">
           <TernaryPlot scores={scores} />
        </div>
        <div className="w-full md:w-1/2 flex flex-col gap-4 text-center md:text-left">
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg">
                <p className="font-bold">{t('results.catholic_score')}: {scores.catholic}</p>
            </div>
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-r-lg">
                <p className="font-bold">{t('results.liberal_score')}: {scores.liberal}</p>
            </div>
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-r-lg">
                <p className="font-bold">{t('results.protestant_score')}: {scores.protestant}</p>
            </div>
        </div>
      </div>

      <div className="mt-8 text-center bg-gray-50 p-6 rounded-lg w-full">
        <h3 className="text-lg font-semibold text-gray-600">{t('results.your_title_is')}</h3>
        <p className="text-2xl font-bold text-purple-700 my-2">{generatedTitle}</p>
      </div>

      <div className="mt-6 text-left bg-gray-50 p-6 rounded-lg w-full">
        <h3 className="text-lg font-semibold text-gray-600 mb-2 text-center">{t('results.historical_figure_title')}</h3>
        {isLoading && <div className="flex justify-center items-center h-24"><Spinner /></div>}
        {error && <p className="text-red-500 text-center">{error}</p>}
        {figure && (
          <div className="text-center">
            <h4 className="text-xl font-bold text-purple-700">{figure.name}</h4>
            <p className="mt-2 text-gray-700">{figure.explanation}</p>
          </div>
        )}
      </div>

      {lang === 'pt' && <BookAd />}

      <div className="mt-8 flex flex-col items-center gap-6 w-full no-print">
        <button
          onClick={onRestart}
          className="px-8 py-3 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-700 transition-colors duration-300 w-full sm:w-auto"
        >
          {t('results.take_again_button')}
        </button>
      
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleTwitterShare}
            aria-label={t('results.share_on_twitter')}
            className="p-3 bg-gray-200 rounded-full text-gray-700 hover:bg-gray-300 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </button>
          <button
            onClick={handleFacebookShare}
            aria-label={t('results.share_on_facebook')}
            className="p-3 bg-gray-200 rounded-full text-gray-700 hover:bg-gray-300 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
          </button>
          <button
            onClick={handleCopy}
            className="px-6 py-3 bg-gray-700 text-white font-bold rounded-full hover:bg-gray-800 transition-colors duration-300 text-sm"
          >
            {copied ? t('results.copied_button') : t('results.copy_button')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;