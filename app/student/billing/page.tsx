'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchMyBillingHistory } from '../../../utils/studentApi';
import styles from './billing.module.css';

interface PaymentRecord {
  id: number;
  course: {
    title: string;
  };
  pricingOptionName: string;
  pricePaid: number;
  paymentDate: string;
  expiryDate: string | null;
  stripeSessionId: string;
}

export default function StudentBillingPage() {
  const [history, setHistory] = useState<PaymentRecord[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBillingHistory(page);
  }, [page]);

  async function loadBillingHistory(pageNum: number) {
    try {
      setLoading(true);
      const data = await fetchMyBillingHistory(pageNum, 10);
      setHistory(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function checkStatus(expiryDateStr: string | null) {
    if (!expiryDateStr) return 'Active (Lifetime)';
    const expiry = new Date(expiryDateStr);
    const now = new Date();
    return expiry > now ? 'Active' : 'Expired';
  }

  return (
    <div className={styles.container}>
      <div className={styles.backgroundGlow}></div>

      <div className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1 className={styles.title}>Billing & Receipts</h1>
          <Link href="/student" className={styles.backLink}>
            &larr; Back to Dashboard
          </Link>
        </div>
        <p className={styles.subtitle}>View your purchase receipts, duration passes, and expiration dates.</p>

        {loading ? (
          <div className={styles.empty}>Loading payment history...</div>
        ) : (
          <>
            {history.length === 0 ? (
              <p className={styles.empty}>You do not have any past payments recorded on this profile.</p>
            ) : (
              <>
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Program</th>
                        <th>Access Pass Type</th>
                        <th>Price Paid</th>
                        <th>Expiration Date</th>
                        <th>Status</th>
                        <th>Transaction ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map(record => {
                        const status = checkStatus(record.expiryDate);
                        return (
                          <tr key={record.id}>
                            <td>{formatDate(record.paymentDate)}</td>
                            <td style={{ fontWeight: '600' }}>{record.course.title}</td>
                            <td>{record.pricingOptionName}</td>
                            <td className={styles.price}>${record.pricePaid.toFixed(2)}</td>
                            <td>{record.expiryDate ? formatDate(record.expiryDate) : 'Lifetime'}</td>
                            <td>
                              <span className={`${styles.badge} ${status === 'Expired' ? styles.badgeExpired : styles.badgeActive}`}>
                                {status}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                              {record.stripeSessionId ? record.stripeSessionId.substring(0, 15) + '...' : 'N/A'}
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
    </div>
  );
}
