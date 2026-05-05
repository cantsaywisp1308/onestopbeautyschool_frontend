'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchExams, fetchActiveExams } from '../../../utils/studentApi';
import styles from '../../dashboard.module.css';

export default function StudentExamsList() {
  const router = useRouter();
  const [exams, setExams] = useState<any[]>([]);
  const [activeExamIds, setActiveExamIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExams();
  }, []);

  async function loadExams() {
    try {
      const [examData, activeData] = await Promise.all([
        fetchExams(),
        fetchActiveExams()
      ]);
      setExams(examData);
      setActiveExamIds(activeData);
    } catch (err) {
      console.error("Failed to load exams", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className={styles.container}><div style={{padding: '2rem'}}>Loading exams...</div></div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brand} onClick={() => router.push('/student')} style={{cursor: 'pointer'}}>OneStop Student</div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className={styles.logoutButton} onClick={() => router.push('/student')}>
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.sectionHeader}>
          <h2>Available Exams</h2>
          <p>Select an exam to begin testing your knowledge.</p>
        </div>

        <div className={styles.cardGrid}>
          {exams.length === 0 ? (
            <p>No exams have been assigned yet.</p>
          ) : (
            exams.map(exam => (
              <Link 
                key={exam.id} 
                href={`/student/exams/${exam.id}`}
                className={styles.card}
              >
                <h3>{exam.name}</h3>
                <p>{exam.description || "Comprehensive Exam"}</p>
                {exam.durationMinutes ? (
                  <p style={{marginTop: '1rem', color: '#ec4899', fontWeight: 'bold'}}>
                    ⏱ Time Limit: {exam.durationMinutes} Minutes
                  </p>
                ) : (
                  <p style={{marginTop: '1rem', color: '#a78bfa', fontWeight: 'bold'}}>
                    Unlimited Time
                  </p>
                )}
                <div className={styles.cardFooter}>
                  {activeExamIds.includes(exam.id) ? (
                    <span style={{color: '#fbbf24', fontWeight: 'bold'}}>⏳ Back to your test &rarr;</span>
                  ) : (
                    <span>Start Exam &rarr;</span>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
