'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Image as ImageIcon, Upload, X, Calendar as CalendarIcon, Clock, Bell } from 'lucide-react';


interface Talk {
  id: string;
  title: string;
  speaker: string;
  location: string;
  startTime: string;
  imageUrl?: string;
  notified: boolean;
}

export default function TalksPage() {
  const router = useRouter();
  const [talks, setTalks] = useState<Talk[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [location, setLocation] = useState('');
  const [startTime, setStartTime] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [adding, setAdding] = useState(false);
  const [notifyingId, setNotifyingId] = useState<string | null>(null);
  const [error, setError] = useState('');


  const [dragCounter, setDragCounter] = useState(0);

  const processFile = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setDragCounter(prev => prev + 1);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragCounter(prev => Math.max(0, prev - 1));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragCounter(0);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  };

  useEffect(() => {
    fetchTalks();
  }, []);

  const fetchTalks = async () => {
    try {
      const res = await fetch('/api/admin/talks');
      if (res.ok) {
        const data = await res.json();
        setTalks(data);
      }
    } catch (err) {
      console.error('Failed to fetch talks', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTalk = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setError('');

    try {
      const res = await fetch('/api/admin/talks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, speaker, location, startTime, imageUrl }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add talk');
      }

      // Reset form
      setTitle('');
      setSpeaker('');
      setLocation('');
      setStartTime('');
      setImageUrl('');

      // Refresh list
      fetchTalks();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this talk?')) return;

    try {
      const res = await fetch(`/api/admin/talks/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setTalks(talks.filter(t => t.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };

  const handleNotify = async (id: string) => {
    if (!confirm('Send manual email reminders to ALL attendees for this talk?')) return;

    setNotifyingId(id);
    try {
      const res = await fetch(`/api/admin/talks/${id}/notify`, {
        method: 'POST',
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || 'Notifications sent successfully!');
        fetchTalks(); // Refresh to update "Notified?" status
      } else {
        alert('Error: ' + (data.error || 'Failed to send notifications'));
      }
    } catch (err) {
      console.error('Failed to notify', err);
      alert('Failed to send notifications');
    } finally {
      setNotifyingId(null);
    }
  };


  if (loading) {
    return <div className="container"><div className="loader" style={{ margin: '2rem auto' }}></div></div>;
  }

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{ position: 'relative', minHeight: '100vh', paddingBottom: '2rem' }}
    >
      {dragCounter > 0 && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '4px dashed var(--primary)',
          margin: '1.5rem',
          borderRadius: '1.5rem',
          pointerEvents: 'none',
          transition: 'all 0.2s ease-in-out'
        }}>
          <Upload size={80} style={{ color: 'var(--primary)', marginBottom: '1.5rem' }} />
          <h2 style={{ color: 'white', fontSize: '2.5rem', fontWeight: 'bold', textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>Drop Poster Here</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', marginTop: '0.5rem' }}>Release to automatically upload this image</p>
        </div>
      )}

      <h1 className="hero-title" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Manage Event Schedule</h1>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-main)', fontSize: '1.5rem' }}>Add New Talk</h2>

        {error && <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>{error}</div>}

        <form onSubmit={handleAddTalk}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="input-group">
              <label>Talk Title / Topic</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="input"
                placeholder="e.g. The Future of AI in Medicine"
              />
            </div>

            <div className="input-group">
              <label>Speaker Name</label>
              <input
                type="text"
                required
                value={speaker}
                onChange={e => setSpeaker(e.target.value)}
                className="input"
                placeholder="e.g. Dr. Sarah Johnson"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="input-group">
              <label>Location / Hall</label>
              <input
                type="text"
                required
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="input"
                placeholder="e.g. Main Hall A"
              />
            </div>

            <div className="input-group">
              <label>Start Time</label>

              {/* Custom Date/Time Picker */}
              <div style={{ position: 'relative' }}>
                <div
                  onClick={() => {
                    // Toggle a custom picker state
                    const picker = document.getElementById('custom-picker-dropdown');
                    if (picker) {
                      picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
                    }
                  }}
                  className="input"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', userSelect: 'none' }}
                >
                  <CalendarIcon size={18} style={{ color: 'var(--primary)' }} />
                  {startTime ? (
                    <span style={{ color: 'white', fontWeight: 500, letterSpacing: '0.5px' }}>
                      {new Date(startTime).toLocaleString('en-US', {
                        weekday: 'long', month: 'long', day: 'numeric',
                        hour: 'numeric', minute: '2-digit', hour12: true
                      })}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>Select an extraordinary time...</span>
                  )}
                </div>

                {/* Unique Dropdown UI */}
                <div
                  id="custom-picker-dropdown"
                  className="glass-panel"
                  style={{
                    display: 'none', position: 'absolute', top: '100%', left: 0, right: 0,
                    marginTop: '0.5rem', padding: '1.5rem', zIndex: 50,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                    border: '1px solid rgba(59, 130, 246, 0.3)'
                  }}
                >
                  {/* DATES - Horizontal Scrolling Cards */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                      <CalendarIcon size={14} /> Select Date
                    </div>
                    <div style={{
                      display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem',
                      scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch'
                    }}>
                      {Array.from({ length: 90 }).map((_, i) => {
                        const d = new Date();
                        d.setDate(d.getDate() + i);
                        const isSelected = startTime && new Date(startTime).toDateString() === d.toDateString();

                        return (
                          <div
                            key={i}
                            onClick={() => {
                              const curr = startTime ? new Date(startTime) : new Date();
                              curr.setFullYear(d.getFullYear(), d.getMonth(), d.getDate());
                              if (!startTime) {
                                curr.setHours(12, 0, 0, 0); // Default to 12 PM
                              }
                              const pad = (n: number) => n.toString().padStart(2, '0');
                              setStartTime(`${curr.getFullYear()}-${pad(curr.getMonth() + 1)}-${pad(curr.getDate())}T${pad(curr.getHours())}:${pad(curr.getMinutes())}`);
                            }}
                            style={{
                              flex: '0 0 auto', width: '70px', height: '90px',
                              borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s',
                              background: isSelected ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'rgba(15, 23, 42, 0.6)',
                              border: isSelected ? 'none' : '1px solid var(--border-color)',
                              boxShadow: isSelected ? '0 4px 15px rgba(59, 130, 246, 0.4)' : 'none',
                              color: isSelected ? 'white' : 'var(--text-muted)'
                            }}
                          >
                            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, opacity: isSelected ? 0.9 : 0.6 }}>
                              {d.toLocaleDateString('en-US', { weekday: 'short' })}
                            </span>
                            <span style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.25rem 0', color: isSelected ? 'white' : 'var(--text-main)' }}>
                              {d.getDate()}
                            </span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 500, opacity: isSelected ? 0.9 : 0.6 }}>
                              {d.toLocaleDateString('en-US', { month: 'short' })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* TIMES - Minimalist Grid */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                      <Clock size={14} /> Select Time
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'stretch' }}>
                      {/* AM/PM Toggle */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {['AM', 'PM'].map(meridiem => {
                          const curr = startTime ? new Date(startTime) : new Date();
                          const isPM = curr.getHours() >= 12;
                          const isSelected = (meridiem === 'PM' && isPM) || (meridiem === 'AM' && !isPM);

                          return (
                            <div
                              key={meridiem}
                              onClick={() => {
                                if (!startTime) return;
                                const d = new Date(startTime);
                                const h = d.getHours();
                                if (meridiem === 'PM' && h < 12) d.setHours(h + 12);
                                if (meridiem === 'AM' && h >= 12) d.setHours(h - 12);
                                const pad = (n: number) => n.toString().padStart(2, '0');
                                setStartTime(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
                              }}
                              style={{
                                flex: 1, padding: '0 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: startTime ? 'pointer' : 'not-allowed', transition: 'all 0.2s', fontWeight: 700,
                                background: isSelected ? 'var(--primary)' : 'rgba(15, 23, 42, 0.6)',
                                color: isSelected ? 'white' : 'var(--text-muted)',
                                border: isSelected ? 'none' : '1px solid var(--border-color)',
                                opacity: startTime ? 1 : 0.5
                              }}
                            >
                              {meridiem}
                            </div>
                          );
                        })}
                      </div>

                      {/* Hours Grid */}
                      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem' }}>
                        {Array.from({ length: 12 }).map((_, i) => {
                          const h = i === 0 ? 12 : i;
                          const curr = startTime ? new Date(startTime) : new Date();
                          const currHour12 = curr.getHours() % 12 || 12;
                          const isSelected = startTime && currHour12 === h;

                          return (
                            <div
                              key={h}
                              onClick={() => {
                                if (!startTime) return;
                                const d = new Date(startTime);
                                const isPM = d.getHours() >= 12;
                                d.setHours(isPM ? (h === 12 ? 12 : h + 12) : (h === 12 ? 0 : h));
                                const pad = (n: number) => n.toString().padStart(2, '0');
                                setStartTime(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
                              }}
                              style={{
                                padding: '0.5rem 0', borderRadius: '8px', textAlign: 'center', cursor: startTime ? 'pointer' : 'not-allowed', transition: 'all 0.2s', fontWeight: 600, fontSize: '0.875rem',
                                background: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                                color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                                border: isSelected ? '1px solid var(--primary)' : '1px solid transparent',
                                opacity: startTime ? 1 : 0.5
                              }}
                              onMouseOver={(e) => { if (startTime && !isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                              onMouseOut={(e) => { if (startTime && !isSelected) e.currentTarget.style.background = 'transparent' }}
                            >
                              {h}
                            </div>
                          );
                        })}
                      </div>

                      <div style={{ width: '1px', background: 'var(--border-color)' }}></div>

                      {/* Minutes Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                        {['00', '15', '30', '45'].map(m => {
                          const curr = startTime ? new Date(startTime) : new Date();
                          const isSelected = startTime && curr.getMinutes() === parseInt(m);

                          return (
                            <div
                              key={m}
                              onClick={() => {
                                if (!startTime) return;
                                const d = new Date(startTime);
                                d.setMinutes(parseInt(m));
                                const pad = (n: number) => n.toString().padStart(2, '0');
                                setStartTime(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
                              }}
                              style={{
                                padding: '0.5rem 1rem', borderRadius: '8px', textAlign: 'center', cursor: startTime ? 'pointer' : 'not-allowed', transition: 'all 0.2s', fontWeight: 600, fontSize: '0.875rem',
                                background: isSelected ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                                color: isSelected ? 'var(--accent)' : 'var(--text-main)',
                                border: isSelected ? '1px solid var(--accent)' : '1px solid transparent',
                                opacity: startTime ? 1 : 0.5
                              }}
                              onMouseOver={(e) => { if (startTime && !isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                              onMouseOut={(e) => { if (startTime && !isSelected) e.currentTarget.style.background = 'transparent' }}
                            >
                              :{m}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        const picker = document.getElementById('custom-picker-dropdown');
                        if (picker) picker.style.display = 'none';
                      }}
                      className="btn"
                      style={{ padding: '0.5rem 1.5rem', fontSize: '0.875rem' }}
                    >
                      Confirm Time
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <label>Poster / Flyer Image (Optional)</label>

            {imageUrl ? (
              <div style={{ position: 'relative', display: 'inline-block', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', background: 'rgba(0,0,0,0.2)' }}>
                <img src={imageUrl} alt="Poster preview" style={{ maxWidth: '100%', maxHeight: '200px', display: 'block', objectFit: 'contain' }} />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.5)', transition: 'transform 0.1s' }}
                  title="Remove image"
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }}
                  />
                  <div className="input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderStyle: 'dashed', borderColor: 'var(--primary)', cursor: 'pointer', background: 'rgba(59, 130, 246, 0.05)', color: 'var(--primary)', fontWeight: 500 }}>
                    <Upload size={18} /> Choose File from Device
                  </div>
                </div>
                <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>OR</span>
                <input
                  type="url"
                  value={imageUrl.startsWith('http') ? imageUrl : ''}
                  onChange={e => setImageUrl(e.target.value)}
                  className="input"
                  placeholder="Paste an image URL..."
                  style={{ flex: 1 }}
                />
              </div>
            )}
            <small style={{ color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block' }}>This image will be sent with the email reminder to attendees. Max size 2MB.</small>
          </div>

          <button
            type="submit"
            disabled={adding}
            className="btn"
            style={{ marginTop: '1rem' }}
          >
            {adding ? <span className="loader" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span> : <Plus size={18} />}
            {adding ? 'Adding...' : 'Add Talk'}
          </button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-main)', fontSize: '1.5rem' }}>Upcoming Talks</h2>

        {talks.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No talks scheduled yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Speaker</th>
                  <th>Location</th>
                  <th>Time</th>
                  <th>Poster</th>
                  <th>Notified?</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {talks.map(talk => (
                  <tr key={talk.id}>
                    <td style={{ fontWeight: 500, color: 'white' }}>{talk.title}</td>
                    <td>{talk.speaker}</td>
                    <td>{talk.location}</td>
                    <td>{new Date(talk.startTime).toLocaleString()}</td>
                    <td>
                      {talk.imageUrl ? (
                        <a href={talk.imageUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <ImageIcon size={16} /> View
                        </a>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>-</span>
                      )}
                    </td>
                    <td>
                      {talk.notified ? (
                        <span className="badge badge-success">Yes</span>
                      ) : (
                        <span className="badge badge-pending">No</span>
                      )}
                    </td>
                    <td style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleNotify(talk.id)}
                        disabled={notifyingId === talk.id}
                        className="btn"
                        style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', background: 'var(--accent)', border: 'none' }}
                        title="Send manual notification"
                      >
                        {notifyingId === talk.id ? (
                          <span className="loader" style={{ width: '14px', height: '14px', borderWidth: '2px' }}></span>
                        ) : (
                          <Bell size={16} />
                        )}
                        {notifyingId === talk.id ? 'Sending...' : 'Notify'}
                      </button>
                      <button
                        onClick={() => handleDelete(talk.id)}
                        className="btn btn-danger"
                        style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
