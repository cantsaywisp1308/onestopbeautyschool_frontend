'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../../signup/signup.module.css';
import { fetchMyProfile, updateMyProfile } from '../../../utils/studentApi';

export default function ProfilePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    username: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const data = await fetchMyProfile();
      setFormData({
        firstName: data.firstName || '',
        middleName: data.middleName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        zipCode: data.zipCode || '',
        username: data.username || ''
      });
    } catch (err) {
      setError("Failed to load profile details.");
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      await updateMyProfile(formData);
      setMessage("Profile updated successfully!");
      // Scroll to top to see message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.container}><p>Loading your profile...</p></div>;

  return (
    <div className={styles.container}>
      <div className={styles.backgroundGlow}></div>
      
      <div className={styles.signupCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 className={styles.title} style={{ textAlign: 'left', margin: 0 }}>My Profile</h1>
          <Link href="/student" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>
            &larr; Back to Dashboard
          </Link>
        </div>

        {message && <div style={{color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid rgba(16,185,129,0.2)'}}>{message}</div>}
        {error && <div className={styles.error} style={{ marginBottom: '2rem' }}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          
          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label htmlFor="username">Username (Locked)</label>
              <input type="text" id="username" value={formData.username} readOnly disabled className={styles.input} style={{ opacity: 0.6, cursor: 'not-allowed' }} />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="email">Email Address (Locked)</label>
              <input type="email" id="email" value={formData.email} readOnly disabled className={styles.input} style={{ opacity: 0.6, cursor: 'not-allowed' }} />
            </div>
          </div>

          <div className={styles.divider}>Personal Information</div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label htmlFor="firstName">First Name</label>
              <input type="text" id="firstName" value={formData.firstName} onChange={handleChange} required className={styles.input} />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="lastName">Last Name</label>
              <input type="text" id="lastName" value={formData.lastName} onChange={handleChange} required className={styles.input} />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="phone">Phone Number</label>
            <input type="tel" id="phone" value={formData.phone} onChange={handleChange} required className={styles.input} />
          </div>

          <div className={styles.divider}>Address Details</div>

          <div className={styles.inputGroup}>
            <label htmlFor="address">Street Address</label>
            <input type="text" id="address" value={formData.address} onChange={handleChange} className={styles.input} />
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup} style={{ flex: 2 }}>
              <label htmlFor="city">City</label>
              <input type="text" id="city" value={formData.city} onChange={handleChange} className={styles.input} />
            </div>
            <div className={styles.inputGroup} style={{ flex: 1 }}>
              <label htmlFor="state">State</label>
              <input type="text" id="state" value={formData.state} onChange={handleChange} className={styles.input} maxLength={2} />
            </div>
            <div className={styles.inputGroup} style={{ flex: 1 }}>
              <label htmlFor="zipCode">ZIP</label>
              <input type="text" id="zipCode" value={formData.zipCode} onChange={handleChange} className={styles.input} />
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <button type="submit" disabled={saving} className={styles.submitButton}>
              {saving ? "Saving Changes..." : "Save My Profile"}
            </button>
          </div>
        </form>

        <p className={styles.backLink} style={{ marginTop: '2.5rem' }}>
          Registered with Google? Changes will reflect your OneStop profile.
        </p>
      </div>
    </div>
  );
}
