'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchExams, createExam, fetchCourses } from '../../../utils/adminApi';
import LogoutModal from '../../../components/LogoutModal';
import styles from '../../dashboard.module.css';
import pageStyles from '../topics/topics.module.css'; // borrowing some styles
import examStyles from './exams.module.css';

interface Exam {
  id: number;
  name: string;
  description: string;
  durationMinutes?: number;
  courses?: { id: number; title: string }[];
}

interface Course {
  id: number;
  title: string;
}

export default function AdminExams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDuration, setNewDuration] = useState<number | ''>('');
  const [selectedCourseId, setSelectedCourseId] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadExams();
  }, []);

  async function loadExams() {
    try {
      const [examData, courseData] = await Promise.all([
        fetchExams(),
        fetchCourses()
      ]);
      setExams(examData);
      setCourses(courseData);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createExam(
        newName, 
        newDesc, 
        newDuration === '' ? undefined : Number(newDuration),
        selectedCourseId === '' ? undefined : Number(selectedCourseId)
      );
      setNewName('');
      setNewDesc('');
      setNewDuration('');
      setSelectedCourseId('');
      loadExams();
    } catch (err) { alert("Failed to create exam"); }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brand} onClick={() => router.push('/admin')} style={{cursor: 'pointer'}}>OneStop Admin</div>
        <button className={styles.logoutButton} onClick={() => setShowLogoutModal(true)}>Log Out</button>

      </header>

      <main className={styles.main}>
        <div className={examStyles.topBar}>
          <div>
            <h1 className={styles.title}>Manage Exams</h1>
            <p className={styles.subtitle}>Create exams and assign questions to them.</p>
          </div>
          <button className={styles.logoutButton} onClick={() => router.push('/admin')}>Back to Dashboard</button>
        </div>

        <div className={pageStyles.contentLayout}>
          <div className={pageStyles.formCard}>
            <h3>Create New Exam</h3>
            <form onSubmit={handleCreate} className={pageStyles.form}>
              <div className={pageStyles.inputGroup}>
                <label>Exam Name</label>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Final Cosmetology 2024" required />
              </div>
              <div className={pageStyles.inputGroup}>
                <label>Description</label>
                <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="What is this exam about?" />
              </div>
              <div className={pageStyles.inputGroup}>
                <label>Time Limit (Minutes)</label>
                <input 
                  type="number" 
                  min="0"
                  value={newDuration} 
                  onChange={e => setNewDuration(e.target.value === '' ? '' : Number(e.target.value))} 
                  placeholder="e.g. 60 (Leave blank for unlimited)" 
                />
              </div>
              <div className={pageStyles.inputGroup}>
                <label>Assign to Course (Optional)</label>
                <select 
                  value={selectedCourseId} 
                  onChange={e => setSelectedCourseId(e.target.value === '' ? '' : Number(e.target.value))}
                >
                  <option value="">-- No Course --</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className={pageStyles.submitButton}>Create Exam</button>
            </form>
          </div>

          <div className={pageStyles.listSection}>
            <h3>Existing Exams</h3>
            {loading ? <p>Loading exams...</p> : (
              <div className={examStyles.grid}>
                {exams.map(exam => (
                  <div key={exam.id} className={examStyles.examCard}>
                    <div>
                      <h4>{exam.name}</h4>
                      <p>{exam.description}</p>
                      <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem'}}>
                        {exam.courses && exam.courses.map(course => (
                          <span key={course.id} style={{background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'}}>
                            📚 {course.title}
                          </span>
                        ))}
                        {exam.durationMinutes && exam.durationMinutes > 0 ? (
                          <span style={{background: 'rgba(167, 139, 250, 0.2)', color: '#a78bfa', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'}}>
                            ⏱ {exam.durationMinutes} min
                          </span>
                        ) : (
                          <span style={{background: 'rgba(255, 255, 255, 0.1)', color: '#cbd5e1', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'}}>
                            Unlimited
                          </span>
                        )}
                      </div>
                    </div>
                    <button 
                      className={examStyles.manageBtn}
                      onClick={() => router.push(`/admin/exams/${exam.id}`)}
                    >
                      Manage Questions &rarr;
                    </button>
                  </div>
                ))}
                {exams.length === 0 && <p>No exams created yet.</p>}
              </div>
            )}
          </div>
        </div>
      </main>

      <LogoutModal 
        isOpen={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          localStorage.removeItem('token');
          router.push('/');
        }}
      />
    </div>
  );
}
