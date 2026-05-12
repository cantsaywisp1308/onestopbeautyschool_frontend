'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchAdminStudentDetails, updateEnrollmentStatus } from '../../../../utils/adminApi';
import styles from '../../courses/courses.module.css';

export default function StudentDetailedProfile() {
  const params = useParams();
  const studentId = Number(params.id);

  const [studentDetails, setStudentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ACADEMIC'); // ACADEMIC, ENROLLMENTS, PROFILE

  // Unenrollment Modal State
  const [unenrollModalOpen, setUnenrollModalOpen] = useState(false);
  const [enrollmentToDrop, setEnrollmentToDrop] = useState<number | null>(null);
  const [dropReason, setDropReason] = useState('Refund Requested');

  useEffect(() => {
    if (studentId) {
      loadData();
    }
  }, [studentId]);

  async function loadData() {
    try {
      const data = await fetchAdminStudentDetails(studentId);
      setStudentDetails(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load student profile.");
    } finally {
      setLoading(false);
    }
  }

  function handleUnenrollClick(enrollmentId: number) {
    setEnrollmentToDrop(enrollmentId);
    setDropReason('Refund Requested');
    setUnenrollModalOpen(true);
  }

  async function confirmDrop() {
    if (!enrollmentToDrop) return;
    try {
      await updateEnrollmentStatus(enrollmentToDrop, 'DROPPED', dropReason);
      setUnenrollModalOpen(false);
      loadData();
    } catch (err) { alert(err); }
  }

  async function handleStatusChange(enrollmentId: number, status: string) {
    try {
      if (status === 'DROPPED' || status === 'REFUNDED') {
        setEnrollmentToDrop(enrollmentId);
        setDropReason('Other');
        setUnenrollModalOpen(true);
        return;
      }
      await updateEnrollmentStatus(enrollmentId, status);
      loadData();
    } catch (err) { alert(err); }
  }

  if (loading) return <div className={styles.container}><div className={styles.loader}>Loading student profile...</div></div>;
  if (!studentDetails) return <div className={styles.container}>Student not found.</div>;

  const { profile, enrollments, attempts } = studentDetails;

  // Calculate total spent
  const totalSpent = enrollments.reduce((sum: number, e: any) => sum + (e.pricePaid || 0), 0);

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link href="/admin/students" style={{ color: '#94a3b8', textDecoration: 'none' }}>&larr; Back to Directory</Link>
      </div>

      {/* Header Card */}
      <div style={{ background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)', border: '1px solid rgba(56,189,248,0.2)', padding: '2rem', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '2rem', marginTop: '2rem' }}>
        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 'bold', color: 'white' }}>
          {profile.firstName?.[0] || profile.username?.[0] || '?'}
        </div>
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2.5rem' }}>{profile.firstName} {profile.lastName}</h1>
          <p style={{ color: '#cbd5e1', fontSize: '1.1rem', margin: 0 }}>
            @{profile.username} | {profile.email}
          </p>
          <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', color: '#94a3b8', fontSize: '0.9rem' }}>
            <span><strong>Joined:</strong> {new Date(profile.createdAt).toLocaleDateString()}</span>
            <span><strong>Active Enrollments:</strong> {enrollments.filter((e:any) => e.status === 'ACTIVE').length}</span>
            <span><strong>LTV:</strong> ${totalSpent.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', marginTop: '3rem', paddingBottom: '1rem' }}>
        <button 
          onClick={() => setActiveTab('ACADEMIC')} 
          style={{ background: 'transparent', border: 'none', color: activeTab === 'ACADEMIC' ? '#38bdf8' : '#94a3b8', fontSize: '1.1rem', fontWeight: activeTab === 'ACADEMIC' ? 'bold' : 'normal', cursor: 'pointer', padding: '0.5rem 1rem' }}
        >
          Academic Progress
        </button>
        <button 
          onClick={() => setActiveTab('ENROLLMENTS')} 
          style={{ background: 'transparent', border: 'none', color: activeTab === 'ENROLLMENTS' ? '#38bdf8' : '#94a3b8', fontSize: '1.1rem', fontWeight: activeTab === 'ENROLLMENTS' ? 'bold' : 'normal', cursor: 'pointer', padding: '0.5rem 1rem' }}
        >
          Enrollments & Billing
        </button>
        <button 
          onClick={() => setActiveTab('PROFILE')} 
          style={{ background: 'transparent', border: 'none', color: activeTab === 'PROFILE' ? '#38bdf8' : '#94a3b8', fontSize: '1.1rem', fontWeight: activeTab === 'PROFILE' ? 'bold' : 'normal', cursor: 'pointer', padding: '0.5rem 1rem' }}
        >
          Profile Details
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ marginTop: '2rem' }}>
        
        {/* ACADEMIC TAB */}
        {activeTab === 'ACADEMIC' && (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Exam Attempts</h2>
            {attempts.length === 0 ? (
              <p style={{ color: '#94a3b8', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', textAlign: 'center' }}>No exams taken yet.</p>
            ) : (
              <div className={styles.grid}>
                {attempts.map((attempt: any) => (
                  <div key={attempt.id} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '16px' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>{attempt.exam.name}</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
                      {attempt.submitTime ? new Date(attempt.submitTime).toLocaleString() : 'In Progress'}
                    </p>
                    
                    {attempt.submitTime ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 'bold', color: attempt.passed ? '#10b981' : '#ef4444' }}>
                          {attempt.score.toFixed(1)}%
                        </span>
                        <span style={{ padding: '0.4rem 0.8rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 'bold', background: attempt.passed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: attempt.passed ? '#10b981' : '#ef4444' }}>
                          {attempt.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </div>
                    ) : (
                      <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>Taking exam now...</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ENROLLMENTS TAB */}
        {activeTab === 'ENROLLMENTS' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>Course Enrollments</h2>
            </div>
            
            {enrollments.length === 0 ? (
              <p style={{ color: '#94a3b8', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', textAlign: 'center' }}>Not enrolled in any courses.</p>
            ) : (
              <table className={styles.table} style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                    <th style={{ padding: '1rem' }}>Course Name</th>
                    <th style={{ padding: '1rem' }}>Date Enrolled</th>
                    <th style={{ padding: '1rem' }}>Price Paid</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                    <th style={{ padding: '1rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((e: any) => (
                    <tr key={e.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem', fontWeight: 'bold' }}>{e.course.title}</td>
                      <td style={{ padding: '1rem', color: '#94a3b8' }}>{new Date(e.enrollmentDate).toLocaleDateString()}</td>
                      <td style={{ padding: '1rem', color: '#10b981' }}>${e.pricePaid?.toFixed(2) || '0.00'}</td>
                      <td style={{ padding: '1rem' }}>
                        <select 
                          value={e.status || 'ACTIVE'} 
                          onChange={(ev) => handleStatusChange(e.id, ev.target.value)}
                          style={{ background: '#0f172a', color: 'white', border: '1px solid #334155', padding: '0.4rem', borderRadius: '4px' }}
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="DROPPED">Dropped</option>
                          <option value="REFUNDED">Refunded</option>
                        </select>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <button onClick={() => handleUnenrollClick(e.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'PROFILE' && (
          <div style={{ maxWidth: '600px' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Contact Information</h2>
            
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'block', marginBottom: '0.3rem' }}>Phone Number</label>
                <div style={{ fontSize: '1.1rem' }}>{profile.phone || 'Not provided'}</div>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)' }} />
              <div>
                <label style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'block', marginBottom: '0.3rem' }}>Address</label>
                <div style={{ fontSize: '1.1rem' }}>
                  {profile.address ? (
                    <>
                      {profile.address}<br/>
                      {profile.city}, {profile.state} {profile.zipCode}
                    </>
                  ) : 'Not provided'}
                </div>
              </div>
            </div>

            <h2 style={{ margin: '3rem 0 1.5rem 0' }}>Admin Actions</h2>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'not-allowed', opacity: 0.5 }}>
                Send Password Reset Email
              </button>
              <button style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'not-allowed', opacity: 0.5 }}>
                Edit Contact Info
              </button>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '1rem' }}>* These advanced admin powers are coming in a future update.</p>
          </div>
        )}

      </div>

      {/* UNENROLLMENT MODAL */}
      {unenrollModalOpen && (
        <div className={styles.modalOverlay} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className={styles.modalContent} style={{ maxWidth: '400px', width: '100%', background: '#1e293b', padding: '2rem', borderRadius: '16px', border: '1px solid #334155' }}>
            <h2>Confirm Removal</h2>
            <p style={{ margin: '1rem 0', color: '#94a3b8', fontSize: '0.9rem' }}>
              Please select a reason for dropping this student. This will be recorded for auditing purposes.
            </p>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1' }}>Reason for Dropping:</label>
              <select 
                value={dropReason}
                onChange={(e) => setDropReason(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid #334155', color: 'white', borderRadius: '8px' }}
              >
                <option value="Refund Requested">Refund Requested</option>
                <option value="Accidental Enrollment">Accidental Enrollment</option>
                <option value="Violated Terms of Service">Violated Terms of Service</option>
                <option value="Transferred to Another Course">Transferred to Another Course</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setUnenrollModalOpen(false)} style={{ padding: '0.5rem 1rem', background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={confirmDrop} style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Drop Student</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
