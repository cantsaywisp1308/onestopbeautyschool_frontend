'use client';

import React from 'react';
import styles from './LogoutModal.module.css';

interface UnlinkExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function UnlinkExamModal({ isOpen, onClose, onConfirm }: UnlinkExamModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconContainer}>
          <div className={styles.iconWrapper} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              <line x1="8" y1="8" x2="16" y2="16" />
            </svg>
          </div>
        </div>
        
        <h2 className={styles.title}>Unlink Exam</h2>
        <p className={styles.message}>Are you sure you want to remove this exam from this course? It will still be available in the Global Bank.</p>
        
        <div className={styles.buttonGroup}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.confirmBtn} onClick={onConfirm} style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', boxShadow: '0 10px 20px -5px rgba(239, 68, 68, 0.4)' }}>
            Unlink
          </button>
        </div>
      </div>
    </div>
  );
}
