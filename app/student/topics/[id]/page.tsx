'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { fetchTopicById, fetchQuestionsByTopic, submitAttempt } from '../../../../utils/studentApi';
import styles from '../../../dashboard.module.css';
import cardStyles from './flashcard.module.css';


interface Question {
  id: number;
  questionText: string;
  generalExplanation: string;
  imageUrls: string[];
  options: {
    id: number;
    optionText: string;
    correct: boolean;
  }[];
}

export default function TopicPractice({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const topicId = Number(id);
  const router = useRouter();

  const [topic, setTopic] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Track which option was chosen for each question ID
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Reset state for new topic
    setUserAnswers({});
    setCurrentIndex(0);
    setShowResults(false);
    setLoading(true);
    
    loadData();
  }, [topicId, router]);

  async function loadData() {
    try {
      const [tData, qData] = await Promise.all([
        fetchTopicById(topicId),
        fetchQuestionsByTopic(topicId)
      ]);
      setTopic(tData);
      setQuestions(qData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsSaving(true);
      try {
        const formattedAnswers: Record<string, number> = {};
        Object.entries(userAnswers).forEach(([qId, oId]) => {
          formattedAnswers[qId] = oId;
        });

        await submitAttempt({
          topicId: topicId,
          answers: formattedAnswers
        });
      } catch (err) {
        console.error("Progress save failed:", err);
      } finally {
        setIsSaving(false);
        setShowResults(true);
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleOptionClick = (optionId: number) => {
    const qId = questions[currentIndex].id;
    if (userAnswers[qId]) return; // Answer already locked for this question
    
    setUserAnswers(prev => ({
      ...prev,
      [qId]: optionId
    }));
  };

  const handleRestart = () => {
    setUserAnswers({});
    setCurrentIndex(0);
    setShowResults(false);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(q => {
      const chosenId = userAnswers[q.id];
      const correctOption = q.options.find(o => o.correct);
      if (chosenId && correctOption && chosenId === correctOption.id) {
        correct++;
      }
    });
    return correct;
  };

  const currentQuestion = questions[currentIndex];
  const selectedOptionId = currentQuestion ? userAnswers[currentQuestion.id] : null;

  if (loading) return <div className={styles.container}><p>Loading practice session...</p></div>;

  if (showResults) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 75;

    return (
      <div className={cardStyles.container}>
        <div className={cardStyles.resultsCard}>
          <div className={cardStyles.resultsIcon}>{passed ? "🌟" : "💪"}</div>
          <h2 className={cardStyles.resultsTitle}>
            {passed ? "Congratulations!" : "Keep Practicing!"}
          </h2>
          <p className={cardStyles.resultsSubtitle}>
            {passed 
              ? `Great job! You've mastered ${topic?.name}.` 
              : `You're getting there! A bit more study on ${topic?.name} will help.`}
          </p>
          
          <div className={cardStyles.scoreBox}>
            <span className={cardStyles.scoreText}>{score} / {questions.length}</span>
            <span className={cardStyles.scorePercent}>{percentage}%</span>
          </div>

          <div className={cardStyles.resultsActions}>
            <button className={cardStyles.revealBtn} onClick={handleRestart}>Restart Practice</button>
            <button 
              className={cardStyles.navBtn} 
              onClick={() => router.push('/student')}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return (
    <div className={styles.container}>
      <h1 className={styles.title}>No Questions Found</h1>
      <p className={styles.subtitle}>This topic doesn't have any practice questions yet.</p>
      <button className={styles.logoutButton} onClick={() => router.push('/student')}>Back to Dashboard</button>
    </div>
  );

  return (
    <div className={cardStyles.container}>
      <div className={cardStyles.topBar}>
        <div className={cardStyles.topicName}>{topic?.name}</div>
        <div className={cardStyles.progress}>
          Question {currentIndex + 1} of {questions.length}
        </div>
      </div>

      <div className={cardStyles.flashcard}>
        <div className={cardStyles.questionText}>
          {currentQuestion.questionText}
        </div>

        {currentQuestion.imageUrls && currentQuestion.imageUrls.length > 0 && (
          <div className={cardStyles.questionImages}>
            {currentQuestion.imageUrls.map((url, i) => (
              <img key={i} src={url} alt={`Question visual ${i+1}`} className={cardStyles.qImg} />
            ))}
          </div>
        )}

        <div className={cardStyles.optionsGrid}>
          {currentQuestion.options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            const isCorrect = option.correct;
            const showResult = selectedOptionId !== undefined && selectedOptionId !== null;
            
            let statusClass = '';
            if (showResult) {
              if (isCorrect) statusClass = cardStyles.correct;
              else if (isSelected) statusClass = cardStyles.incorrect;
            }

            return (
              <button 
                key={option.id} 
                className={`${cardStyles.option} ${statusClass} ${showResult ? cardStyles.revealed : ''}`}
                onClick={() => handleOptionClick(option.id)}
                disabled={showResult}
              >
                {option.optionText}
                {showResult && isCorrect && <span className={cardStyles.feedbackIcon}>✓</span>}
                {showResult && isSelected && !isCorrect && <span className={cardStyles.feedbackIcon}>✗</span>}
              </button>
            );
          })}
        </div>

        {selectedOptionId !== undefined && selectedOptionId !== null && currentQuestion.generalExplanation && (
          <div className={cardStyles.explanation}>
            <h4>Explanation</h4>
            <p>{currentQuestion.generalExplanation}</p>
          </div>
        )}
      </div>

      <div className={cardStyles.controls}>
        <button 
          className={cardStyles.navBtn} 
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          &larr; Previous
        </button>

        <button 
          className={cardStyles.navBtn} 
          onClick={handleNext}
        >
          {currentIndex === questions.length - 1 ? "Finish & View Score" : "Next \u2192"}
        </button>
      </div>

      <button 
        className={styles.logoutButton} 
        style={{marginTop: '3rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)'}}
        onClick={() => router.push('/student')}
      >
        Exit Practice
      </button>
    </div>
  );
}
