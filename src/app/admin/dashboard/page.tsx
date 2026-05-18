'use client';

import { useEffect, useState } from 'react';
import { Users, CheckCircle, Clock, Trash2, Calendar, UserCheck, Mail, Send, Activity as ActivityIcon } from 'lucide-react';
import ActivityLog from '@/components/ActivityLog';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', phone: '' });
  const [inviting, setInviting] = useState(false);

  const loadData = () => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this registration?')) return;
    try {
      const res = await fetch(`/api/admin/attendees?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete');
      }
    } catch (err: any) {
      alert('Error deleting registration: ' + err.message);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    try {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteForm)
      });
      if (res.ok) {
        alert('Invitation sent successfully!');
        setInviteForm({ name: '', email: '', phone: '' });
        loadData();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to send invitation');
      }
    } catch (err) {
      alert('Network error sending invitation');
    } finally {
      setInviting(false);
    }
  };

  if (!data) return <div style={{ textAlign: 'center', padding: '10rem 0' }}><div className="loader" style={{ margin: '0 auto' }}></div></div>;

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            MedWeb <span style={{ color: 'var(--primary)' }}>Dashboard</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Real-time overview of your medical event registrations.</p>
        </div>
        <button onClick={loadData} className="btn" style={{ padding: '0.6rem 1.2rem' }}>Refresh Data</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
        {/* Main Content Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="card-grid">
            <div className="glass-panel stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
              <Users size={32} color="var(--primary)" style={{ marginBottom: '1.25rem', opacity: 0.8 }} />
              <div className="stat-value">{data.totalRegistered || 0}</div>
              <div style={{ color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Total Registered</div>
            </div>
            <div className="glass-panel stat-card" style={{ borderLeft: '4px solid var(--success)' }}>
              <UserCheck size={32} color="var(--success)" style={{ marginBottom: '1.25rem', opacity: 0.8 }} />
              <div className="stat-value">{data.totalAttended || 0}</div>
              <div style={{ color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Checked In</div>
            </div>
            <div className="glass-panel stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
              <Clock size={32} color="#f59e0b" style={{ marginBottom: '1rem', opacity: 0.8 }} />
              <div className="stat-value">{data.notAttended || 0}</div>
              <div style={{ color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Pending Arrival</div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Calendar size={24} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Recent Registrations</h3>
            </div>
            
            <div className="glass-panel" style={{ overflow: 'hidden', borderRadius: '20px' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ margin: 0 }}>
                  <thead style={{ background: 'rgba(13, 148, 136, 0.05)' }}>
                    <tr>
                      <th style={{ padding: '1.5rem' }}>Attendee Name</th>
                      <th style={{ padding: '1.5rem' }}>Contact Info</th>
                      <th style={{ padding: '1.5rem' }}>Clinical Status</th>
                      <th style={{ padding: '1.5rem' }}>Check-in Time</th>
                      <th style={{ padding: '1.5rem', textAlign: 'right' }}>Management</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.attendees && data.attendees.length > 0 ? (
                      data.attendees.map((attendee: any) => (
                        <tr key={attendee.id} style={{ transition: 'background 0.2s' }}>
                          <td style={{ padding: '1.25rem 1.5rem' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1.05rem' }}>{attendee.name}</div>
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{attendee.email}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', opacity: 0.7 }}>{attendee.phone || 'No phone'}</div>
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem' }}>
                            <span className={`badge ${attendee.attended ? 'badge-success' : 'badge-pending'}`}>
                              {attendee.attended ? 'COMPLETED' : 'AWAITING'}
                            </span>
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
                            {attendee.scannedAt ? new Date(attendee.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                            <button 
                              onClick={() => handleDelete(attendee.id)} 
                              className="btn-danger"
                              style={{ 
                                padding: '0.5rem 1rem', 
                                fontSize: '0.8rem',
                                background: 'transparent',
                                border: '1px solid var(--danger)',
                                color: 'var(--danger)',
                                borderRadius: '8px'
                              }}
                            >
                              <Trash2 size={14} style={{ marginRight: '4px' }} /> Remove
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                          No registrations found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Invite Form */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <Mail size={20} style={{ color: 'var(--primary)' }} />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Quick Invitation</h2>
            </div>
            
            <form onSubmit={handleInvite}>
              <div className="input-group">
                <label>Attendee Name</label>
                <input 
                  type="text" 
                  className="input" 
                  required 
                  placeholder="Full Name"
                  value={inviteForm.name}
                  onChange={e => setInviteForm({...inviteForm, name: e.target.value})}
                />
              </div>
              <div className="input-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  className="input" 
                  required 
                  placeholder="name@hospital.com"
                  value={inviteForm.email}
                  onChange={e => setInviteForm({...inviteForm, email: e.target.value})}
                />
              </div>
              <div className="input-group">
                <label>Phone (Optional)</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="+1 (555) 000-0000"
                  value={inviteForm.phone}
                  onChange={e => setInviteForm({...inviteForm, phone: e.target.value})}
                />
              </div>
              <button disabled={inviting} className="btn" style={{ width: '100%', marginTop: '0.5rem' }}>
                {inviting ? <div className="loader" /> : <><Send size={16} /> Send Invite</>}
              </button>
            </form>
          </div>

          {/* Activity Log */}
          <div style={{ height: '500px' }}>
            <ActivityLog />
          </div>

        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        tr:hover {
          background: rgba(13, 148, 136, 0.02) !important;
        }
      `}</style>
    </div>
  );
}
