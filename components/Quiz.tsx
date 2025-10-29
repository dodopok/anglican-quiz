import React, { useEffect } from 'react';
import type { Question, Scores } from '../types';
import { useI18n } from '../hooks/useI18n';

interface QuizProps {
  question: Question;
  onAnswer: (scores: Scores) => void;
  onBack: () => void;
  questionNumber: number;
  totalQuestions: number;
}

const Quiz: React.FC<QuizProps> = ({ question, onAnswer, onBack, questionNumber, totalQuestions }) => {
  const { t } = useI18n();
  const progress = (questionNumber / totalQuestions) * 100;

  useEffect(() => {
    // Quando uma nova pergunta é renderizada, remove o foco do elemento ativo.
    // Isso impede que o navegador foque automaticamente em um novo botão
    // na mesma posição daquele que acabou de ser clicado.
    if (document.activeElement && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, [question]);

  return (
    <div className="flex flex-col items-center">
      <div className="w-full mb-6">
        <div className="flex justify-between mb-1 text-sm text-gray-600">
          <span>{t('quiz.question_of_total', { current: questionNumber, total: totalQuestions })}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
      <h2 className="text-xl md:text-2xl font-semibold text-center mb-8">{question.text}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onAnswer(option.scores)}
            className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg text-left hover:bg-purple-100 hover:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-colors duration-200"
          >
            {option.text}
          </button>
        ))}
      </div>

      <div className="mt-8 w-full flex justify-center">
        {questionNumber > 1 && (
          <button
            onClick={onBack}
            className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-300 transition-colors duration-200"
          >
            {t('quiz.back_button')}
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;