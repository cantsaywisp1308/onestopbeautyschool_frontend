'use client';

import { useState, Suspense } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import styles from './signup.module.css';
import { API_BASE_URL } from '../../utils/api';

const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }
];

export function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Registration successful
        const redirect = searchParams.get('redirect');
        router.push(`/login?registered=true${redirect ? `&redirect=${redirect}` : ''}`);
      } else {
        const errorMsg = await response.text();
        setError(errorMsg || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("Connection error. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleResponse = async (credentialResponse: any) => {
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        
        const decoded: any = jwtDecode(data.token);
        const role = decoded.role?.toLowerCase();
        
        const redirectPath = searchParams.get('redirect') || (role === 'admin' || role === 'role_admin' ? '/admin' : '/student');
        router.push(redirectPath);
      } else {
        setError("Google authentication failed on server.");
      }
    } catch (err) {
      setError("Failed to connect to backend for Google auth.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.signupCard}>
      <h1 className={styles.title}>Join OneStop</h1>
        <p className={styles.subtitle}>Complete your student profile to gain access.</p>

        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.form} onSubmit={handleSignup}>
          
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

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label htmlFor="email">Email Address</label>
              <input type="email" id="email" value={formData.email} onChange={handleChange} required className={styles.input} />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="phone">Phone Number</label>
              <input type="tel" id="phone" value={formData.phone} onChange={handleChange} required className={styles.input} />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="address">Full Address</label>
            <input type="text" id="address" value={formData.address} onChange={handleChange} className={styles.input} />
          </div>

          <div className={styles.addressGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="city">City</label>
              <input type="text" id="city" value={formData.city} onChange={handleChange} className={styles.input} />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="state">State</label>
              <select id="state" value={formData.state} onChange={handleChange} className={styles.input}>
                <option value="">Select State</option>
                {US_STATES.map(s => (
                  <option key={s.code} value={s.code}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="zipCode">ZIP</label>
              <input type="text" id="zipCode" value={formData.zipCode} onChange={handleChange} className={styles.input} />
            </div>
          </div>

          <div className={styles.divider}>Account Security</div>

          <div className={styles.inputGroup}>
            <label htmlFor="username">Choose a Username</label>
            <input type="text" id="username" value={formData.username} onChange={handleChange} required className={styles.input} autoComplete="username" />
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label htmlFor="password">Password</label>
              <input type="password" id="password" value={formData.password} onChange={handleChange} required className={styles.input} autoComplete="new-password" />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input type="password" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className={styles.input} autoComplete="new-password" />
            </div>
          </div>

          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? "Creating Account..." : "Create My Student Account"}
          </button>
        </form>

        <div className={styles.divider}>OR</div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleResponse}
            onError={() => setError("Google Signup failed")}
            theme="filled_blue"
            size="large"
            text="signup_with"
            shape="pill"
            width="100%"
          />
        </div>


        <p className={styles.backLink}>
          Already have an account? <Link href={`/login${searchParams.get('redirect') ? `?redirect=${searchParams.get('redirect')}` : ''}`}>Log In</Link>
        </p>
      </div>
  );
}

export default function SignupPage() {
  return (
    <div className={styles.container}>
      <div className={styles.backgroundGlow}></div>
      <Suspense fallback={<div style={{color: 'white', textAlign: 'center', padding: '2rem'}}>Loading...</div>}>
        <SignupContent />
      </Suspense>
    </div>
  );
}
