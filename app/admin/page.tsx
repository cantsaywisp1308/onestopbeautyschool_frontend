'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LogoutModal from '../../components/LogoutModal';

import styles from '../dashboard.module.css';


export default function AdminDashboard() {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  const toggleLogoutModal = () => setShowLogoutModal(!showLogoutModal);


  return (

    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brand}>OneStop Admin</div>
        <button className={styles.logoutButton} onClick={toggleLogoutModal}>
          Log Out
        </button>
      </header>
      
      <main className={styles.main}>
        <h1 className={styles.title}>Admin Control Panel</h1>
        <p className={styles.subtitle}>Manage exams, questions, and view student analytics.</p>
        
        <div className={styles.cardGrid}>
          <Link href="/admin/lessons" className={styles.card}>
            <h3>Global Lesson Bank</h3>
            <p>Create and structure your reusable learning modules (lessons and rich media sections).</p>
          </Link>
          <Link href="/admin/courses" className={styles.card}>
            <h3>Courses</h3>
            <p>Structure your curriculum by building full courses using lessons from the bank.</p>
          </Link>
          <Link href="/admin/topics" className={styles.card}>
            <h3>Class Topics</h3>
            <p>Define categories like Anatomy, Skin Care, or Safety to organize your question bank.</p>
          </Link>
          <Link href="/admin/questions" className={styles.card}>
            <h3>Question Bank</h3>
            <p>Add and manage multi-option questions categorized by your specific topics.</p>
          </Link>
          <Link href="/admin/exams" className={styles.card}>
            <h3>Professional Exams</h3>
            <p>Create full exams and pick the perfect set of questions from your bank.</p>
          </Link>
        </div>
      </main>

      <LogoutModal 
        isOpen={showLogoutModal} 
        onClose={toggleLogoutModal} 
        onConfirm={handleLogout} 
      />
    </div>
  );
}
