'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  fetchTopics, 
  fetchQuestionsByTopic, 
  addQuestionToExam, 
  fetchExamQuestions,
  createQuestion,
  updateQuestion,
  updateExamDetails,
  fetchExamById,
  removeQuestionFromExam,
  fetchCourses
} from '../../../../utils/adminApi';
import LogoutModal from '../../../../components/LogoutModal';
import styles from '../../../dashboard.module.css';
import examStyles from '../exams.module.css';

export default function ManageExam({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const examId = Number(id);
  const [topics, setTopics] = useState<any[]>([]);
  const [exam, setExam] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [availableQuestions, setAvailableQuestions] = useState<any[]>([]);
  const [examQuestions, setExamQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);
  const [editingQ, setEditingQ] = useState<any>(null);
  const [isEditingExam, setIsEditingExam] = useState(false);
  const [examEditData, setExamEditData] = useState<any>({ name: '', description: '', durationMinutes: '', passingScorePercent: '', courseId: '' });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }
  
  // New Question Form State
  const [newQ, setNewQ] = useState({
    questionText: '',
    generalExplanation: '',
    topicId: 0,
    options: [
      { optionText: '', correct: true, explanation: '' },
      { optionText: '', correct: false, explanation: '' },
      { optionText: '', correct: false, explanation: '' },
      { optionText: '', correct: false, explanation: '' }
    ]
  });

  const router = useRouter();

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      const topicData = await fetchTopics();
      setTopics(topicData);
      if (topicData.length > 0) {
        setSelectedTopicId(topicData[0].id);
        setNewQ(prev => ({ ...prev, topicId: 0 })); // 0 means no topic
      }

      const eData = await fetchExamById(examId);
      setExam(eData);
      setExamEditData({
        name: eData.name,
        description: eData.description || '',
        durationMinutes: eData.durationMinutes || '',
        passingScorePercent: eData.passingScorePercent || '',
        courseId: eData.course?.id || ''
      });

      const cData = await fetchCourses();
      setCourses(cData);

      const eqData = await fetchExamQuestions(examId);
      setExamQuestions(eqData);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    if (selectedTopicId) loadAvailableQuestions(selectedTopicId);
  }, [selectedTopicId]);

  async function loadAvailableQuestions(tid: number) {
    try {
      const data = await fetchQuestionsByTopic(tid);
      setAvailableQuestions(data);
    } catch (err) { console.error(err); }
  }

  async function handleAdd(qId: number) {
    try {
      await addQuestionToExam(examId, qId);
      const eqData = await fetchExamQuestions(examId);
      setExamQuestions(eqData);
      showToast("Question added to exam!");
    } catch (err) { alert("Question already in exam or failed to add."); }
  }

  async function handleRemove(qId: number) {
    try {
      await removeQuestionFromExam(examId, qId);
      const eqData = await fetchExamQuestions(examId);
      setExamQuestions(eqData);
      showToast("Question removed from exam.");
    } catch (err) { alert("Failed to remove question."); }
  }

  function toggleExpand(qId: number) {
    setExpandedQuestions(prev => 
      prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]
    );
  }

  const handleNewQOptionChange = (index: number, field: string, value: any) => {
    const updatedOptions = [...newQ.options];
    if (field === 'correct' && value === true) {
      // Ensure only one is correct if desired, or allow multiple
      updatedOptions.forEach((opt, i) => opt.correct = (i === index));
    } else {
      (updatedOptions[index] as any)[field] = value;
    }
    setNewQ({ ...newQ, options: updatedOptions });
  };

  async function handleCreateNewQuestion(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      const createdQ = await createQuestion(newQ);
      await addQuestionToExam(examId, createdQ.id);
      
      // Reset form
      setNewQ({
        questionText: '',
        generalExplanation: '',
        topicId: topics[0]?.id || 0,
        options: [
          { optionText: '', correct: true, explanation: '' },
          { optionText: '', correct: false, explanation: '' },
          { optionText: '', correct: false, explanation: '' },
          { optionText: '', correct: false, explanation: '' }
        ]
      });

      // Reload
      const eqData = await fetchExamQuestions(examId);
      setExamQuestions(eqData);
      if (selectedTopicId === newQ.topicId) loadAvailableQuestions(selectedTopicId);
      
      showToast("New question created and added to exam!");
    } catch (err) {
      alert("Failed to create and add question");
    }
  }

  const handleEditOptionChange = (index: number, field: string, value: any) => {
    const updatedOptions = [...editingQ.options];
    if (field === 'correct' && value === true) {
      updatedOptions.forEach((opt, i) => opt.correct = (i === index));
    } else {
      updatedOptions[index][field] = value;
    }
    setEditingQ({ ...editingQ, options: updatedOptions });
  };

  async function handleUpdateQuestion(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateQuestion(editingQ.id, editingQ);
      
      // Reload lists
      const eqData = await fetchExamQuestions(examId);
      setExamQuestions(eqData);
      if (selectedTopicId) loadAvailableQuestions(selectedTopicId);
      
      setEditingQ(null);
      showToast("Question updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update question.");
    }
  }

  async function handleUpdateExamDetails(e: React.FormEvent) {
    e.preventDefault();
    try {
      const updated = await updateExamDetails(examId, {
        name: examEditData.name,
        description: examEditData.description,
        durationMinutes: examEditData.durationMinutes === '' ? null : Number(examEditData.durationMinutes),
        passingScorePercent: examEditData.passingScorePercent === '' ? 75 : Number(examEditData.passingScorePercent),
        courseId: examEditData.courseId === '' ? null : Number(examEditData.courseId)
      });
      setExam(updated);
      setIsEditingExam(false);
      showToast("Exam settings updated!");
    } catch (err) {
      alert("Failed to update exam settings.");
    }
  }

  return (
    <div className={styles.container}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)', color: 'white',
          padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', zIndex: 9999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)', animation: 'fadeIn 0.3s forwards ease-out'
        }}>
          {toastMessage}
        </div>
      )}

      <header className={styles.header}>
        <div className={styles.brand} onClick={() => router.push('/admin')} style={{cursor: 'pointer'}}>OneStop Admin</div>
        <button className={styles.logoutButton} onClick={() => setShowLogoutModal(true)}>Log Out</button>

      </header>

      <main className={styles.main}>
        <div className={examStyles.topBar}>
          <div>
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <h1 className={styles.title} style={{marginBottom: 0}}>Exam: {exam?.name}</h1>
              <button 
                onClick={() => setIsEditingExam(true)} 
                className={examStyles.viewBtn} 
                style={{padding: '0.3rem 0.8rem', fontSize: '0.8rem'}}
              >
                Edit Settings
              </button>
            </div>
            <p className={styles.subtitle} style={{marginTop: '0.5rem'}}>{exam?.description}</p>
            {exam?.durationMinutes && exam.durationMinutes > 0 ? (
              <span style={{display: 'inline-block', marginTop: '0.5rem', background: 'rgba(167, 139, 250, 0.2)', color: '#a78bfa', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'}}>
                ⏱ {exam.durationMinutes} Minutes
              </span>
            ) : (
              <span style={{display: 'inline-block', marginTop: '0.5rem', background: 'rgba(255, 255, 255, 0.1)', color: '#cbd5e1', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'}}>
                Unlimited Time
              </span>
            )}
          </div>
          <button className={styles.logoutButton} onClick={() => router.push('/admin/exams')}>Back to Exams</button>
        </div>

        <div className={examStyles.builderLayout}>
          {/* Left: Exam Questions */}
          <div className={examStyles.panel}>
            <h3>Included Questions ({examQuestions.length})</h3>
            <div className={examStyles.scrollList}>
              {examQuestions.map((q) => (
                <div key={q.id} className={examStyles.miniQCard}>
                  <div className={examStyles.qInfo}>
                    <small>#{q.id}</small>
                    <p>{q.questionText}</p>
                  </div>
                  <div className={examStyles.qActionRow}>
                    <button onClick={() => setEditingQ({...JSON.parse(JSON.stringify(q)), topicId: q.topic?.id || ''})} className={examStyles.viewBtn}>Edit</button>
                    <button onClick={() => handleRemove(q.id)} className={examStyles.removeBtn}>Remove</button>
                  </div>
                </div>
              ))}
              {examQuestions.length === 0 && <p className={examStyles.emptyText}>No questions added yet.</p>}
            </div>
          </div>

          {/* Right: Available Questions */}
          <div className={examStyles.panel}>
            <div className={examStyles.panelHeader}>
              <h3>Browse Topic Bank</h3>
              <select 
                className={examStyles.topicSelect}
                value={selectedTopicId || ''} 
                onChange={e => setSelectedTopicId(Number(e.target.value))}
              >
                {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            
            <div className={examStyles.scrollList}>
              {availableQuestions.map(q => {
                const isInExam = examQuestions.some(eq => eq.id === q.id);
                const isExpanded = expandedQuestions.includes(q.id);
                return (
                  <div key={q.id} style={{display: 'flex', flexDirection: 'column'}}>
                    <div className={`${examStyles.miniQCard} ${isInExam ? examStyles.dimmed : ''}`}>
                      <div className={examStyles.qInfo}>
                        <small>#{q.id}</small>
                        <p>{q.questionText}</p>
                      </div>
                      <div className={examStyles.qActionRow}>
                        <button onClick={() => toggleExpand(q.id)} className={examStyles.viewBtn}>
                          {isExpanded ? 'Hide Info' : 'View Info'}
                        </button>
                        <button onClick={() => setEditingQ({...JSON.parse(JSON.stringify(q)), topicId: q.topic?.id || ''})} className={examStyles.viewBtn}>Edit</button>
                        {!isInExam ? (
                          <button onClick={() => handleAdd(q.id)} className={examStyles.addBtnMini}>Add</button>
                        ) : (
                          <span className={examStyles.addedLabel}>In Exam</span>
                        )}
                      </div>
                    </div>
                    {isExpanded && (
                      <div className={examStyles.qOptionsList}>
                        {q.options?.map((opt: any, idx: number) => (
                          <div key={idx} className={`${examStyles.optionItem} ${opt.correct ? examStyles.correctOption : ''}`}>
                            <strong>{String.fromCharCode(65 + idx)}.</strong>
                            <div>
                              <span>{opt.optionText}</span>
                              {opt.explanation && <p style={{fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem'}}>{opt.explanation}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Adjust Exam Settings Form */}
        <section className={examStyles.newQSection} style={{marginBottom: '2rem'}}>
          <h2>Exam Duration</h2>
          <form onSubmit={handleUpdateExamDetails} className={examStyles.newQForm}>
            <div className={examStyles.formRow} style={{maxWidth: '300px'}}>
              <label>Time Limit (Minutes)</label>
              <input 
                type="number" 
                min="0"
                value={examEditData.durationMinutes} 
                onChange={e => setExamEditData({...examEditData, durationMinutes: e.target.value})}
                placeholder="e.g. 60 (Leave blank for unlimited)" 
              />
            </div>
            <button type="submit" className={examStyles.addBtnMini} style={{padding: '0.8rem 1.5rem', width: 'auto', marginTop: '1rem'}}>
              Save Time Limit
            </button>
          </form>
        </section>

        {/* Brand New Question Form */}
        <section className={examStyles.newQSection}>
          <h2>Create & Add Brand New Question</h2>
          <form onSubmit={handleCreateNewQuestion} className={examStyles.newQForm}>
            <div className={examStyles.formRow}>
              <label>Select Topic for this question</label>
              <select 
                value={newQ.topicId || ''} 
                onChange={e => setNewQ({...newQ, topicId: Number(e.target.value)})}
              >
                <option value="">-- No Topic (General Exam Question) --</option>
                {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div className={examStyles.formRow}>
              <label>Question Text</label>
              <textarea 
                rows={3}
                value={newQ.questionText} 
                onChange={e => setNewQ({...newQ, questionText: e.target.value})}
                placeholder="Type the question here..."
                required 
              />
            </div>

            <div className={examStyles.optionsGrid}>
              {newQ.options.map((opt, idx) => (
                <div key={idx} className={examStyles.optionField}>
                  <div className={examStyles.optionHeader}>
                    <label>Option {String.fromCharCode(65 + idx)}</label>
                    <div 
                      className={examStyles.checkboxGroup}
                      onClick={() => handleNewQOptionChange(idx, 'correct', true)}
                    >
                      <input type="radio" checked={opt.correct} readOnly />
                      <span>Correct Answer</span>
                    </div>
                  </div>
                  <input 
                    type="text" 
                    value={opt.optionText}
                    onChange={e => handleNewQOptionChange(idx, 'optionText', e.target.value)}
                    placeholder={`Answer text for ${String.fromCharCode(65 + idx)}`}
                    required
                  />
                  <textarea 
                    style={{marginTop: '0.5rem', fontSize: '0.8rem'}}
                    rows={2}
                    value={opt.explanation}
                    onChange={e => handleNewQOptionChange(idx, 'explanation', e.target.value)}
                    placeholder="Explanation for this choice..."
                  />
                </div>
              ))}
            </div>

            <div className={examStyles.formRow}>
              <label>General Explanation (shown to student after answering)</label>
              <textarea 
                rows={2}
                value={newQ.generalExplanation} 
                onChange={e => setNewQ({...newQ, generalExplanation: e.target.value})}
                placeholder="Give more context about the correct answer..."
              />
            </div>

            <button type="submit" className={examStyles.addBtnMini} style={{padding: '1rem', fontSize: '1rem'}}>
              Create and Add to Exam
            </button>
          </form>
        </section>
      </main>

      {/* Edit Question Modal */}
      {editingQ && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
          backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', 
          justifyContent: 'center', alignItems: 'center', padding: '2rem'
        }}>
          <div style={{
            background: 'rgba(20, 20, 25, 1)', border: '1px solid rgba(255, 255, 255, 0.1)', 
            borderRadius: '12px', padding: '2.5rem', maxWidth: '800px', width: '100%', 
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.8)'
          }}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
              <h2>Edit Question #{editingQ.id}</h2>
              <button onClick={() => setEditingQ(null)} style={{background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer'}}>✕</button>
            </div>
            <form onSubmit={handleUpdateQuestion} className={examStyles.newQForm}>
              <div className={examStyles.formRow}>
                <label>Assigned Topic</label>
                <select 
                  value={editingQ.topicId || ''} 
                  onChange={e => setEditingQ({...editingQ, topicId: Number(e.target.value) || null})}
                >
                  <option value="">-- No Topic (General Exam Question) --</option>
                  {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              <div className={examStyles.formRow}>
                <label>Question Text</label>
                <textarea 
                  rows={3}
                  value={editingQ.questionText} 
                  onChange={e => setEditingQ({...editingQ, questionText: e.target.value})}
                  required 
                />
              </div>

              <div className={examStyles.optionsGrid}>
                {editingQ.options.map((opt: any, idx: number) => (
                  <div key={idx} className={examStyles.optionField}>
                    <div className={examStyles.optionHeader}>
                      <label>Option {String.fromCharCode(65 + idx)}</label>
                      <div 
                        className={examStyles.checkboxGroup}
                        onClick={() => handleEditOptionChange(idx, 'correct', true)}
                      >
                        <input type="radio" checked={opt.correct} readOnly />
                        <span>Correct Answer</span>
                      </div>
                    </div>
                    <input 
                      type="text" 
                      value={opt.optionText}
                      onChange={e => handleEditOptionChange(idx, 'optionText', e.target.value)}
                      required
                    />
                    <textarea 
                      style={{marginTop: '0.5rem', fontSize: '0.8rem'}}
                      rows={2}
                      value={opt.explanation || ''}
                      onChange={e => handleEditOptionChange(idx, 'explanation', e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div className={examStyles.formRow}>
                <label>General Explanation</label>
                <textarea 
                  rows={2}
                  value={editingQ.generalExplanation || ''} 
                  onChange={e => setEditingQ({...editingQ, generalExplanation: e.target.value})}
                />
              </div>

              <button type="submit" className={examStyles.addBtnMini} style={{padding: '1rem', fontSize: '1rem', width: '100%'}}>
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Exam Settings Modal */}
      {isEditingExam && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
          backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', 
          justifyContent: 'center', alignItems: 'center', padding: '2rem'
        }}>
          <div style={{
            background: 'rgba(20, 20, 25, 1)', border: '1px solid rgba(255, 255, 255, 0.1)', 
            borderRadius: '12px', padding: '2.5rem', maxWidth: '500px', width: '100%', 
            boxShadow: '0 10px 40px rgba(0,0,0,0.8)'
          }}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
              <h2>Edit Exam Settings</h2>
              <button onClick={() => setIsEditingExam(false)} style={{background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer'}}>✕</button>
            </div>
            <form onSubmit={handleUpdateExamDetails} className={examStyles.newQForm}>
              <div className={examStyles.formRow}>
                <label>Exam Name</label>
                <input 
                  type="text" 
                  value={examEditData.name} 
                  onChange={e => setExamEditData({...examEditData, name: e.target.value})}
                  required 
                />
              </div>
              <div className={examStyles.formRow}>
                <label>Description</label>
                <textarea 
                  rows={2}
                  value={examEditData.description} 
                  onChange={e => setExamEditData({...examEditData, description: e.target.value})}
                />
              </div>
              <div className={examStyles.formRow}>
                <label>Time Limit (Minutes)</label>
                <input 
                  type="number" 
                  min="0"
                  value={examEditData.durationMinutes} 
                  onChange={e => setExamEditData({...examEditData, durationMinutes: e.target.value})}
                  placeholder="e.g. 60 (Leave blank for unlimited)" 
                />
              </div>
              <div className={examStyles.formRow}>
                <label>Passing Threshold (%)</label>
                <input 
                  type="number" 
                  min="0"
                  max="100"
                  value={examEditData.passingScorePercent} 
                  onChange={e => setExamEditData({...examEditData, passingScorePercent: e.target.value})}
                  placeholder="Default: 75%" 
                />
              </div>
              <div className={examStyles.formRow}>
                <label>Assigned Course</label>
                <select 
                  value={examEditData.courseId} 
                  onChange={e => setExamEditData({...examEditData, courseId: e.target.value})}
                >
                  <option value="">-- No Course --</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className={examStyles.addBtnMini} style={{padding: '1rem', fontSize: '1rem', width: '100%', marginTop: '1rem'}}>
                Save Settings
              </button>
            </form>
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
// async function removeQuestionFromExam(examId: number, qId: number) {
//   const res = await fetch(`/api/admin/exams/${examId}/questions/${qId}`, {
//     method: 'DELETE',
//     headers: {
//       'Content-Type': 'application/json'
//     }
//   });

//   if (!res.ok) {
//     const errorText = await res.text();
//     throw new Error(`Failed to remove question from exam: ${res.status} ${errorText}`);
//   }
// }

