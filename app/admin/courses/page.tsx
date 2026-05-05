'use client';


import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchCourses, createCourse, updateCourse, deleteCourse } from '../../../utils/adminApi';
import styles from './courses.module.css';

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  price: number;
}

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', thumbnailUrl: '', price: 0 });

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      const data = await fetchCourses();
      setCourses(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  function openModal(course: Course | null = null) {
    setEditingCourse(course);
    setFormData(course ? { 
        title: course.title, 
        description: course.description, 
        thumbnailUrl: course.thumbnailUrl,
        price: course.price || 0
    } : { title: '', description: '', thumbnailUrl: '', price: 0 });
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, formData);
      } else {
        await createCourse(formData);
      }
      setIsModalOpen(false);
      loadCourses();
    } catch (err) { alert(err); }
  }

  async function handleDelete(id: number) {
    if (confirm("Are you sure? This will delete all lessons in this course too.")) {
      try {
        await deleteCourse(id);
        loadCourses();
      } catch (err) { alert(err); }
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/admin" className={styles.backLink}>&larr; Dashboard</Link>
          <h1 className={styles.title}>Course Management</h1>
        </div>
        <button className={styles.addButton} onClick={() => openModal()}>+ Create New Course</button>
      </div>

      {loading ? (
        <div className={styles.loader}>Loading courses...</div>
      ) : (
        <div className={styles.grid}>
          {courses.map(course => (
            <div key={course.id} className={styles.card}>
              <div className={styles.cardContent}>
                <h3 className={styles.courseTitle}>{course.title}</h3>
                <p className={styles.courseDesc}>{course.description}</p>
                <p style={{fontWeight: 'bold', color: '#10b981', margin: '0.5rem 0'}}>Price: ${course.price?.toFixed(2) || '0.00'}</p>
                <div className={styles.actions}>
                  <Link href={`/admin/courses/${course.id}/lessons`} className={styles.manageButton}>Manage Lessons</Link>
                  <Link href={`/admin/courses/${course.id}/exams`} className={styles.examsButton} style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    color: '#f59e0b',
                    padding: '0.6rem 1rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    textAlign: 'center'
                  }}>Manage Exams</Link>
                  <Link href={`/admin/courses/${course.id}/students`} className={styles.studentsButton}>Manage Students</Link>
                  <button onClick={() => openModal(course)} className={styles.editButton}>Edit</button>
                  <button onClick={() => handleDelete(course.id)} className={styles.deleteButton}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>{editingCourse ? 'Edit Course' : 'Create Course'}</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label>Course Title</label>
                <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className={styles.field}>
                <label>Description</label>
                <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className={styles.field}>
                <label>Thumbnail URL</label>
                <input value={formData.thumbnailUrl} onChange={e => setFormData({...formData, thumbnailUrl: e.target.value})} placeholder="https://example.com/image.jpg" />
              </div>
              <div className={styles.field}>
                <label>Price ($)</label>
                <input type="number" step="0.01" min="0" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
              </div>
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.primaryButton}>{editingCourse ? 'Save Changes' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
