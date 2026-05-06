'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchLessons, createLesson, updateLesson, deleteLesson } from '../../../utils/adminApi';
import styles from '../../dashboard.module.css';

interface Lesson {
  id: number;
  title: string;
}

export default function AdminGlobalLessons() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [formData, setFormData] = useState({ title: '' });

  useEffect(() => {
    loadLessons();
  }, []);

  async function loadLessons() {
    try {
      const data = await fetchLessons();
      setLessons(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  function openModal(lesson: Lesson | null = null) {
    setEditingLesson(lesson);
    setFormData(lesson ? { title: lesson.title } : { title: '' });
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingLesson) {
        await updateLesson(editingLesson.id, formData);
      } else {
        await createLesson(formData);
      }
      setIsModalOpen(false);
      loadLessons();
    } catch (err) { alert(err); }
  }

  async function handleDelete(id: number) {
    if (confirm("Are you sure? This will delete the lesson and all its sections globally!")) {
      try {
        await deleteLesson(id);
        loadLessons();
      } catch (err) { alert(err); }
    }
  }
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brand}>OneStop Beauty Admin</div>
        <Link href="/admin" style={{ color: '#fff', textDecoration: 'none', background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1.2rem', borderRadius: '999px', fontSize: '0.9rem', transition: 'all 0.2s' }}>
          &larr; Back to Dashboard
        </Link>
      </header>

      <main className={styles.main}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h1 className={styles.title}>Global Lesson Bank</h1>
            <p className={styles.subtitle} style={{ marginBottom: 0 }}>Lessons created here can be assigned to multiple courses.</p>
          </div>
          <button style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => openModal()}>+ Create New Lesson</button>
        </div>

      {loading ? (
        <div className={styles.loader}>Loading lessons...</div>
      ) : (
        <div className={styles.cardGrid}>
          {lessons.map(lesson => (
            <div key={lesson.id} className={styles.card} style={{ gap: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#fff' }}>{lesson.title}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: 'auto' }}>
                <Link href={`/admin/lessons/${lesson.id}/sections`} style={{ background: 'rgba(167, 139, 250, 0.1)', color: '#a78bfa', border: '1px solid rgba(167, 139, 250, 0.3)', padding: '0.5rem', borderRadius: '6px', textAlign: 'center', textDecoration: 'none', fontWeight: 'bold', display: 'block', transition: 'all 0.2s' }}>
                  🛠 Build Content (Sections)
                </Link>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => openModal(lesson)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' }}>
                    Rename
                  </button>
                  <button onClick={() => handleDelete(lesson.id)} style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' }}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '400px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 style={{ marginBottom: '1.5rem', marginTop: 0 }}>{editingLesson ? 'Rename Lesson' : 'Create New Lesson'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>Lesson Title</label>
                <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required placeholder="e.g., Sanitation 101" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: 'white', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ background: '#ec4899', color: 'white', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{editingLesson ? 'Save Changes' : 'Create Lesson'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
    </div>
  );
}
