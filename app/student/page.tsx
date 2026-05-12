'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import Link from 'next/link';
import { fetchMyEnrollments, verifyPaymentSession } from '../../utils/studentApi';
import LogoutModal from '../../components/LogoutModal';
import styles from '../dashboard.module.css';

interface JwtPayload {
  sub: string;
  role: string;
  exp: number;
}

interface Course {
  id: number;
  title: string;
  description: string;
}

interface Enrollment {
  id: number;
  course: Course;
  status: string;
}


export default function StudentDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      setIsAuthorized(true);
      
      const sessionId = searchParams.get('session_id');
      const paymentStatus = searchParams.get('payment');
      
      if (paymentStatus === 'success' && sessionId) {
        verifyPaymentSession(sessionId).then(() => {
          // Clear query params
          router.replace('/student');
          loadEnrollments();
        }).catch(err => {
          console.error("Verification failed", err);
          loadEnrollments();
        });
      } else {
        loadEnrollments();
      }
    } catch (e) {
      localStorage.removeItem('token');
      router.push('/login');
    }
  }, [router, searchParams]);

  async function loadEnrollments() {
    try {
      const data = await fetchMyEnrollments();
      setEnrollments(data);
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



  if (!isAuthorized) {
    return null;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brand}>OneStop Student</div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/student/progress" style={{ 
            textDecoration: 'none', 
            color: '#a78bfa', 
            alignSelf: 'center', 
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            My Progress
          </Link>
          <Link href="/student/profile" style={{ 
            textDecoration: 'none', 
            color: '#a78bfa', 
            alignSelf: 'center', 
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            My Profile
          </Link>
          <button className={styles.logoutButton} onClick={toggleLogoutModal}>
            Log Out
          </button>
        </div>
      </header>

      
      <main className={styles.main}>
        <h1 className={styles.title}>Welcome to your Dashboard</h1>
        <p className={styles.subtitle}>Ready to practice your skills today?</p>
        
        <div className={styles.sectionHeader}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%'}}>
            <div>
              <h2>My Enrolled Courses</h2>
              <p>Select a course to view its lessons and practice topics.</p>
            </div>
            <Link href="/programs" className={styles.logoutButton} style={{textDecoration: 'none', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)'}}>
              Browse Programs &rarr;
            </Link>
          </div>
        </div>

        <div className={styles.cardGrid}>
          {loading ? (
            <p>Loading courses...</p>
          ) : (
            enrollments
              .filter(e => e.status === 'ACTIVE' || e.status === 'COMPLETED')
              .map(enrollment => (
                <Link 
                  key={enrollment.id} 
                  href={`/student/courses/${enrollment.course.id}`}
                  className={styles.card}
                >
                  <h3>{enrollment.course.title}</h3>
                  <p>{enrollment.course.description || "Course materials and lessons."}</p>
                  <div className={styles.cardFooter}>
                    <span>Enter Course &rarr;</span>
                  </div>
                </Link>
              ))
          )}
          {!loading && enrollments.filter(e => e.status === 'ACTIVE' || e.status === 'COMPLETED').length === 0 && <p>You are not enrolled in any courses yet. Please contact an administrator.</p>}
        </div>

        <div className={styles.sectionHeader} style={{marginTop: '3rem'}}>
          <h2>Learning Progress</h2>
        </div>
        <div className={styles.cardGrid}>
          <Link href="/student/progress" className={styles.card}>
            <h3>Attempt History</h3>
            <p>Review your previous scores and identify topics you need to study further.</p>
            <div className={styles.cardFooter}>View History &rarr;</div>
          </Link>
        </div>
      </main>

      <LogoutModal 
        isOpen={showLogoutModal} 
        onClose={toggleLogoutModal} 
        onConfirm={handleLogout} 
      />
    </div>
  );
}

