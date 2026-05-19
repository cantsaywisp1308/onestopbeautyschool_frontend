'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  fetchTopics, 
  fetchQuestionsByTopic, 
  createQuestion, 
  updateQuestion, 
  deleteQuestion,
  uploadMedia
} from '../../../utils/adminApi';
import { jwtDecode } from 'jwt-decode';
import LogoutModal from '../../../components/LogoutModal';
import styles from '../../dashboard.module.css';

import pageStyles from './questions.module.css';

interface Topic {
  id: number;
  name: string;
}

interface Option {
  id?: number;
  optionText: string;
  correct: boolean;
}

export default function AdminQuestions() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const savedIdRef = useRef<number | null>(null);
  const router = useRouter();

  // Scroll to saved question when list reloads
  useEffect(() => {
    if (!loading && savedIdRef.current) {
      const element = document.getElementById(`q-${savedIdRef.current}`);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Highlight effect
          const originalBorder = element.style.borderColor;
          element.style.borderColor = '#ec4899';
          element.style.boxShadow = '0 0 20px rgba(236, 72, 153, 0.3)';
          setTimeout(() => {
            element.style.borderColor = originalBorder;
            element.style.boxShadow = '';
          }, 2000);
        }, 100);
      }
      savedIdRef.current = null;
    }
  }, [questions, loading]);

  // Modal / Form State
  const [showModal, setShowModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [qText, setQText] = useState('');
  const [explanation, setExplanation] = useState('');
  const [options, setOptions] = useState<Option[]>([
    { optionText: '', correct: true },
    { optionText: '', correct: false },
    { optionText: '', correct: false },
    { optionText: '', correct: false },
  ]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [modalTopicId, setModalTopicId] = useState<number | null>(null);

  useEffect(() => {
    loadTopics();
  }, []);


  async function loadTopics() {
    try {
      const data = await fetchTopics();
      setTopics(data);
      if (data.length > 0) {
        setSelectedTopicId(data[0].id);
      }
    } catch (err) { console.error(err); }
  }

  useEffect(() => {
    if (selectedTopicId) loadQuestions(selectedTopicId);
  }, [selectedTopicId]);

  async function loadQuestions(topicId: number) {
    setLoading(true);
    try {
      const data = await fetchQuestionsByTopic(topicId);
      setQuestions(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  const resetForm = () => {
    setEditingQuestionId(null);
    setQText('');
    setExplanation('');
    setOptions([
      { optionText: '', correct: true },
      { optionText: '', correct: false },
      { optionText: '', correct: false },
      { optionText: '', correct: false },
    ]);
    setImageUrls([]);
    setModalTopicId(selectedTopicId);
  };

  const openEditModal = (q: any) => {
    setEditingQuestionId(q.id);
    setQText(q.questionText);
    setExplanation(q.generalExplanation || '');
    
    // Map existing options or default to 4 empty ones
    const mappedOptions = q.options?.map((o: any) => ({
      id: o.id,
      optionText: o.optionText,
      correct: o.correct
    })) || [];
    
    // Ensure at least 4 rows in modal
    while (mappedOptions.length < 4) {
      mappedOptions.push({ optionText: '', correct: false });
    }
    
    setOptions(mappedOptions);
    setImageUrls(q.imageUrls || []);
    setModalTopicId(q.topic?.id || selectedTopicId);
    setShowModal(true);
  };

  async function handleSaveQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!modalTopicId) return;

    const payload = {
      questionText: qText,
      generalExplanation: explanation,
      topic: { id: modalTopicId },
      options: options.filter(o => o.optionText.trim() !== ''),
      imageUrls: imageUrls
    };

    try {
      if (editingQuestionId) {
        await updateQuestion(editingQuestionId, payload);
        savedIdRef.current = editingQuestionId;
      } else {
        const result = await createQuestion(payload);
        if (result && result.id) {
          savedIdRef.current = result.id;
        }
      }
      setShowModal(false);
      resetForm();
      if (selectedTopicId) {
        loadQuestions(selectedTopicId);
      }
    } catch (err) {
      alert("Failed to save question");
    }
  }

  async function confirmDelete() {
    if (!questionToDelete) return;
    try {
      await deleteQuestion(questionToDelete);
      setQuestions(prev => prev.filter(q => q.id !== questionToDelete));
      setQuestionToDelete(null);
    } catch (err) {
      alert("Failed to delete question");
    }
  }

  const toggleCorrect = (index: number) => {
    setOptions(options.map((o, i) => ({ ...o, correct: i === index })));
  };

  const updateOptionText = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index].optionText = text;
    setOptions(newOptions);
  };
  
  const handleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { url } = await uploadMedia(file, 'questions');
      setImageUrls([...imageUrls, url]);
    } catch (err) {
      alert("Upload failed: " + err);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brand} onClick={() => router.push('/admin')} style={{cursor: 'pointer'}}>OneStop Admin</div>
        <button className={styles.logoutButton} onClick={() => setShowLogoutModal(true)}>Log Out</button>

      </header>

      <main className={styles.main}>
        <div className={pageStyles.topBar}>
          <div>
            <h1 className={styles.title}>Question Bank</h1>
            <p className={styles.subtitle}>Create and organize questions by topic.</p>
          </div>
          <div className={pageStyles.actions}>
            <button className={styles.logoutButton} onClick={() => router.push('/admin')} style={{marginRight: '1rem'}}>
              Back to Dashboard
            </button>
            <select 
              className={pageStyles.topicSelect}
              value={selectedTopicId || ''} 
              onChange={e => setSelectedTopicId(Number(e.target.value))}
            >
              {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <button className={pageStyles.addBtn} onClick={() => { resetForm(); setShowModal(true); }}>
              + New Question
            </button>
          </div>
        </div>

        <section className={pageStyles.questionList}>
          {loading ? <p>Loading questions...</p> : (
            <>
              {questions.map((q, idx) => (
                <div key={q.id} id={`q-${q.id}`} className={pageStyles.qCard}>
                  <div className={pageStyles.qHeader}>
                    <span className={pageStyles.qNum}>Question #{q.id}</span>
                    <div className={pageStyles.cardBtns}>
                      <button className={pageStyles.editBtn} onClick={() => openEditModal(q)}>Edit</button>
                      <button className={pageStyles.deleteBtn} onClick={() => setQuestionToDelete(q.id)}>Delete</button>
                    </div>
                  </div>
                  <p className={pageStyles.qText}>{q.questionText}</p>
                  
                  {q.imageUrls && q.imageUrls.length > 0 && (
                    <div className={pageStyles.qImages}>
                      {q.imageUrls.map((url: string, i: number) => (
                        <img key={i} src={url} alt={`Question ${q.id} image ${i+1}`} className={pageStyles.qImgPreview} />
                      ))}
                    </div>
                  )}

                  <div className={pageStyles.optionsGrid}>
                    {q.options?.map((opt: any) => (
                      <div key={opt.id} className={`${pageStyles.option} ${opt.correct ? pageStyles.correct : ''}`}>
                        {opt.optionText}
                        {opt.correct && <span className={pageStyles.correctBadge}>Correct</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {questions.length === 0 && <p className={pageStyles.empty}>No questions found in this topic.</p>}
            </>
          )}
        </section>
      </main>

      {/* MODAL FOR NEW/EDIT QUESTION */}
      {showModal && (
        <div className={pageStyles.modalOverlay}>
          <div className={pageStyles.modal}>
            <h2>{editingQuestionId ? 'Edit Question' : 'Create New Question'}</h2>
            <form onSubmit={handleSaveQuestion}>
              <div className={pageStyles.inputGroup}>
                <label>Assigned Topic</label>
                <select 
                  value={modalTopicId || ''} 
                  onChange={e => setModalTopicId(Number(e.target.value))}
                  required
                  style={{ width: '100%', padding: '0.75rem', background: '#000', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                >
                  <option value="" disabled>Select a topic</option>
                  {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              <div className={pageStyles.inputGroup}>
                <label>Question Text</label>
                <textarea value={qText} onChange={e => setQText(e.target.value)} required />
              </div>

              <div className={pageStyles.optionsSection}>
                <label>Options (Mark the correct one)</label>
                {options.map((opt, i) => (
                  <div key={i} className={pageStyles.optionInputRow}>
                    <input 
                      type="radio" 
                      name="correct" 
                      checked={opt.correct} 
                      onChange={() => toggleCorrect(i)} 
                    />
                    <input 
                      type="text" 
                      placeholder={`Option ${i+1}`}
                      value={opt.optionText}
                      onChange={e => updateOptionText(i, e.target.value)}
                      required={i < 2}
                    />
                  </div>
                ))}
              </div>

              <div className={pageStyles.inputGroup}>
                <label>General Explanation (Shown after exam)</label>
                <textarea value={explanation} onChange={e => setExplanation(e.target.value)} />
              </div>

              <div className={pageStyles.inputGroup}>
                <label>Question Images</label>
                <div className={pageStyles.imageUploadArea}>
                  <div className={pageStyles.imageList}>
                    {imageUrls.map((url, i) => (
                      <div key={i} className={pageStyles.imageItem}>
                        <img src={url} alt="Question" />
                        <button type="button" onClick={() => removeImage(i)} className={pageStyles.removeImgBtn}>×</button>
                      </div>
                    ))}
                    <label className={pageStyles.addImgBtn}>
                      {isUploading ? '...' : '+'}
                      <input type="file" hidden onChange={handleAddImage} disabled={isUploading} accept="image/*" />
                    </label>
                  </div>
                </div>
              </div>

              <div className={pageStyles.modalActions}>
                <button type="button" className={pageStyles.cancelBtn} onClick={() => { setShowModal(false); resetForm(); }}>Cancel</button>
                <button type="submit" className={pageStyles.submitBtn}>
                  {editingQuestionId ? 'Update Question' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* MODAL FOR DELETE CONFIRMATION */}
      {questionToDelete && (
        <div className={pageStyles.modalOverlay}>
          <div className={pageStyles.modal} style={{ maxWidth: '400px', textAlign: 'center' }}>
            <h2>Confirm Deletion</h2>
            <p style={{ marginTop: '1rem', color: '#666' }}>Are you sure you want to delete this question? This action cannot be undone.</p>
            <div className={pageStyles.modalActions} style={{ marginTop: '2rem', justifyContent: 'center', gap: '1rem' }}>
              <button type="button" className={pageStyles.cancelBtn} onClick={() => setQuestionToDelete(null)}>Cancel</button>
              <button type="button" className={pageStyles.submitBtn} style={{ backgroundColor: '#ef4444' }} onClick={confirmDelete}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}


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

