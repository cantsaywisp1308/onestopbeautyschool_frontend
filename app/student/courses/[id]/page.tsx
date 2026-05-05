'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchCourseById, fetchCourseLessons } from '../../../../utils/studentApi';
import styles from '../../student.module.css';

export default function StudentCourseView() {
  const params = useParams();
  const courseId = Number(params.id);

  const [course, setCourse] = useState<any>(null);
  const [courseLessons, setCourseLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      loadData();
    }
  }, [courseId]);

  async function loadData() {
    try {
      const c = await fetchCourseById(courseId);
      setCourse(c);
      const cl = await fetchCourseLessons(courseId);
      // Sort by orderIndex
      cl.sort((a: any, b: any) => a.orderIndex - b.orderIndex);
      setCourseLessons(cl);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className={styles.container}><div className={styles.loader}>Loading course...</div></div>;

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link href="/student">My Dashboard</Link> / {course?.title}
      </div>

      <header className={styles.header}>
        <h1 className={styles.title}>{course?.title}</h1>
        <p className={styles.subtitle}>{course?.description}</p>
      </header>

      <div className={styles.sectionHeader}>
        <h2>Course Curriculum</h2>
        <p>Complete the following lessons in order.</p>
      </div>

      <div className={styles.list}>
        {courseLessons.length === 0 && <p className={styles.empty}>No lessons available for this course yet.</p>}
        {courseLessons.map((cl) => (
          <Link key={cl.id} href={`/student/lessons/${cl.lesson.id}`} className={styles.listItem}>
            <div className={styles.listOrder}>Module {cl.orderIndex}</div>
            <div className={styles.listContent}>
              <h3>{cl.lesson.title}</h3>
            </div>
            <div className={styles.listArrow}>&rarr;</div>
          </Link>
        ))}
      </div>

      {course?.exams && course.exams.length > 0 && (
        <>
          <div className={styles.sectionHeader} style={{marginTop: '3rem'}}>
            <h2>Final Exams</h2>
            <p>Complete these exams to earn your certification for this module.</p>
          </div>
          <div className={styles.list}>
            {course.exams.map((exam: any) => (
              <Link key={exam.id} href={`/student/exams/${exam.id}`} className={styles.listItem} style={{borderLeftColor: '#f59e0b'}}>
                <div className={styles.listOrder} style={{background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b'}}>EXAM</div>
                <div className={styles.listContent}>
                  <h3>{exam.name}</h3>
                  <p style={{fontSize: '0.8rem', opacity: 0.7}}>{exam.description}</p>
                </div>
                <div className={styles.listArrow}>&rarr;</div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
