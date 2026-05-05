'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchMyAttempts } from '../../../utils/studentApi';
import LogoutModal from '../../../components/LogoutModal';
import styles from '../../dashboard.module.css';

interface Attempt {
  id: number;
  score: number;
  totalQuestions?: number;
  submitTime: string;
  exam?: { id: number; name: string };
  topic?: { id: number; name: string };
  answers: any[];
}

export default function ProgressPage() {
  const router = useRouter();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadHistory();
  }, [router]);

  async function loadHistory() {
    try {
      const data = await fetchMyAttempts();
      setAttempts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  const toggleLogoutModal = () => setShowLogoutModal(!showLogoutModal);

  // Group attempts by topic/exam name to find improvements
  const getImprovement = (index: number) => {
    const current = attempts[index];
    const targetName = current.topic?.name || current.exam?.name;
    
    // Find the next oldest attempt for the same topic/exam
    const previous = attempts.slice(index + 1).find(a => 
      (a.topic?.name === targetName || a.exam?.name === targetName)
    );

    if (!previous) return null;

    const diff = current.score - previous.score;
    return diff;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brand} onClick={() => router.push('/student')} style={{cursor: 'pointer'}}>
          OneStop Student
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/student" style={{ 
            textDecoration: 'none', 
            color: '#a78bfa', 
            alignSelf: 'center', 
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            Dashboard
          </Link>
          <button className={styles.logoutButton} onClick={toggleLogoutModal}>
            Log Out
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>My Progress</h1>
        <p className={styles.subtitle}>Track your scores and watch your skills grow.</p>

        <section className={styles.sectionHeader}>
          <h2>Attempt History</h2>
          <p>Review your previous practice sessions and professional exams.</p>
        </section>

        {loading ? (
          <p>Loading your history...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            
            {/* EXAMS SECTION */}
            {attempts.some(a => a.exam) && (
              <section>
                <h2 style={{ marginBottom: '1.5rem', color: '#ec4899', fontSize: '1.5rem' }}>Professional Exams</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {attempts.filter(a => a.exam).map((attempt) => {
                    const originalIndex = attempts.indexOf(attempt);
                    const diff = getImprovement(originalIndex);
                    const dateString = new Date(attempt.submitTime).toLocaleDateString(undefined, {
                      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    });

                    return (
                      <div key={attempt.id} style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '20px',
                        padding: '1.5rem 2rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{attempt.exam?.name}</h3>
                          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{dateString}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          {(() => {
                            const total = attempt.totalQuestions || attempt.answers?.length || 0;
                            const pct = total > 0 ? Math.round((attempt.score / total) * 100) : 0;
                            return (
                              <>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{pct}%</div>
                                <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{attempt.score} / {total} pts</div>
                              </>
                            );
                          })()}
                          {diff !== null && (
                            <div style={{ 
                              fontSize: '0.875rem', 
                              fontWeight: 600, 
                              color: diff > 0 ? '#10b981' : diff < 0 ? '#ef4444' : '#94a3b8' 
                            }}>
                              {diff > 0 ? `+${diff} improvement` : diff < 0 ? `${diff} points lower` : 'Same as last time'}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* TOPICS SECTION */}
            <section>
              <h2 style={{ marginBottom: '1.5rem', color: '#8b5cf6', fontSize: '1.5rem' }}>Topic Practice</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {attempts.filter(a => a.topic).map((attempt) => {
                  const originalIndex = attempts.indexOf(attempt);
                  const diff = getImprovement(originalIndex);
                  const dateString = new Date(attempt.submitTime).toLocaleDateString(undefined, {
                    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  });

                  return (
                    <div key={attempt.id} style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '20px',
                      padding: '1.5rem 2rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{attempt.topic?.name}</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{dateString}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {(() => {
                          const total = attempt.totalQuestions || attempt.answers?.length || 0;
                          const pct = total > 0 ? Math.round((attempt.score / total) * 100) : 0;
                          return (
                            <>
                              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{pct}%</div>
                              <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{attempt.score} / {total} pts</div>
                            </>
                          );
                        })()}
                        {diff !== null && (
                          <div style={{ 
                            fontSize: '0.875rem', 
                            fontWeight: 600, 
                            color: diff > 0 ? '#10b981' : diff < 0 ? '#ef4444' : '#94a3b8' 
                          }}>
                            {diff > 0 ? `+${diff} improvement` : diff < 0 ? `${diff} points lower` : 'Same as last time'}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {attempts.filter(a => a.topic).length === 0 && (
                  <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No practice sessions recorded yet.</p>
                )}
              </div>
            </section>

            {attempts.length === 0 && (
              <div className={styles.card} style={{ textAlign: 'center', cursor: 'default' }}>
                <p>You haven't completed any attempts yet. Start practicing to see your progress!</p>
                <Link href="/student" style={{ color: '#ec4899', fontWeight: 700, textDecoration: 'none', display: 'block', marginTop: '1rem' }}>
                  Return to Dashboard &rarr;
                </Link>
              </div>
            )}
          </div>
        )}

      </main>

      <LogoutModal 
        isOpen={showLogoutModal} 
        onClose={toggleLogoutModal} 
        onConfirm={handleLogout} 
      />
    </div>
  );
}
