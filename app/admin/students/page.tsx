'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchAllAdminStudents, searchStudents } from '../../../utils/adminApi';
import styles from '../courses/courses.module.css';

interface Student {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

export default function GlobalStudentDirectory() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    try {
      const data = await fetchAllAdminStudents();
      setStudents(data);
    } catch (err) {
      console.error("Failed to load students", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery);
      } else if (searchQuery.trim().length === 0) {
        loadStudents();
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  async function performSearch(query: string) {
    setLoading(true);
    try {
      const results = await searchStudents(query);
      setStudents(results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
          <Link href="/admin" className={styles.backLink}>&larr; Dashboard</Link>
          <h1 className={styles.title} style={{ fontSize: '2rem', margin: 0, paddingRight: '1rem' }}>Student Directory</h1>
        </div>
      </div>

      <div style={{ marginBottom: '2rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <input 
          type="text" 
          placeholder="Search students..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '0.8rem 1rem', background: '#0f172a', border: '1px solid #334155', color: 'white', borderRadius: '12px', fontSize: '0.95rem' }}
        />
        <p style={{ marginTop: '0.5rem', color: '#94a3b8', fontSize: '0.85rem', marginBottom: 0 }}>
          Showing {students.length} students
        </p>
      </div>

      {loading ? (
        <div className={styles.loader}>Loading directory...</div>
      ) : (
        <div className={styles.grid}>
          {students.length === 0 && (
            <p style={{ color: '#94a3b8' }}>No students found.</p>
          )}
          {students.map(student => (
            <div 
              key={student.id} 
              className={styles.card} 
              style={{ cursor: 'pointer' }}
              onClick={() => router.push(`/admin/students/${student.id}`)}
            >
              <div className={styles.cardContent}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', color: 'white', flexShrink: 0 }}>
                    {student.firstName?.[0] || student.username?.[0] || '?'}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', wordBreak: 'break-word' }}>{student.firstName} {student.lastName}</h3>
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem', wordBreak: 'break-all' }}>{student.email}</span>
                  </div>
                </div>
                
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  <strong>Username:</strong> @{student.username}<br/>
                  <strong>Joined:</strong> {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <span style={{ color: '#38bdf8', fontSize: '0.9rem', fontWeight: '600' }}>View Profile &rarr;</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
