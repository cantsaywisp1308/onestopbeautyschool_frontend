'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchCourseById, fetchLessonsByCourse } from '../../../../utils/studentApi';
import styles from '../../../dashboard.module.css';

interface Course {
  id: number;
  title: string;
  description: string;
}

interface CourseLesson {
  id: number;
  orderIndex: number;
  lesson: {
    id: number;
    title: string;
  };
}

export default function StudentCourseView() {
  const params = useParams();
  const router = useRouter();
  const courseId = Number(params.id);

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<CourseLesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isNaN(courseId)) return;
    loadCourseDetails();
  }, [courseId]);

  async function loadCourseDetails() {
    try {
      const [courseData, lessonData] = await Promise.all([
        fetchCourseById(courseId),
        fetchLessonsByCourse(courseId)
      ]);
      setCourse(courseData);
      
      // Sort lessons by orderIndex
      const sortedLessons = lessonData.sort((a: CourseLesson, b: CourseLesson) => a.orderIndex - b.orderIndex);
      setLessons(sortedLessons);
    } catch (err) {
      console.error(err);
      alert("Failed to load course content. Make sure you are logged in!");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className={styles.loader}>Loading course content...</div>;
  if (!course) return <div className={styles.container}><h2>Course not found</h2></div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brand}>OneStop Beauty</div>
        <Link href="/student" style={{ color: '#fff', textDecoration: 'none', background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1.2rem', borderRadius: '999px', fontSize: '0.9rem', transition: 'all 0.2s' }}>
          &larr; Back to Dashboard
        </Link>
      </header>

      <main className={styles.main}>
        <div style={{ marginBottom: '4rem' }}>
          <h1 className={styles.title} style={{ fontSize: '3rem', background: 'linear-gradient(135deg, #f43f5e 0%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {course.title}
          </h1>
          <p className={styles.subtitle} style={{ fontSize: '1.2rem', maxWidth: '800px', marginTop: '1rem' }}>
            {course.description}
          </p>
        </div>

        <div className={styles.sectionHeader}>
          <h2>Curriculum & Modules</h2>
          <p>Follow these modules in order. Master each topic to unlock your full potential as a professional.</p>
        </div>

        {lessons.length === 0 ? (
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '4rem', borderRadius: '24px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No modules available yet</h3>
            <p style={{ color: '#94a3b8' }}>Your instructor is currently building this curriculum. Check back soon!</p>
          </div>
        ) : (
          <div className={styles.cardGrid}>
            {lessons.map((courseLesson) => (
              <div key={courseLesson.id} className={styles.card} onClick={() => router.push(`/student/lessons/${courseLesson.lesson.id}`)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1.5rem' }}>
                  <div style={{ 
                    width: '48px', height: '48px', 
                    borderRadius: '12px', background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#f43f5e', fontSize: '1.2rem', fontWeight: 'bold', border: '1px solid rgba(244,63,94,0.2)'
                  }}>
                    {courseLesson.orderIndex}
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.3rem', flex: 1 }}>
                    {courseLesson.lesson.title}
                  </h3>
                </div>
                
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', flex: 1 }}>
                  Dive into module {courseLesson.orderIndex} to learn the techniques and theories required for this stage of your training.
                </p>
                
                <div className={styles.cardFooter} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Begin Module</span>
                  <span style={{ fontSize: '1.2rem' }}>&rarr;</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
