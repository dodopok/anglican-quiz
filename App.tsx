
import React, { useState, useCallback } from 'react';
import type { Scores } from './types';
import Quiz from './components/Quiz';
import Results from './components/Results';
import LanguageSwitcher from './components/LanguageSwitcher';
import { useI18n } from './hooks/useI18n';

function App() {
  const { t, questions, lang } = useI18n();
  const [scores, setScores] = useState<Scores>({ catholic: 0, liberal: 0, protestant: 0 });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleAnswer = useCallback((answerScores: Scores) => {
    setScores(prevScores => ({
      catholic: prevScores.catholic + answerScores.catholic,
      liberal: prevScores.liberal + answerScores.liberal,
      protestant: prevScores.protestant + answerScores.protestant,
    }));

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      setQuizCompleted(true);
    }
  }, [currentQuestionIndex, questions.length]);

  const handleRestart = useCallback(() => {
    setScores({ catholic: 0, liberal: 0, protestant: 0 });
    setCurrentQuestionIndex(0);
    setQuizCompleted(false);
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen text-gray-800 flex flex-col items-center justify-center p-4 main-container">
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-10 transition-all duration-500 relative content-card">
        <LanguageSwitcher />
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{t('app_title')}</h1>
          <p className="text-gray-600 mt-2">{t('app_subtitle')}</p>
        </header>
        <main>
          {quizCompleted ? (
            <Results scores={scores} onRestart={handleRestart} />
          ) : (
            <Quiz
              question={questions[currentQuestionIndex]}
              onAnswer={handleAnswer}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
            />
          )}
        </main>
      </div>
       <footer className="text-center mt-6 text-gray-500 text-sm no-print">
        <p>{t('app_footer')}</p>
      </footer>
    </div>
  );
}

export default App;