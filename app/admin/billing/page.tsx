'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchAdminBillingHistory } from '../../../utils/adminApi';
import styles from './billing.module.css';

interface PaymentRecord {
  id: number;
  student: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
  };
  course: {
    id: number;
    title: string;
  };
  pricingOptionName: string;
  pricePaid: number;
  paymentDate: string;
  expiryDate: string | null;
  stripeSessionId: string;
}

export default function AdminBillingPage() {
  const [records, setRecords] = useState<PaymentRecord[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadBillingHistory(page);
  }, [page]);

  async function loadBillingHistory(pageNum: number) {
    try {
      setLoading(true);
      const data = await fetchAdminBillingHistory(pageNum, 50);
      setRecords(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load billing history:', err);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function checkStatus(expiryDateStr: string | null) {
    if (!expiryDateStr) return 'Lifetime';
    const expiry = new Date(expiryDateStr);
    const now = new Date();
    return expiry > now ? 'Active' : 'Expired';
  }

  const filteredRecords = records.filter(record => {
    const studentName = `${record.student?.firstName || ''} ${record.student?.lastName || ''}`.toLowerCase();
    const studentEmail = (record.student?.email || '').toLowerCase();
    const courseTitle = (record.course?.title || '').toLowerCase();
    const optionName = (record.pricingOptionName || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    return studentName.includes(query) || 
           studentEmail.includes(query) || 
           courseTitle.includes(query) ||
           optionName.includes(query);
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Billing Audit Log</h1>
          <p style={{ color: '#94a3b8', marginTop: '0.25rem' }}>
            Monitor and audit all student payments, renewals, and transaction metadata.
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Filter by student, email, course, or pass..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(255, 255, 255, 0.02)',
            color: 'white',
            outline: 'none',
            fontSize: '0.95rem',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#ec4899'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
        />
      </div>

      {loading ? (
        <div className={styles.empty}>Loading payment history logs...</div>
      ) : (
        <>
          {filteredRecords.length === 0 ? (
            <div className={styles.empty}>
              {searchQuery ? 'No payment records match your search query.' : 'No transactions recorded yet.'}
            </div>
          ) : (
            <>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Student</th>
                      <th>Program</th>
                      <th>Pass Option</th>
                      <th>Amount Paid</th>
                      <th>Expiry</th>
                      <th>Status</th>
                      <th>Stripe Session ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map(record => {
                      const status = checkStatus(record.expiryDate);
                      return (
                        <tr key={record.id}>
                          <td>{formatDate(record.paymentDate)}</td>
                          <td>
                            <div style={{ fontWeight: '600' }}>
                              {record.student?.firstName} {record.student?.lastName}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                              {record.student?.email}
                            </div>
                          </td>
                          <td style={{ fontWeight: '600' }}>{record.course?.title}</td>
                          <td>{record.pricingOptionName}</td>
                          <td className={styles.price}>${record.pricePaid.toFixed(2)}</td>
                          <td>{record.expiryDate ? new Date(record.expiryDate).toLocaleDateString() : 'Lifetime'}</td>
                          <td>
                            <span className={`${styles.badge} ${status === 'Expired' ? styles.badgeExpired : styles.badgeActive}`}>
                              {status}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                            {record.stripeSessionId ? (
                              <span title={record.stripeSessionId}>
                                {record.stripeSessionId.substring(0, 15)}...
                              </span>
                            ) : (
                              'N/A'
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className={styles.pagination}>
                <button 
                  disabled={page === 0} 
                  onClick={() => setPage(page - 1)}
                  className={styles.paginationBtn}
                >
                  Previous
                </button>
                <span className={styles.pageInfo}>
                  Page {page + 1} of {totalPages}
                </span>
                <button 
                  disabled={page >= totalPages - 1} 
                  onClick={() => setPage(page + 1)}
                  className={styles.paginationBtn}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
