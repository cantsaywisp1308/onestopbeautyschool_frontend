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
      <div className={styles.breadcrumb}>
        <Link href="/admin">Dashboard</Link> / Global Lesson Bank
      </div>
      <div className={styles.header}>
        <h1 className={styles.title}>Global Lesson Bank</h1>
        <button className={styles.addButton} onClick={() => openModal()}>+ Create New Lesson</button>
      </div>
      <p className={styles.subtitle}>Lessons created here can be assigned to multiple courses.</p>

      {loading ? (
        <div className={styles.loader}>Loading lessons...</div>
      ) : (
        <div className={styles.grid}>
          {lessons.map(lesson => (
            <div key={lesson.id} className={styles.card}>
              <div className={styles.cardContent}>
                <h3 className={styles.lessonTitle}>{lesson.title}</h3>
                <div className={styles.actions}>
                  <Link href={`/admin/lessons/${lesson.id}/sections`} className={styles.buildButton}>Build Content (Sections)</Link>
                  <button onClick={() => openModal(lesson)} className={styles.editButton}>Rename</button>
                  <button onClick={() => handleDelete(lesson.id)} className={styles.deleteButton}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>{editingLesson ? 'Rename Lesson' : 'Create New Lesson'}</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label>Lesson Title</label>
                <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required placeholder="e.g., Sanitation 101" />
              </div>
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.primaryButton}>{editingLesson ? 'Save Changes' : 'Create Lesson'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
