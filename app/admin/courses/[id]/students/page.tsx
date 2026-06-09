'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchCourseById, fetchEnrollmentsByCourse, searchStudents, enrollStudent, deleteEnrollment, updateEnrollmentStatus } from '../../../../../utils/adminApi';
import styles from './students.module.css';

interface Enrollment {
  id: number;
  student: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  enrollmentDate: string;
  expiryDate: string | null;
  status: string;
}


interface Student {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function CourseStudents() {
  const params = useParams();
  const courseId = Number(params.id);

  const [course, setCourse] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // UI States
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [unenrollModalOpen, setUnenrollModalOpen] = useState(false);
  const [enrollmentToDrop, setEnrollmentToDrop] = useState<number | null>(null);
  const [dropReason, setDropReason] = useState('Refund Requested');

  // Debounce search effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery);
      } else {
        setAvailableStudents([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  async function performSearch(query: string) {
    try {
      const results = await searchStudents(query);
      setAvailableStudents(results);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (courseId) {
      loadData();
    }
  }, [courseId]);

  async function loadData() {
    try {
      const c = await fetchCourseById(courseId);
      setCourse(c);
      const e = await fetchEnrollmentsByCourse(courseId);
      setEnrollments(e);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function handleEnroll(studentId: number) {
    if (!studentId) return;
    try {
      await enrollStudent(studentId, courseId);
      setSearchQuery('');
      loadData();
    } catch (err) { alert(err); }
  }

  async function handleRemoveEnrollment(enrollmentId: number, studentName: string) {
    if (confirm(`Are you sure you want to permanently delete the enrollment for ${studentName}? This action cannot be undone.`)) {
      try {
        await deleteEnrollment(enrollmentId);
        loadData();
      } catch (err) {
        alert(err);
      }
    }
  }

  const enrolledIds = enrollments.map(e => e.student.id);
  const displayStudents = availableStudents.filter(s => !enrolledIds.includes(s.id));

  const filteredEnrollments = enrollments.filter(e => {
    if (statusFilter === 'ALL') return true;
    return (e.status || 'ACTIVE') === statusFilter;
  });

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link href="/admin/courses">Courses</Link> / {course?.title} / Students
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className={styles.title} style={{ margin: 0 }}>Manage Enrollments</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Filter Status:</span>
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            style={{ background: '#1e293b', color: 'white', border: '1px solid #334155', padding: '0.5rem', borderRadius: '8px' }}
          >
            <option value="ACTIVE">Active Students</option>
            <option value="COMPLETED">Graduates (Completed)</option>
            <option value="DROPPED">Dropped / Refunded</option>
            <option value="ALL">View All</option>
          </select>
        </div>
      </div>

      <div className={styles.enrollBox}>
        <h3>Enroll a Student</h3>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem' }}>
          Start typing a username or email (min 2 characters) to search the database.
        </p>
        <div className={styles.searchBox}>
          <input 
            type="text" 
            placeholder="Search by username, name, or email..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        {searchQuery.trim().length >= 2 && (
          <div className={styles.searchResults}>
            {displayStudents.length > 0 ? (
              displayStudents.map(s => (
                <div key={s.id} className={styles.searchResultItem}>
                  <div className={styles.searchResultInfo}>
                    <span className={styles.resultUsername}>{s.username ? `@${s.username}` : ''}</span>
                    <span className={styles.resultName}>{s.firstName} {s.lastName}</span>
                    <span className={styles.resultEmail}>{s.email}</span>
                  </div>
                  <button onClick={() => handleEnroll(s.id)} className={styles.enrollBtn}>Enroll</button>
                </div>
              ))
            ) : (
              <div className={styles.noResults}>No students found matching "{searchQuery}"</div>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className={styles.loader}>Loading...</div>
      ) : (
        <>
          {filteredEnrollments.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
              No students found with status "{statusFilter}".
            </p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>Enrollment Date</th>
                  <th>Access Expiry</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnrollments.map(e => (
                  <tr key={e.id}>
                    <td>{e.student.firstName} {e.student.lastName}</td>
                    <td>{e.student.email}</td>
                    <td>{new Date(e.enrollmentDate).toLocaleDateString()}</td>
                    <td>{e.expiryDate ? new Date(e.expiryDate).toLocaleDateString() : 'Lifetime'}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${
                        e.status === 'ACTIVE' ? styles.statusActive :
                        e.status === 'COMPLETED' ? styles.statusCompleted :
                        e.status === 'DROPPED' ? styles.statusDropped :
                        e.status === 'REFUNDED' ? styles.statusDropped :
                        e.status === 'EXPIRED' ? styles.statusExpired : ''
                      }`}>
                        {e.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => handleRemoveEnrollment(e.id, `${e.student.firstName} ${e.student.lastName}`)} className={styles.removeButton}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
