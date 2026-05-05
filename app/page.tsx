'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dashboardUrl, setDashboardUrl] = useState('/login');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const role = decoded.role?.toLowerCase();
        setIsLoggedIn(true);
        if (role === 'admin' || role === 'role_admin') {
          setDashboardUrl('/admin');
        } else {
          setDashboardUrl('/student');
        }
      } catch (e) {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
      }
    }
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.backgroundGlow}></div>
      
      <header className={styles.navbar}>
        <div className={styles.navLeft}>
          <button 
            className={styles.hamburgerBtn} 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>
      </header>

      {/* Overlay to close menu when clicking outside */}
      {isMenuOpen && (
        <div className={styles.menuOverlay} onClick={() => setIsMenuOpen(false)}></div>
      )}

      {/* Side Menu Drawer */}
      {isMenuOpen && (
        <nav className={styles.sideMenu}>
          <button className={styles.closeBtn} onClick={() => setIsMenuOpen(false)}>✕</button>
          <Link href="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <a href="#testimonials" onClick={() => setIsMenuOpen(false)}>Testimonials</a>
          <a href="#team" onClick={() => setIsMenuOpen(false)}>Our Team</a>
          <Link href="/programs" className={styles.highlightedMenuItem} onClick={() => setIsMenuOpen(false)}>
            <span>Programs</span>
          </Link>
          <a href="#ceu" onClick={() => setIsMenuOpen(false)}>CEU Classes</a>
          <a href="#salon" onClick={() => setIsMenuOpen(false)}>Student Salon</a>
          <a href="#exam-prep" onClick={() => setIsMenuOpen(false)}>Exam PREP</a>
          <div className={styles.sideMenuDivider}></div>
          <a href="#contact" onClick={() => setIsMenuOpen(false)}>Contact</a>
          <a href="#faq" onClick={() => setIsMenuOpen(false)}>FAQ</a>
        </nav>
      )}

      <main className={styles.main}>
        <div className={styles.heroSection}>
          
          <div className={styles.logoContainer}>
            <img 
              src="/pics/logo.png" 
              alt="OneStop Beauty School Logo" 
              className={styles.logo}
            />
          </div>

          <h1 className={styles.title}>
            OneStop <span className={styles.highlight}>Beauty School</span>
          </h1>
          <p className={styles.description}>
            Your premier platform for interactive exams, comprehensive learning, and professional beauty training. Transform your passion into a career.
          </p>
          
          <div className={styles.actions}>
            {isLoggedIn ? (
              <Link href={dashboardUrl} className={styles.primaryButton}>
                Go to Dashboard &rarr;
              </Link>
            ) : (
              <Link href="/login" className={styles.primaryButton}>
                Login to Platform
              </Link>
            )}
            <a href="#about" className={styles.secondaryButton}>
              Learn More
            </a>
          </div>
        </div>

        <div className={styles.featuresSection}>
          <div className={styles.featureCard}>
            <h3>Interactive Exams</h3>
            <p>Take dynamic, multi-option exams fully tailored to beauty education curricula.</p>
          </div>
          <div className={styles.featureCard}>
            <h3>Manage Progress</h3>
            <p>Track your scores, past attempts, and identify areas to improve your practical skills.</p>
          </div>
          <div className={styles.featureCard}>
            <h3>Secure Platform</h3>
            <p>An enterprise-grade platform keeping all your institutional records safe and easily accessible.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
