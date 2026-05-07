'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import LogoutModal from './LogoutModal';
import styles from './AdminSidebar.module.css';

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [academicsOpen, setAcademicsOpen] = useState(true);
  const [marketingOpen, setMarketingOpen] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <>
      {/* Hamburger Menu Button */}
      <button 
        className={`${styles.hamburger} ${isOpen ? styles.hamburgerOpen : ''}`} 
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <span className={styles.hamburgerLine}></span>
        <span className={styles.hamburgerLine}></span>
        <span className={styles.hamburgerLine}></span>
      </button>

      {/* Overlay for mobile */}
      {isOpen && <div className={styles.overlay} onClick={toggleSidebar}></div>}

      {/* Sidebar Drawer */}
      <div className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.brand}>OneStop Admin</div>
        </div>

        <div className={styles.sidebarContent}>
          <Link 
            href="/admin" 
            className={`${styles.menuItem} ${pathname === '/admin' ? styles.active : ''}`}
            onClick={() => setIsOpen(false)}
          >
            Dashboard Home
          </Link>

          {/* Academics Section */}
          <div className={styles.section}>
            <button 
              className={styles.sectionToggle} 
              onClick={() => setAcademicsOpen(!academicsOpen)}
            >
              <span className={styles.sectionTitle}>Academics</span>
              <span className={styles.chevron}>{academicsOpen ? '▼' : '▶'}</span>
            </button>
            
            <div className={`${styles.sectionItems} ${academicsOpen ? styles.sectionOpen : ''}`}>
              <Link href="/admin/lessons" className={`${styles.subMenuItem} ${pathname === '/admin/lessons' ? styles.active : ''}`} onClick={() => setIsOpen(false)}>
                Global Lesson Bank
              </Link>
              <Link href="/admin/courses" className={`${styles.subMenuItem} ${pathname === '/admin/courses' ? styles.active : ''}`} onClick={() => setIsOpen(false)}>
                Courses
              </Link>
              <Link href="/admin/topics" className={`${styles.subMenuItem} ${pathname === '/admin/topics' ? styles.active : ''}`} onClick={() => setIsOpen(false)}>
                Class Topics
              </Link>
              <Link href="/admin/questions" className={`${styles.subMenuItem} ${pathname === '/admin/questions' ? styles.active : ''}`} onClick={() => setIsOpen(false)}>
                Question Bank
              </Link>
              <Link href="/admin/exams" className={`${styles.subMenuItem} ${pathname === '/admin/exams' ? styles.active : ''}`} onClick={() => setIsOpen(false)}>
                Professional Exams
              </Link>
            </div>
          </div>

          {/* Marketing & Content Section */}
          <div className={styles.section}>
            <button 
              className={styles.sectionToggle} 
              onClick={() => setMarketingOpen(!marketingOpen)}
            >
              <span className={styles.sectionTitle}>Marketing & Content</span>
              <span className={styles.chevron}>{marketingOpen ? '▼' : '▶'}</span>
            </button>
            
            <div className={`${styles.sectionItems} ${marketingOpen ? styles.sectionOpen : ''}`}>
              <Link href="/admin/events" className={`${styles.subMenuItem} ${pathname === '/admin/events' ? styles.active : ''}`} onClick={() => setIsOpen(false)}>
                Events
              </Link>
              <Link href="/admin/blog" className={`${styles.subMenuItem} ${pathname === '/admin/blog' ? styles.active : ''}`} onClick={() => setIsOpen(false)}>
                Blog Posts
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutButton} onClick={() => setShowLogoutModal(true)}>
            Log Out
          </button>
        </div>
      </div>

      <LogoutModal 
        isOpen={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)} 
        onConfirm={handleLogout} 
      />
    </>
  );
}
