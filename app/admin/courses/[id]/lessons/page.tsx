'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchCourseById, fetchCourseLessons, fetchLessons, addLessonToCourse, removeLessonFromCourse, updateCourseLessonOrder } from '../../../../../utils/adminApi';
import styles from './lessons.module.css';

interface GlobalLesson {
  id: number;
  title: string;
}

interface CourseLesson {
  id: number;
  orderIndex: number;
  lesson: GlobalLesson;
}

interface Course {
  id: number;
  title: string;
}

export default function CourseLessonsAssigner() {
  const params = useParams();
  const courseId = Number(params.id);

  const [course, setCourse] = useState<Course | null>(null);
  const [courseLessons, setCourseLessons] = useState<CourseLesson[]>([]);
  const [globalLessons, setGlobalLessons] = useState<GlobalLesson[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');

  useEffect(() => {
    if (courseId) {
      loadData();
    }
  }, [courseId]);

  async function loadData() {
    try {
      const courseData = await fetchCourseById(courseId);
      setCourse(courseData);
      const cLessons = await fetchCourseLessons(courseId);
      setCourseLessons(cLessons);
      const gLessons = await fetchLessons();
      setGlobalLessons(gLessons);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function handleAddLesson() {
    if (!selectedLessonId) return;
    try {
      const nextOrderIndex = courseLessons.length > 0 ? Math.max(...courseLessons.map(l => l.orderIndex)) + 1 : 1;
      await addLessonToCourse(courseId, Number(selectedLessonId), nextOrderIndex);
      setSelectedLessonId('');
      loadData();
    } catch (err) { alert(err); }
  }

  async function handleRemove(courseLessonId: number) {
    if (confirm("Remove this lesson from the course?")) {
      try {
        await removeLessonFromCourse(courseId, courseLessonId);
        loadData();
      } catch (err) { alert(err); }
    }
  }

  async function handleOrderChange(courseLessonId: number, newOrder: number) {
      try {
          await updateCourseLessonOrder(courseId, courseLessonId, newOrder);
          loadData();
      } catch (err) { alert(err); }
  }

  const assignedLessonIds = courseLessons.map(cl => cl.lesson.id);
  const availableLessons = globalLessons.filter(gl => !assignedLessonIds.includes(gl.id));

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link href="/admin/courses">Courses</Link> / {course?.title} / Lessons
      </div>
      
      <div className={styles.header}>
        <h1 className={styles.title}>Course Curriculum</h1>
        <Link href="/admin/lessons" className={styles.addButton}>Go to Global Lesson Bank</Link>
      </div>

      <div className={styles.assignBox}>
        <h3>Add Lesson to Course</h3>
        <div className={styles.assignControls}>
          <select value={selectedLessonId} onChange={e => setSelectedLessonId(e.target.value)}>
            <option value="">Select an existing lesson...</option>
            {availableLessons.map(l => (
              <option key={l.id} value={l.id}>{l.title}</option>
            ))}
          </select>
          <button onClick={handleAddLesson} disabled={!selectedLessonId}>Add to Course</button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loader}>Loading curriculum...</div>
      ) : (
        <div className={styles.list}>
          {courseLessons.length === 0 && <p className={styles.empty}>No lessons added to this course yet.</p>}
          {courseLessons.map(cl => (
            <div key={cl.id} className={styles.item}>
              <div className={styles.itemInfo}>
                <div className={styles.orderControl}>
                  <label>Order:</label>
                  <input 
                    type="number" 
                    value={cl.orderIndex} 
                    onChange={(e) => handleOrderChange(cl.id, Number(e.target.value))}
                    className={styles.orderInput}
                  />
                </div>
                <div className={styles.details}>
                  <h3 className={styles.lessonTitle}>{cl.lesson.title}</h3>
                </div>
              </div>
              <div className={styles.itemActions}>
                <button onClick={() => handleRemove(cl.id)} className={styles.deleteBtn}>Remove from Course</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
