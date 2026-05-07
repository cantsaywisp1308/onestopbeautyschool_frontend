'use client';

import { useState, useEffect } from 'react';
import { fetchDashboardMetrics } from '../../utils/adminApi';
import styles from '../dashboard.module.css';

interface DashboardMetrics {
  totalRevenueAllTime: number;
  totalRevenueThisMonth: number;
  totalStudents: number;
  newEnrollmentsThisMonth: number;
  totalCourses: number;
  totalQuestions: number;
  averageExamScore: number;
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [revenueTab, setRevenueTab] = useState<'month' | 'allTime'>('month');

  useEffect(() => {
    loadMetrics();
  }, []);

  async function loadMetrics() {
    try {
      const data = await fetchDashboardMetrics();
      setMetrics(data);
    } catch (error) {
      console.error("Failed to load metrics:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brand}>OneStop Admin</div>
      </header>
      
      <main className={styles.main}>
        <h1 className={styles.title}>Dashboard Overview</h1>
        <p className={styles.subtitle}>A high-level view of your beauty school's performance.</p>
        
        {loading ? (
          <p>Loading analytics...</p>
        ) : metrics ? (
          <div className={styles.analyticsGrid}>
            
            {/* REVENUE CARD with Tabs */}
            <div className={styles.statCard}>
              <div className={styles.cardHeader}>
                <h3>Revenue</h3>
                <div className={styles.tabs}>
                  <button 
                    className={`${styles.tab} ${revenueTab === 'month' ? styles.activeTab : ''}`}
                    onClick={() => setRevenueTab('month')}
                  >
                    This Month
                  </button>
                  <button 
                    className={`${styles.tab} ${revenueTab === 'allTime' ? styles.activeTab : ''}`}
                    onClick={() => setRevenueTab('allTime')}
                  >
                    All-Time
                  </button>
                </div>
              </div>
              <p className={styles.statValue}>
                ${revenueTab === 'month' 
                  ? metrics.totalRevenueThisMonth?.toFixed(2) || '0.00'
                  : metrics.totalRevenueAllTime?.toFixed(2) || '0.00'}
              </p>
              <p className={styles.statLabel}>
                {revenueTab === 'month' ? 'Earned this calendar month' : 'Lifetime earnings'}
              </p>
            </div>

            {/* STUDENTS CARD */}
            <div className={styles.statCard}>
              <div className={styles.cardHeader}>
                <h3>Students</h3>
              </div>
              <p className={styles.statValue}>{metrics.totalStudents || 0}</p>
              <p className={styles.statLabel}>
                <span className={styles.trendUp}>+{metrics.newEnrollmentsThisMonth || 0}</span> new enrollments this month
              </p>
            </div>

            {/* ACADEMICS CARD */}
            <div className={styles.statCard}>
              <div className={styles.cardHeader}>
                <h3>Average Score</h3>
              </div>
              <p className={styles.statValue}>{metrics.averageExamScore?.toFixed(1) || 0}%</p>
              <p className={styles.statLabel}>Global average across all exams</p>
            </div>

            {/* CONTENT CARD */}
            <div className={styles.statCard}>
              <div className={styles.cardHeader}>
                <h3>Content Catalog</h3>
              </div>
              <div className={styles.multiStat}>
                <div>
                  <p className={styles.subStatValue}>{metrics.totalCourses || 0}</p>
                  <p className={styles.statLabel}>Active Courses</p>
                </div>
                <div>
                  <p className={styles.subStatValue}>{metrics.totalQuestions || 0}</p>
                  <p className={styles.statLabel}>Question Bank</p>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <p>Failed to load analytics data.</p>
        )}
      </main>
    </div>
  );
}
