
import React, { useEffect, useState, useMemo } from 'react';
import { getHistoricalFigure } from '../services/geminiService';
import type { Scores, HistoricalFigure } from '../types';
import TernaryPlot from './TernaryPlot';
import Spinner from './Spinner';
import { useI18n } from '../hooks/useI18n';

interface ResultsProps {
  scores: Scores;
  onRestart: () => void;
}

const Results: React.FC<ResultsProps> = ({ scores, onRestart }) => {
  const { t, lang, titleGrid } = useI18n();
  const [figure, setFigure] = useState<HistoricalFigure | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getTitle = useMemo(() => {
    return (category: 'catholic' | 'liberal' | 'protestant', score: number): string => {
        const titles = titleGrid[category];
        const found = titles.find(t => score >= t.scoreMin && score <= t.scoreMax);
        return found ? found.title : '';
    };
  }, [titleGrid]);

  useEffect(() => {
    const fetchFigure = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await getHistoricalFigure(scores, lang);
        setFigure(result);
      } catch (err) {
        setError(t('results.historical_figure_error'));
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFigure();
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

      <button
        onClick={onRestart}
        className="mt-8 px-8 py-3 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-700 transition-colors duration-300"
      >
        {t('results.take_again_button')}
      </button>
    </div>
  );
};

export default Results;