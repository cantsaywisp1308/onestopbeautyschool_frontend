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
  const [pastEventIndex, setPastEventIndex] = useState(0);

  const pastEventImages = [
    '/events/past1.png',
    '/events/past2.png',
    '/events/past3.png'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPastEventIndex((prev) => (prev + 1) % pastEventImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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

        <section className={styles.eventsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>School Events</h2>
            <p className={styles.sectionSubtitle}>Stay connected with our community and witness our journey.</p>
          </div>

          <div className={styles.eventsGrid}>
            {/* Upcoming Event */}
            <div className={styles.eventCard}>
              <div className={styles.eventBadge}>Upcoming</div>
              <div className={styles.eventImageWrapper}>
                <img src="/events/upcoming.png" alt="Upcoming Event" className={styles.eventImage} />
                <div className={styles.eventDate}>MAY 25</div>
              </div>
              <div className={styles.eventInfo}>
                <h3>Masterclass: Bridal Makeup</h3>
                <p>Join us for an exclusive demonstration of the latest bridal makeup trends by a guest celebrity artist.</p>
                <button className={styles.eventButton}>Learn More</button>
              </div>
            </div>

            {/* Past Event Carousel */}
            <div className={styles.eventCard}>
              <div className={styles.eventBadge} style={{ background: 'rgba(255,255,255,0.1)' }}>Past Highlights</div>
              <div className={styles.eventImageWrapper}>
                {pastEventImages.map((src, idx) => (
                  <img 
                    key={src} 
                    src={src} 
                    alt="Past Event" 
                    className={`${styles.eventImage} ${styles.carouselImage} ${idx === pastEventIndex ? styles.active : ''}`} 
                  />
                ))}
                <div className={styles.carouselDots}>
                  {pastEventImages.map((_, idx) => (
                    <span key={idx} className={`${styles.dot} ${idx === pastEventIndex ? styles.dotActive : ''}`}></span>
                  ))}
                </div>
              </div>
              <div className={styles.eventInfo}>
                <h3>Celebrating Our Journey</h3>
                <p>A look back at our recent graduation ceremony, student workshops, and community gatherings.</p>
                <button className={styles.eventButton} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}>View Gallery</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerColumn}>
            <div className={styles.footerLogo}>
              <img src="/pics/logo.png" alt="OneStop Beauty School" className={styles.smallLogo} />
              <h4>OneStop <span className={styles.highlightSmall}>Beauty</span></h4>
            </div>
            <div className={styles.contactInfo}>
              <p><strong>Email:</strong> <a href="mailto:info@onestopbeautyschool.com">info@onestopbeautyschool.com</a></p>
              <p><strong>Address:</strong> 4360 N Milwaukee Ave, Chicago, IL 60641, USA</p>
              <p><strong>Call/Text:</strong> 708-377-3051</p>
              <p><strong>Fax:</strong> 773-232-8969</p>
            </div>
            <div className={styles.socialLinks}>
              <a href="https://www.facebook.com/onestopbeautyschool" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>Facebook</a>
              <a href="https://www.instagram.com/onestopbeautyschool" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>Instagram</a>
              <a href="https://www.google.com/maps?cid=13375499441606361906" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>Maps</a>
            </div>
          </div>

          <div className={styles.footerColumn}>
            <h3 className={styles.footerHeading}>School Hours</h3>
            <ul className={styles.hoursList}>
              <li><span>Tuesday</span> <span>10 AM to 7 PM</span></li>
              <li><span>Wednesday</span> <span>10 AM to 7 PM</span></li>
              <li><span>Thursday</span> <span>10 AM to 7 PM</span></li>
              <li><span>Friday</span> <span className={styles.closed}>CLOSED</span></li>
              <li><span>Saturday</span> <span className={styles.closed}>CLOSED</span></li>
              <li><span>Sun & Mon</span> <span className={styles.closed}>CLOSED</span></li>
            </ul>
          </div>

          <div className={styles.footerColumn}>
            <h3 className={styles.footerHeading}>Quick Links</h3>
            <div className={styles.resourceLinks}>
              <a href="https://www.lotusscholarship.com/" target="_blank" rel="noopener noreferrer" className={styles.foundationLink}>
                One Stop Beauty Foundation
              </a>
              <Link href="/privacy" className={styles.footerLink}>Privacy Policy</Link>
            </div>
            <div className={styles.bbbWrapper}>
              <img src="/bbb_logo.png" alt="BBB Accredited Business" className={styles.bbbLogo} />
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© 2026 OneStop Beauty School. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
