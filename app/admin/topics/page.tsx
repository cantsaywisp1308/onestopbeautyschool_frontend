'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchTopics, createTopic, updateTopic, deleteTopic, fetchCourses } from '../../../utils/adminApi';
import { jwtDecode } from 'jwt-decode';
import LogoutModal from '../../../components/LogoutModal';
import styles from '../../dashboard.module.css';
import pageStyles from './topics.module.css';

interface Topic {
  id: number;
  name: string;
  description: string;
  course?: { id: number; title: string };
}

interface Course {
  id: number;
  title: string;
}

export default function AdminTopics() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<number | ''>('');
  const [editingTopicId, setEditingTopicId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadTopics();
  }, []);


  async function loadTopics() {
    try {
      const [topicData, courseData] = await Promise.all([
        fetchTopics(),
        fetchCourses()
      ]);
      setTopics(topicData);
      setCourses(courseData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const startEdit = (topic: Topic) => {
    setEditingTopicId(topic.id);
    setNewName(topic.name);
    setNewDesc(topic.description || '');
    setSelectedCourseId(topic.course?.id || '');
    // Scroll to form for better UX on mobile/long lists
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingTopicId(null);
    setNewName('');
    setNewDesc('');
    setSelectedCourseId('');
  };

  async function handleSaveTopic(e: React.FormEvent) {
    e.preventDefault();
    if (!newName) return;
    try {
      const courseId = selectedCourseId === '' ? undefined : Number(selectedCourseId);
      if (editingTopicId) {
        await updateTopic(editingTopicId, newName, newDesc, courseId);
      } else {
        await createTopic(newName, newDesc, courseId);
      }
      cancelEdit();
      loadTopics();
    } catch (err) {
      alert(editingTopicId ? "Failed to update topic" : "Failed to create topic");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this topic? This might affect existing questions.")) return;
    try {
      await deleteTopic(id);
      loadTopics();
    } catch (err) {
      alert("Failed to delete topic");
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brand} onClick={() => router.push('/admin')} style={{cursor: 'pointer'}}>
          OneStop Admin
        </div>
        <button className={styles.logoutButton} onClick={() => setShowLogoutModal(true)}>Log Out</button>

      </header>

      <main className={styles.main}>
        <div className={pageStyles.topBar}>
          <div>
            <h1 className={styles.title}>Manage Topics</h1>
            <p className={styles.subtitle}>Define categories for your questions and exams.</p>
          </div>
          <button className={styles.logoutButton} onClick={() => router.push('/admin')}>
            Back to Dashboard
          </button>
        </div>

        <div className={pageStyles.contentLayout}>
          {/* Create Topic Card */}
          <div className={pageStyles.formCard}>
            <h3>{editingTopicId ? "Edit Topic" : "Create New Topic"}</h3>
            <form onSubmit={handleSaveTopic} className={pageStyles.form}>
              <div className={pageStyles.inputGroup}>
                <label>Topic Name</label>
                <input 
                  type="text" 
                  value={newName} 
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Skin Care Anatomy"
                  required
                />
              </div>
              <div className={pageStyles.inputGroup}>
                <label>Description</label>
                <textarea 
                  value={newDesc} 
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Quick summary of this topic..."
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
              <div className={pageStyles.buttonGroup}>
                <button type="submit" className={pageStyles.submitButton}>
                  {editingTopicId ? "Update Topic" : "Add Topic"}
                </button>
                {editingTopicId && (
                  <button type="button" className={pageStyles.cancelButton} onClick={cancelEdit}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Topics List */}
          <div className={pageStyles.listSection}>
            <h3>Existing Topics</h3>
            {loading ? <p>Loading topics...</p> : (
              <div className={pageStyles.grid}>
                {topics.map(topic => (
                  <div key={topic.id} className={pageStyles.topicItem}>
                    <div className={pageStyles.topicInfo}>
                      <h4>{topic.name}</h4>
                      <p>{topic.description || "No description"}</p>
                      {topic.course && (
                        <span style={{display: 'inline-block', marginTop: '0.5rem', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold'}}>
                          📚 {topic.course.title}
                        </span>
                      )}
                    </div>
                    <div className={pageStyles.itemActions}>
                      <button 
                        className={pageStyles.editBtn}
                        onClick={() => startEdit(topic)}
                      >
                        Edit
                      </button>
                      <button 
                        className={pageStyles.deleteBtn}
                        onClick={() => handleDelete(topic.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {topics.length === 0 && <p>No topics created yet.</p>}
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
