'use client';


import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchCourses, createCourse, updateCourse, deleteCourse, uploadMedia } from '../../../utils/adminApi';
import styles from './courses.module.css';

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  price: number;
  published: boolean;
}

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', thumbnailUrl: '', price: 0, published: false });

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
        price: course.price || 0,
        published: course.published || false
    } : { title: '', description: '', thumbnailUrl: '', price: 0, published: false });
    setIsModalOpen(true);
  }

  async function handleImageUpload(file: File) {
    try {
      const { url } = await uploadMedia(file, 'courses');
      setFormData(prev => ({ ...prev, thumbnailUrl: url }));
    } catch (err) {
      alert("Failed to upload thumbnail: " + err);
    }
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
                <div className={styles.cardHeader}>
                  <div>
                    <h3 className={styles.courseTitle}>{course.title}</h3>
                    <span className={`${styles.statusBadge} ${course.published ? styles.published : styles.draft}`}>
                      {course.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className={styles.metaActions}>
                    <button onClick={() => openModal(course)} className={styles.iconBtn} title="Edit Course">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                    </button>
                    <button onClick={() => handleDelete(course.id)} className={styles.iconBtnDelete} title="Delete Course">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
                <p className={styles.courseDesc}>{course.description}</p>
                <div className={styles.manageGrid}>
                  <Link href={`/admin/courses/${course.id}/lessons`} className={styles.gridBtn}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10M6 10h10"/></svg>
                    <span>Lessons</span>
                  </Link>
                  <Link href={`/admin/courses/${course.id}/exams`} className={styles.gridBtn}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>
                    <span>Exams</span>
                  </Link>
                  <Link href={`/admin/courses/${course.id}/students`} className={styles.gridBtn}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    <span>Students</span>
                  </Link>
                  <Link href={`/admin/courses/${course.id}/pricing`} className={styles.gridBtn}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    <span>Pricing</span>
                  </Link>
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
                <label>Thumbnail Image</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input 
                    value={formData.thumbnailUrl} 
                    onChange={e => setFormData({...formData, thumbnailUrl: e.target.value})} 
                    placeholder="https://..." 
                    style={{ flex: 1 }}
                  />
                  <input 
                    type="file" 
                    id="course-image-upload" 
                    hidden 
                    accept="image/*"
                    onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                  />
                  <button 
                    type="button" 
                    onClick={() => document.getElementById('course-image-upload')?.click()}
                    className={styles.uploadBtn}
                  >
                    Upload
                  </button>
                </div>
              </div>
              <div className={styles.fieldRow}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', margin: '0.5rem 0' }}>
                  <input 
                    type="checkbox" 
                    checked={formData.published} 
                    onChange={e => setFormData({...formData, published: e.target.checked})} 
                    style={{ width: 'auto', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Publish publicly to students</span>
                </label>
              </div>
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setIsModalOpen(false)} className={styles.cancelButton}>Cancel</button>
                <button type="submit" className={styles.primaryButton}>{editingCourse ? 'Save Changes' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
