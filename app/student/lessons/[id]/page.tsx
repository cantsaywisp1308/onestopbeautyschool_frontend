'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchLessonById, fetchSectionsByLesson, fetchLessonTopics } from '../../../../utils/studentApi';
import styles from './lesson.module.css';

export default function StudentLessonView() {
  const params = useParams();
  const lessonId = Number(params.id);
  const router = useRouter();

  const [lesson, setLesson] = useState<any>(null);
  const [lessonTopics, setLessonTopics] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (lessonId) loadData();
  }, [lessonId]);

  async function loadData() {
    try {
      const l = await fetchLessonById(lessonId);
      setLesson(l);
      const lt = await fetchLessonTopics(lessonId);
      setLessonTopics(lt);
      const s = await fetchSectionsByLesson(lessonId);
      s.sort((a: any, b: any) => a.orderIndex - b.orderIndex);
      setSections(s);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function getEmbedUrl(url: string) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return null;
  }

  if (loading) return <div className={styles.container}><div className={styles.loader}>Loading lesson...</div></div>;

  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        <div className={styles.breadcrumb}>
          <button onClick={() => router.back()} className={styles.backButton}>&larr; Back to Course</button>
        </div>

        <header className={styles.header}>
          <h1 className={styles.title}>{lesson?.title}</h1>
        </header>

        <div className={styles.content}>
          {sections.length === 0 ? (
            <p className={styles.empty}>This lesson has no content yet.</p>
          ) : currentIndex < sections.length ? (
            <div className={styles.slideContainer}>
              <div className={styles.progress}>
                Part {currentIndex + 1} of {sections.length}
              </div>
              
              <section className={styles.sectionBlock}>
                {sections[currentIndex].title && <h2 className={styles.sectionTitle}>{sections[currentIndex].title}</h2>}
                
                {sections[currentIndex].videoUrl && getEmbedUrl(sections[currentIndex].videoUrl) && (
                  <div className={styles.videoWrapper}>
                    <iframe 
                      src={getEmbedUrl(sections[currentIndex].videoUrl)!} 
                      title="YouTube video player" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen>
                    </iframe>
                  </div>
                )}

                {sections[currentIndex].imageUrl && (
                  <div className={styles.imageWrapper}>
                    <img src={sections[currentIndex].imageUrl} alt={sections[currentIndex].title || "Lesson image"} />
                  </div>
                )}

                {sections[currentIndex].textContent && (
                  <div className={styles.textWrapper} dangerouslySetInnerHTML={{ __html: sections[currentIndex].textContent.replace(/&nbsp;|\u00a0/g, ' ') }}></div>
                )}
              </section>

              <div className={styles.navigation}>
                <button 
                  onClick={() => setCurrentIndex(currentIndex - 1)} 
                  disabled={currentIndex === 0}
                  className={styles.navButton}
                >
                  &larr; Previous
                </button>
                <button 
                  onClick={() => setCurrentIndex(currentIndex + 1)} 
                  className={styles.navButtonPrimary}
                >
                  {currentIndex === sections.length - 1 ? "Finish Lesson" : "Next \u2192"}
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.practiceArea}>
              <h2>You finished the lesson!</h2>
              <p>Ready to test your knowledge on the topics covered?</p>
              <div className={styles.topicGrid}>
                {lessonTopics && lessonTopics.length > 0 ? (
                  lessonTopics.map((topic: any) => (
                    <Link key={topic.id} href={`/student/topics/${topic.id}`} className={styles.topicCard}>
                      <h3>{topic.name}</h3>
                      <div className={styles.topicAction}>Start Flashcards &rarr;</div>
                    </Link>
                  ))
                ) : (
                  <p className={styles.noTopics}>No practice topics assigned to this lesson.</p>
                )}
              </div>
              <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <button onClick={() => setCurrentIndex(0)} className={styles.navButton}>
                  Review Lesson Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
