'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { fetchCourseById, fetchExams, createExam, addExamToCourse, removeExamFromCourse } from '../../../../../utils/adminApi';
import LogoutModal from '../../../../../components/LogoutModal';
import UnlinkExamModal from '../../../../../components/UnlinkExamModal';
import styles from '../../../../dashboard.module.css';
import pageStyles from '../../../topics/topics.module.css';
import examStyles from '../../../exams/exams.module.css';
import Link from 'next/link';

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
  exams?: Exam[];
}

export default function AdminCourseExams({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const courseId = Number(resolvedParams.id);
  const router = useRouter();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [linkedExams, setLinkedExams] = useState<Exam[]>([]);
  const [allGlobalExams, setAllGlobalExams] = useState<Exam[]>([]);
  const [selectedGlobalId, setSelectedGlobalId] = useState<number | ''>('');
  
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDuration, setNewDuration] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [examToUnlink, setExamToUnlink] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, [courseId]);

  async function loadData() {
    try {
      const [courseData, allExams] = await Promise.all([
        fetchCourseById(courseId),
        fetchExams()
      ]);
      setCourse(courseData);
      setAllGlobalExams(allExams);
      
      // The course object should now contain the linked exams thanks to the backend relationship
      setLinkedExams(courseData.exams || []);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  }

  async function handleCreateAndLink(e: React.FormEvent) {
    e.preventDefault();
    try {
      // 1. Create the exam globally
      const newExam = await createExam(
        newName, 
        newDesc, 
        newDuration === '' ? undefined : Number(newDuration)
      );
      
      // 2. Link it to this course
      await addExamToCourse(courseId, newExam.id);
      
      setNewName('');
      setNewDesc('');
      setNewDuration('');
      loadData();
    } catch (err) { 
      alert("Failed to create and link exam"); 
    }
  }

  async function handleLinkExisting() {
    if (!selectedGlobalId) return;
    try {
      await addExamToCourse(courseId, Number(selectedGlobalId));
      setSelectedGlobalId('');
      loadData();
    } catch (err) {
      alert("Failed to link exam");
    }
  }

  async function confirmUnlink() {
    if (!examToUnlink) return;
    try {
      await removeExamFromCourse(courseId, examToUnlink);
      setExamToUnlink(null);
      loadData();
    } catch (err) {
      alert("Failed to unlink exam");
    }
  }

  if (loading) return <div className={styles.container}><p>Loading...</p></div>;

  // Filter out exams already in this course for the "Add Existing" dropdown
  const linkableExams = allGlobalExams.filter(ge => !linkedExams.some(le => le.id === ge.id));

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brand} onClick={() => router.push('/admin')} style={{cursor: 'pointer'}}>OneStop Admin</div>
        <button className={styles.logoutButton} onClick={() => setShowLogoutModal(true)}>Log Out</button>
      </header>

      <main className={styles.main}>
        <div className={examStyles.topBar}>
          <div>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
              <Link href="/admin/courses" style={{color: '#a78bfa', textDecoration: 'none', fontSize: '0.9rem'}}>&larr; Back to Courses</Link>
            </div>
            <h1 className={styles.title}>Exams for {course?.title}</h1>
            <p className={styles.subtitle}>Manage which exams are required for this course module.</p>
          </div>
          <button className={styles.logoutButton} onClick={() => router.push('/admin')}>Dashboard</button>
        </div>

        <div className={pageStyles.contentLayout}>
          <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
            <div className={pageStyles.formCard}>
              <h3>Link Existing Global Exam</h3>
              <p style={{fontSize: '0.85rem', opacity: 0.7, marginBottom: '1rem'}}>Reuse an exam from another course or the global bank.</p>
              <div className={pageStyles.form}>
                <div className={pageStyles.inputGroup}>
                  <select 
                    value={selectedGlobalId} 
                    onChange={e => setSelectedGlobalId(e.target.value === '' ? '' : Number(e.target.value))}
                  >
                    <option value="">-- Select an Exam --</option>
                    {linkableExams.map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>
                <button 
                  onClick={handleLinkExisting} 
                  className={pageStyles.submitButton}
                  disabled={!selectedGlobalId}
                  style={{background: '#10b981'}}
                >
                  Link Selected Exam
                </button>
              </div>
            </div>

            <div className={pageStyles.formCard}>
              <h3>Create & Add New Exam</h3>
              <form onSubmit={handleCreateAndLink} className={pageStyles.form}>
                <div className={pageStyles.inputGroup}>
                  <label>Exam Name</label>
                  <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Module 1 Final" required />
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
                <button type="submit" className={pageStyles.submitButton}>Create & Link</button>
              </form>
            </div>
          </div>

          <div className={pageStyles.listSection}>
            <h3>Exams in this Course</h3>
            <div className={examStyles.grid}>
              {linkedExams.map(exam => (
                <div key={exam.id} className={examStyles.examCard}>
                  <div>
                    <h4>{exam.name}</h4>
                    <p>{exam.description}</p>
                    <div style={{marginTop: '0.5rem', display: 'flex', gap: '0.5rem'}}>
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
                  <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem'}}>
                    <button 
                      className={examStyles.manageBtn}
                      onClick={() => router.push(`/admin/exams/${exam.id}`)}
                    >
                      Manage Questions &rarr;
                    </button>
                    <button 
                      onClick={() => setExamToUnlink(exam.id)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      Unlink from Course
                    </button>
                  </div>
                </div>
              ))}
              {linkedExams.length === 0 && <p>No exams assigned to this course yet.</p>}
            </div>
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

      <UnlinkExamModal 
        isOpen={examToUnlink !== null}
        onClose={() => setExamToUnlink(null)}
        onConfirm={confirmUnlink}
      />
    </div>
  );
}
