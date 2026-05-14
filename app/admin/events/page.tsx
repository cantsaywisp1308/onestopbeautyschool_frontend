'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchEvents, createEvent, updateEvent, deleteEvent, uploadMedia } from '../../../utils/adminApi';
import AdminSidebar from '../../../components/AdminSidebar';
import styles from '../../dashboard.module.css';
import pageStyles from './events.module.css';

interface Event {
  id: number;
  title: string;
  description: string;
  eventDate: string;
  location: string;
  imageUrls: string[];
}

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    location: '',
    imageUrls: [] as string[]
  });

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const data = await fetchEvents();
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openModal(event: Event | null = null) {
    setEditingEvent(event);
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        eventDate: event.eventDate ? event.eventDate.substring(0, 16) : '',
        location: event.location || '',
        imageUrls: event.imageUrls || []
      });
    } else {
      setFormData({
        title: '',
        description: '',
        eventDate: '',
        location: '',
        imageUrls: []
      });
    }
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, formData);
      } else {
        await createEvent(formData);
      }
      setIsModalOpen(false);
      loadEvents();
    } catch (err) {
      alert("Failed to save event");
    }
  }

  async function handleDelete(id: number) {
    if (confirm("Delete this event?")) {
      try {
        await deleteEvent(id);
        loadEvents();
      } catch (err) {
        alert("Failed to delete event");
      }
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { url } = await uploadMedia(file, 'events');
      setFormData({ ...formData, imageUrls: [...formData.imageUrls, url] });
    } catch (err) {
      alert("Upload failed: " + err);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index)
    });
  };

  return (
    <div className={styles.container}>
      <AdminSidebar />
      
      <main className={styles.main}>
        <div className={pageStyles.topBar}>
          <div>
            <h1 className={styles.title}>Manage Events</h1>
            <p className={styles.subtitle}>Promote workshops, seminars, and school activities.</p>
          </div>
          <button className={pageStyles.addBtn} onClick={() => openModal()}>
            + New Event
          </button>
        </div>

        {loading ? <p>Loading events...</p> : (
          <div className={pageStyles.eventGrid}>
            {events.map(event => (
              <div key={event.id} className={pageStyles.eventCard}>
                <div className={pageStyles.eventImage}>
                  {event.imageUrls && event.imageUrls.length > 0 ? (
                    <img src={event.imageUrls[0]} alt={event.title} />
                  ) : (
                    <div className={pageStyles.placeholder}>📅</div>
                  )}
                </div>
                <div className={pageStyles.eventInfo}>
                  <h3>{event.title}</h3>
                  <p className={pageStyles.date}>{new Date(event.eventDate).toLocaleString()}</p>
                  <p className={pageStyles.location}>📍 {event.location}</p>
                  <div className={pageStyles.cardActions}>
                    <button onClick={() => openModal(event)} className={pageStyles.editBtn}>Edit</button>
                    <button onClick={() => handleDelete(event.id)} className={pageStyles.deleteBtn}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
            {events.length === 0 && <p>No events scheduled.</p>}
          </div>
        )}
      </main>

      {isModalOpen && (
        <div className={pageStyles.modalOverlay}>
          <div className={pageStyles.modal}>
            <h2>{editingEvent ? 'Edit Event' : 'Create New Event'}</h2>
            <form onSubmit={handleSubmit}>
              <div className={pageStyles.inputGroup}>
                <label>Event Title</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  required 
                />
              </div>
              
              <div className={pageStyles.row}>
                <div className={pageStyles.inputGroup}>
                  <label>Date & Time</label>
                  <input 
                    type="datetime-local" 
                    value={formData.eventDate} 
                    onChange={e => setFormData({...formData, eventDate: e.target.value})} 
                    required 
                  />
                </div>
                <div className={pageStyles.inputGroup}>
                  <label>Location</label>
                  <input 
                    type="text" 
                    value={formData.location} 
                    onChange={e => setFormData({...formData, location: e.target.value})} 
                    placeholder="On-campus or Zoom link"
                  />
                </div>
              </div>

              <div className={pageStyles.inputGroup}>
                <label>Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  rows={4}
                />
              </div>

              <div className={pageStyles.inputGroup}>
                <label>Event Images</label>
                <div className={pageStyles.imageUploadArea}>
                  <div className={pageStyles.imageList}>
                    {formData.imageUrls.map((url, i) => (
                      <div key={i} className={pageStyles.imageItem}>
                        <img src={url} alt="Event" />
                        <button type="button" onClick={() => removeImage(i)} className={pageStyles.removeImgBtn}>×</button>
                      </div>
                    ))}
                    <label className={pageStyles.addImgBtn}>
                      {isUploading ? '...' : '+'}
                      <input type="file" hidden onChange={handleImageUpload} disabled={isUploading} accept="image/*" />
                    </label>
                  </div>
                </div>
              </div>

              <div className={pageStyles.modalActions}>
                <button type="button" className={pageStyles.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className={pageStyles.submitBtn}>
                  {editingEvent ? 'Update Event' : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
