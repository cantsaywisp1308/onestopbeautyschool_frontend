'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchPricingOptions, createPricingOption, updatePricingOption, deletePricingOption, fetchCourseById } from '../../../../../utils/adminApi';
import styles from './pricing.module.css';

interface PricingOption {
  id: number;
  name: string;
  price: number;
  durationDays: number;
}

export default function CoursePricingManager() {
  const params = useParams();
  const courseId = Number(params.id);

  const [course, setCourse] = useState<any>(null);
  const [options, setOptions] = useState<PricingOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<PricingOption | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    durationDays: 0
  });

  useEffect(() => {
    if (courseId) {
      loadData();
    }
  }, [courseId]);

  async function loadData() {
    try {
      const courseData = await fetchCourseById(courseId);
      setCourse(courseData);
      const optionsData = await fetchPricingOptions(courseId);
      setOptions(optionsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openModal(option: PricingOption | null = null) {
    setEditingOption(option);
    setFormData(option ? {
      name: option.name,
      price: option.price,
      durationDays: option.durationDays
    } : {
      name: '',
      price: 0,
      durationDays: 0
    });
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingOption) {
        await updatePricingOption(editingOption.id, formData);
      } else {
        await createPricingOption(courseId, formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert(err);
    }
  }

  async function handleDelete(optionId: number) {
    if (confirm("Are you sure you want to delete this pricing option? New students won't be able to purchase it.")) {
      try {
        await deletePricingOption(optionId);
        loadData();
      } catch (err) {
        alert(err);
      }
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/admin/courses" className={styles.backLink}>&larr; Course Management</Link>
          <h1 className={styles.title}>
            {course ? `${course.title} - Pricing Options` : 'Pricing Management'}
          </h1>
        </div>
        <button className={styles.addButton} onClick={() => openModal()}>
          + Add Pricing Option
        </button>
      </div>

      {loading ? (
        <div className={styles.empty}>Loading pricing tiers...</div>
      ) : (
        <div className={styles.list}>
          {options.length === 0 && (
            <p className={styles.empty}>No time-limited pricing options created yet. Add one to enable duration access!</p>
          )}
          {options.map(option => (
            <div key={option.id} className={styles.item}>
              <div className={styles.optionInfo}>
                <span className={styles.optionName}>{option.name}</span>
                <span className={styles.optionDetails}>
                  Duration: <strong style={{color: 'white'}}>{option.durationDays} days</strong> | Price: <strong className={styles.price}>${option.price.toFixed(2)}</strong>
                </span>
              </div>
              <div className={styles.actions}>
                <button onClick={() => openModal(option)} className={styles.editBtn}>Edit</button>
                <button onClick={() => handleDelete(option.id)} className={styles.deleteBtn}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>{editingOption ? 'Edit Pricing Option' : 'Add Pricing Option'}</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label>Option Name (e.g., 7-Day Access Pass)</label>
                <input 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  required 
                  placeholder="e.g. 1 Month Full Access"
                />
              </div>
              <div className={styles.field}>
                <label>Price ($)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  value={formData.price} 
                  onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} 
                  required 
                />
              </div>
              <div className={styles.field}>
                <label>Duration (in Days)</label>
                <input 
                  type="number" 
                  min="1" 
                  value={formData.durationDays} 
                  onChange={e => setFormData({ ...formData, durationDays: Number(e.target.value) })} 
                  required 
                  placeholder="e.g., 7, 30, 90"
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setIsModalOpen(false)} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn}>
                  {editingOption ? 'Save Changes' : 'Create Option'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
