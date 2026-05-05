'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { fetchExamById, fetchExamQuestions, submitAttempt, startOrResumeExam } from '../../../../utils/studentApi';
import styles from '../../../dashboard.module.css';
import cardStyles from '../../topics/[id]/flashcard.module.css';

interface Question {
  id: number;
  questionText: string;
  generalExplanation: string;
  options: {
    id: number;
    optionText: string;
    correct: boolean;
  }[];
}

export default function TakeExam({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const examId = Number(id);
  const router = useRouter();

  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Track user's selected option id for each question id
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [scoreData, setScoreData] = useState<{score: number, percentage: number, passed: boolean} | null>(null);

  // Timer state
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadData();
  }, [examId]);

  async function loadData() {
    try {
      const [eData, qData, attemptData] = await Promise.all([
        fetchExamById(examId),
        fetchExamQuestions(examId),
        startOrResumeExam(examId)
      ]);
      setExam(eData);
      setQuestions(qData);

      // Load cached progress if any
      const cachedAnswers = localStorage.getItem(`exam_${examId}_answers`);

      if (cachedAnswers) {
        setUserAnswers(JSON.parse(cachedAnswers));
      }

      if (attemptData.timeLeftSeconds !== null) {
        setTimeLeft(attemptData.timeLeftSeconds);
      } else if (eData.durationMinutes && eData.durationMinutes > 0) {
        setTimeLeft(eData.durationMinutes * 60); // Convert to seconds
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Timer Effect
  useEffect(() => {
    if (timeLeft === null || showResults || isSaving) return;

    if (timeLeft <= 0) {
      // Time's up! Force submit.
      handleFinishExam();
      return;
    }

    // Sync time to localStorage
    localStorage.setItem(`exam_${examId}_timeLeft`, String(timeLeft));

    const timerId = setInterval(() => {
      setTimeLeft(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, showResults, isSaving, examId]);

  // Sync answers to localStorage
  useEffect(() => {
    if (Object.keys(userAnswers).length > 0) {
      localStorage.setItem(`exam_${examId}_answers`, JSON.stringify(userAnswers));
    }
  }, [userAnswers, examId]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
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
    const threshold = exam?.passingScorePercent || 75;
    const percentage = Math.round((correct / questions.length) * 100);
    return { score: correct, percentage, passed: percentage >= threshold };
  };

  const handleFinishExam = async () => {
    setIsSaving(true);
    try {
      const formattedAnswers: Record<string, number> = {};
      Object.entries(userAnswers).forEach(([qId, oId]) => {
        formattedAnswers[qId] = oId;
      });

      await submitAttempt({
        examId: examId,
        answers: formattedAnswers
      });
      
      // Clear cached progress
      localStorage.removeItem(`exam_${examId}_timeLeft`);
      localStorage.removeItem(`exam_${examId}_answers`);

      const results = calculateScore();
      setScoreData(results);
    } catch (err) {
      console.error("Exam submit failed:", err);
    } finally {
      setIsSaving(false);
      setShowResults(true);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleFinishExam();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleOptionClick = (optionId: number) => {
    const qId = questions[currentIndex].id;
    setUserAnswers(prev => ({
      ...prev,
      [qId]: optionId
    }));
  };

  const currentQuestion = questions[currentIndex];
  const selectedOptionId = currentQuestion ? userAnswers[currentQuestion.id] : null;

  if (loading) return <div className={styles.container}><p>Loading exam...</p></div>;

  if (showResults && scoreData) {
    return (
      <div className={cardStyles.container}>
        <div className={cardStyles.resultsCard}>
          <div className={cardStyles.resultsIcon}>{scoreData.passed ? "🏆" : "📝"}</div>
          <h2 className={cardStyles.resultsTitle}>
            {scoreData.passed ? "Exam Passed!" : "Exam Completed"}
          </h2>
          <p className={cardStyles.resultsSubtitle}>
            {scoreData.passed 
              ? `Outstanding work! You passed the ${exam?.name}.` 
              : `You've completed ${exam?.name}. Keep studying to improve your score!`}
          </p>
          
          <div className={cardStyles.scoreBox}>
            <span className={cardStyles.scoreText}>{scoreData.score} / {questions.length}</span>
            <span className={cardStyles.scorePercent}>{scoreData.percentage}%</span>
          </div>

          {scoreData.passed && (
            <div style={{ marginTop: '2rem', textAlign: 'left', width: '100%' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#a78bfa' }}>Review Answer Explanations</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {questions.map((q, idx) => {
                  const chosenId = userAnswers[q.id];
                  const correctOption = q.options.find(o => o.correct);
                  const isCorrect = chosenId === correctOption?.id;
                  
                  return (
                    <div key={q.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1.2rem', borderRadius: '8px', borderLeft: isCorrect ? '4px solid #10b981' : '4px solid #ef4444' }}>
                      <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#f8fafc' }}>{idx + 1}. {q.questionText}</p>
                      <div style={{ fontSize: '0.9rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <div style={{ color: isCorrect ? '#10b981' : '#f43f5e' }}>
                          Your Answer: {q.options.find(o => o.id === chosenId)?.optionText || 'Skipped'}
                        </div>
                        {!isCorrect && (
                          <div style={{ color: '#10b981', fontWeight: 600 }}>
                            Correct: {correctOption?.optionText}
                          </div>
                        )}
                      </div>
                      {q.generalExplanation && (
                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.75rem', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.03)' }}>
                          💡 <strong>Explanation:</strong> {q.generalExplanation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className={cardStyles.resultsActions}>
            <button 
              className={cardStyles.navBtn} 
              onClick={() => router.push(exam?.course ? `/student/courses/${exam.course.id}` : '/student')}
            >
              {exam?.course ? 'Return to Course' : 'Return to Dashboard'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return (
    <div className={styles.container}>
      <h1 className={styles.title}>No Questions Found</h1>
      <p className={styles.subtitle}>This exam is currently empty.</p>
      <button className={styles.logoutButton} onClick={() => router.push('/student')}>Back to Dashboard</button>
    </div>
  );

  return (
    <div className={cardStyles.container}>
      {/* Sticky Timer Bar */}
      {timeLeft !== null && (
        <div style={{
          position: 'sticky', top: '10px', zIndex: 100, marginBottom: '2rem',
          background: timeLeft < 60 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(15, 15, 20, 0.95)',
          border: timeLeft < 60 ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)', color: timeLeft < 60 ? '#f87171' : 'white',
          padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', transition: 'all 0.3s'
        }}>
          <div style={{fontWeight: 'bold', fontSize: '1.2rem'}}>⏱ Time Remaining</div>
          <div style={{fontWeight: 'bold', fontSize: '1.5rem', fontFamily: 'monospace', letterSpacing: '2px'}}>
            {formatTime(timeLeft)}
          </div>
        </div>
      )}

      <div className={cardStyles.topBar}>
        <div className={cardStyles.topicName}>{exam?.name}</div>
        <div className={cardStyles.progress}>
          Question {currentIndex + 1} of {questions.length}
        </div>
      </div>

      <div className={cardStyles.flashcard}>
        <div className={cardStyles.questionText}>
          {currentQuestion.questionText}
        </div>

        <div className={cardStyles.optionsGrid}>
          {currentQuestion.options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            // Unlike flashcards, we don't show right/wrong answers during the exam
            
            return (
              <button 
                key={option.id} 
                className={`${cardStyles.option} ${isSelected ? cardStyles.selectedOption : ''}`}
                style={isSelected ? {
                  background: 'rgba(167, 139, 250, 0.2)',
                  borderColor: '#a78bfa',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 15px rgba(167, 139, 250, 0.2)'
                } : {}}
                onClick={() => handleOptionClick(option.id)}
              >
                {option.optionText}
              </button>
            );
          })}
        </div>
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
          {currentIndex === questions.length - 1 ? "Submit Exam" : "Next \u2192"}
        </button>
      </div>
    </div>
  );
}
