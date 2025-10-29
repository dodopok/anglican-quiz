
import React, { useState, useCallback, useMemo } from 'react';
import type { Scores } from './types';
import Quiz from './components/Quiz';
import Results from './components/Results';
import LanguageSwitcher from './components/LanguageSwitcher';
import { useI18n } from './hooks/useI18n';
import { Analytics } from "@vercel/analytics/react"

// Fisher-Yates shuffle algorithm to randomize array elements
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function App() {
  const { t, questions, lang } = useI18n();
  const [scores, setScores] = useState<Scores>({ catholic: 0, liberal: 0, protestant: 0 });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizAttempt, setQuizAttempt] = useState(0); // Used to trigger re-shuffle on restart
  const [answersHistory, setAnswersHistory] = useState<Scores[]>([]); // To track answers for the back button

  // Memoize the shuffled questions to prevent re-shuffling on every render.
  // It re-shuffles when the language changes or when a new quiz is started.
  const shuffledQuestions = useMemo(() => {
    return questions.map(question => ({
      ...question,
      options: shuffleArray(question.options),
    }));
  }, [questions, quizAttempt]);


  const handleAnswer = useCallback((answerScores: Scores) => {
    setScores(prevScores => ({
      catholic: prevScores.catholic + answerScores.catholic,
      liberal: prevScores.liberal + answerScores.liberal,
      protestant: prevScores.protestant + answerScores.protestant,
    }));
    setAnswersHistory(prevHistory => [...prevHistory, answerScores]);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      setQuizCompleted(true);
    }
  }, [currentQuestionIndex, questions.length]);

  const handleBack = useCallback(() => {
    if (currentQuestionIndex > 0) {
      const lastAnswerScores = answersHistory[answersHistory.length - 1];
      
      setScores(prevScores => ({
        catholic: prevScores.catholic - lastAnswerScores.catholic,
        liberal: prevScores.liberal - lastAnswerScores.liberal,
        protestant: prevScores.protestant - lastAnswerScores.protestant,
      }));

      setAnswersHistory(prevHistory => prevHistory.slice(0, -1));
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
    }
  }, [currentQuestionIndex, answersHistory]);

  const handleRestart = useCallback(() => {
    setScores({ catholic: 0, liberal: 0, protestant: 0 });
    setCurrentQuestionIndex(0);
    setQuizCompleted(false);
    setQuizAttempt(prev => prev + 1); // Trigger a re-shuffle for the new quiz
    setAnswersHistory([]);
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen text-gray-800 flex flex-col items-center justify-center p-4 main-container">
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-10 transition-all duration-500 relative content-card">
        <LanguageSwitcher />
        {!quizCompleted && (
            <header className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{t('app_title')}</h1>
              <p className="text-gray-600 mt-2">{t('app_subtitle')}</p>
            </header>
        )}
        <main>
          {quizCompleted ? (
            <Results scores={scores} onRestart={handleRestart} />
          ) : (
            <Quiz
              question={shuffledQuestions[currentQuestionIndex]}
              onAnswer={handleAnswer}
              onBack={handleBack}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
            />
          )}
        </main>
      </div>
       <footer className="text-center mt-6 text-gray-500 text-sm no-print">
        <p>{t('app_footer')}</p>
      </footer>
      <div className="text-center mt-2 text-gray-500 text-xs no-print">
        <a 
          href="https://www.instagram.com/rev_douglasaraujo/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="underline hover:text-gray-700 transition-colors duration-200"
        >
          {t('creator_credit')}
        </a>
      </div>
      <Analytics/>
    </div>
  );
}

export default App;
