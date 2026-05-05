'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchAllCourses, createCheckoutSession } from '../../utils/studentApi';
import styles from './programs.module.css';

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  price: number;
}

export default function ProgramsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      const data = await fetchAllCourses();
      setCourses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleBuy = async (courseId: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push(`/login?redirect=/programs`);
      return;
    }
    
    try {
      setLoading(true);
      const session = await createCheckoutSession(courseId);
      if (session.url) {
        window.location.href = session.url; // Redirect to Stripe
      }
    } catch (err) {
      console.error(err);
      alert("Failed to initiate payment. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.backgroundGlow}></div>
      
      <header className={styles.header}>
        <div className={styles.brand} onClick={() => router.push('/')}>OneStop Beauty</div>
        <Link href="/" className={styles.backButton}>&larr; Back to Home</Link>
      </header>

      <main className={styles.main}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Our <span style={{color: '#a78bfa'}}>Programs</span></h1>
          <p className={styles.subtitle}>
            Invest in your future with our professional beauty courses. 
            Comprehensive curriculum, interactive exams, and expert guidance.
          </p>
        </div>

        {loading ? (
          <div className={styles.loading}>Exploring courses...</div>
        ) : (
          <div className={styles.grid}>
            {courses.map(course => (
              <div key={course.id} className={styles.card}>
                {course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt={course.title} className={styles.thumbnail} />
                ) : (
                  <div className={styles.thumbnail} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)'}}>
                    <span style={{fontSize: '3rem'}}>🎨</span>
                  </div>
                )}
                <h3 className={styles.courseTitle}>{course.title}</h3>
                <p className={styles.courseDesc}>{course.description || "Transform your passion into professional expertise with this comprehensive module."}</p>
                
                <div className={styles.cardFooter}>
                  <div className={styles.price}>
                    ${course.price?.toFixed(2) || '0.00'}
                  </div>
                  <button 
                    className={styles.buyButton}
                    onClick={() => handleBuy(course.id)}
                  >
                    Enroll Now
                  </button>
                </div>
              </div>
            ))}
            {courses.length === 0 && (
              <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '4rem'}}>
                <h3>No courses available at the moment.</h3>
                <p>Please check back later!</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
