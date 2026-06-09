'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import Link from 'next/link';
import { GoogleLogin } from '@react-oauth/google';
import styles from './login.module.css';
import { API_BASE_URL } from '../../utils/api';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (searchParams.get('registered')) {
      setMessage('Registration successful! Please log in.');
    }
    if (searchParams.get('expired')) {
      setError('Your session has expired. Please log in again to continue.');
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        
        const decoded: any = jwtDecode(data.token);
        const role = decoded.role?.toLowerCase();
        
        const redirectPath = searchParams.get('redirect') || (role === 'admin' || role === 'role_admin' ? '/admin' : '/student');
        router.push(redirectPath);
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('Connection error. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleResponse = async (credentialResponse: any) => {
    setError('');
    setMessage('');
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
    <div className={styles.loginCard}>
      <h1 className={styles.title}>OneStop Beauty</h1>
      <p className={styles.subtitle}>Welcome back. Please log in to your account.</p>

      {message && <div style={{color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center'}}>{message}</div>}
      {error && <div className={styles.error}>{error}</div>}

      <form className={styles.form} onSubmit={handleLogin}>
        <div className={styles.inputGroup}>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        <div className={styles.forgotContainer}>
          <Link href="/login/forgot-password" className={styles.forgotLink}>
            Forgot Password?
          </Link>
        </div>
        <button type="submit" disabled={loading} className={styles.submitButton}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <p className={styles.backLink}>
        Don't have an account? <Link href={`/signup${searchParams.get('redirect') ? `?redirect=${searchParams.get('redirect')}` : ''}`}>Sign up now</Link>
      </p>

      <div className={styles.divider}>OR</div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <GoogleLogin
          onSuccess={handleGoogleResponse}
          onError={() => setError("Google Login failed")}
          theme="filled_blue"
          size="large"
          shape="pill"
          width="100%"
        />
      </div>

      
      <p className={styles.backLink}>
        <Link href="/">&larr; Back to Home</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <div className={styles.backgroundGlow}></div>
      <Suspense fallback={<div>Loading...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  );
}
