'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import RichTextEditor from '../../../../../components/RichTextEditor';
import { fetchSectionsByLesson, createSection, updateSection, deleteSection, fetchLessonById, fetchTopics, addTopicToLesson, removeTopicFromLesson, fetchLessonTopics, uploadMedia } from '../../../../../utils/adminApi';
import styles from './sections.module.css';

interface Section {
  id: number;
  title: string;
  textContent: string;
  imageUrl: string;
  videoUrl: string;
  orderIndex: number;
}

export default function SectionBuilder() {
  const params = useParams();
  const lessonId = Number(params.id);

  const [sections, setSections] = useState<Section[]>([]);
  const [lesson, setLesson] = useState<any>(null);
  const [lessonTopics, setLessonTopics] = useState<any[]>([]);
  const [allTopics, setAllTopics] = useState<any[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  
  const [formData, setFormData] = useState({ 
    title: '', 
    textContent: '', 
    imageUrl: '', 
    videoUrl: '', 
    orderIndex: 0 
  });

  useEffect(() => {
    if (lessonId) loadData();
  }, [lessonId]);

  async function loadData() {
    try {
      const s = await fetchSectionsByLesson(lessonId);
      setSections(s);
      const l = await fetchLessonById(lessonId);
      setLesson(l);
      const lt = await fetchLessonTopics(lessonId);
      setLessonTopics(lt);
      const t = await fetchTopics();
      setAllTopics(t);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  function openModal(section: Section | null = null) {
    setEditingSection(section);
    setFormData(section ? { 
      title: section.title || '', 
      textContent: section.textContent || '', 
      imageUrl: section.imageUrl || '', 
      videoUrl: section.videoUrl || '', 
      orderIndex: section.orderIndex 
    } : { 
      title: '', 
      textContent: '', 
      imageUrl: '', 
      videoUrl: '', 
      orderIndex: sections.length > 0 ? Math.max(...sections.map(s => s.orderIndex)) + 1 : 1 
    });
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingSection) {
        await updateSection(editingSection.id, formData);
      } else {
        await createSection(lessonId, formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) { alert(err); }
  }

  async function handleDelete(id: number) {
    if (confirm("Delete this section?")) {
      try {
        await deleteSection(id);
        loadData();
      } catch (err) { alert(err); }
    }
  }
  async function handleAddTopic() {
    if (!selectedTopicId) return;
    try {
      await addTopicToLesson(lessonId, Number(selectedTopicId));
      setSelectedTopicId('');
      loadData();
    } catch (err) { alert(err); }
  }

  async function handleRemoveTopic(topicId: number) {
    if (confirm("Remove this practice topic from the lesson?")) {
      try {
        await removeTopicFromLesson(lessonId, topicId);
        loadData();
      } catch (err) { alert(err); }
    }
  }
  async function handleImageUpload(file: File) {
    try {
      const { url } = await uploadMedia(file, 'sections');
      setFormData({ ...formData, imageUrl: url });
    } catch (err) {
      alert("Failed to upload image: " + err);
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

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link href="/admin/lessons">Global Lesson Bank</Link> / {lesson ? `Lesson: ${lesson.title}` : 'Loading...'} / Section Builder
      </div>

      <div className={styles.header} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <h1 className={styles.title}>Section Builder</h1>
          <button className={styles.addButton} onClick={() => openModal()}>+ Add Section</button>
        </div>
        {lesson && (
          <p className={styles.subtitle}>
            Building sections for lesson: <span className={styles.lessonHighlight}>{lesson.title}</span>
          </p>
        )}
      </div>

      {loading ? (
        <div className={styles.loader}>Loading sections...</div>
      ) : (
        <div className={styles.list}>
          {sections.length === 0 && <p className={styles.empty}>No sections created yet. Add one to get started!</p>}
          {sections.map(section => (
            <div key={section.id} className={styles.item}>
              <div className={styles.itemHeader}>
                <span className={styles.order}>Part {section.orderIndex}</span>
                <h3 className={styles.sectionTitle}>{section.title}</h3>
                <div className={styles.itemActions}>
                  <button onClick={() => openModal(section)} className={styles.editBtn}>Edit</button>
                  <button onClick={() => handleDelete(section.id)} className={styles.deleteBtn}>Delete</button>
                </div>
              </div>
              <div className={styles.itemContent}>
                {section.videoUrl && getEmbedUrl(section.videoUrl) ? (
                  <div className={styles.videoWrapper}>
                    <iframe 
                      width="560" 
                      height="315" 
                      src={getEmbedUrl(section.videoUrl)!} 
                      title="YouTube video player" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen>
                    </iframe>
                  </div>
                ) : section.videoUrl && (
                  <p className={styles.tag}>🎬 Invalid Video URL</p>
                )}
                {section.imageUrl && (
                  <div style={{ marginBottom: '1rem' }}>
                    <img 
                      src={section.imageUrl} 
                      alt="Section visual" 
                      style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '12px', objectFit: 'contain' }} 
                    />
                  </div>
                )}
                {section.textContent && (
                  <div className={styles.preview} dangerouslySetInnerHTML={{ __html: section.textContent }}></div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PRACTICE TOPICS SECTION */}
      {!loading && lesson && (
        <div className={styles.practiceTopicsSection} style={{ marginTop: '4rem', padding: '2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
          <h2 style={{ marginBottom: '1rem', color: '#e2e8f0' }}>Practice Topics</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
            Attach topics to this lesson to automatically show flashcard practice sets at the bottom of the student's lesson view.
          </p>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <select 
              value={selectedTopicId} 
              onChange={e => setSelectedTopicId(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '8px', background: '#000', color: 'white', border: '1px solid rgba(255,255,255,0.2)', flex: 1 }}
            >
              <option value="">Select a topic to add...</option>
              {allTopics
                .filter(t => !lessonTopics.some((assigned: any) => assigned.id === t.id))
                .map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <button onClick={handleAddTopic} disabled={!selectedTopicId} className={styles.primaryButton}>
              + Add Topic
            </button>
          </div>

          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {lessonTopics.length === 0 && (
              <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No topics assigned to this lesson yet.</p>
            )}
            {lessonTopics.map((t: any) => (
              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.5)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(167, 139, 250, 0.3)' }}>
                <div>
                  <h4 style={{ margin: 0, color: 'white' }}>{t.name}</h4>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{t.description || 'Practice Question Bank'}</span>
                </div>
                <button 
                  onClick={() => handleRemoveTopic(t.id)} 
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>{editingSection ? 'Edit Section' : 'Add New Section'}</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.row}>
                <div className={styles.field} style={{flex: 3}}>
                  <label>Section Title</label>
                  <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required placeholder="e.g., Introduction" />
                </div>
                <div className={styles.field} style={{flex: 1}}>
                  <label>Order</label>
                  <input type="number" value={formData.orderIndex} onChange={e => setFormData({...formData, orderIndex: Number(e.target.value)})} required />
                </div>
              </div>
              <div className={styles.field}>
                <label>Rich Text Content (Text, Tables, Images)</label>
                <RichTextEditor 
                  content={formData.textContent} 
                  onChange={val => setFormData({...formData, textContent: val})}
                  folder="sections"
                />
              </div>
              <div className={styles.field}>
                <label>Main Section Image (Optional)</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input 
                    value={formData.imageUrl} 
                    onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
                    placeholder="https://..." 
                    style={{ flex: 1 }}
                  />
                  <input 
                    type="file" 
                    id="section-image-upload" 
                    hidden 
                    onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                  />
                  <button 
                    type="button" 
                    onClick={() => document.getElementById('section-image-upload')?.click()}
                    className={styles.editBtn}
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    Upload
                  </button>
                </div>
              </div>
              <div className={styles.field}>
                <label>Video URL (Optional YouTube Link)</label>
                <input value={formData.videoUrl} onChange={e => setFormData({...formData, videoUrl: e.target.value})} placeholder="https://youtube.com/watch?v=..." />
              </div>
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setIsModalOpen(false)} className={styles.cancelButton}>Cancel</button>
                <button type="submit" className={styles.primaryButton}>{editingSection ? 'Save Changes' : 'Add Section'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
