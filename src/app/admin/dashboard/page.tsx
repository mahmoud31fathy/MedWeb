"use client";
import { useEffect, useState } from 'react';
import { Users, CheckCircle, Clock, Trash2 } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);

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

  if (!data) return <div style={{ textAlign: 'center', padding: '3rem' }}><div className="loader" style={{ margin: '0 auto' }}></div></div>;

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Event Dashboard</h2>

      <div className="card-grid" style={{ marginBottom: '3rem' }}>
        <div className="glass-panel stat-card">
          <Users size={32} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <div className="stat-value">{data.totalRegistered}</div>
          <div style={{ color: 'var(--text-muted)' }}>Total Registered</div>
        </div>
        <div className="glass-panel stat-card">
          <CheckCircle size={32} color="var(--success)" style={{ marginBottom: '1rem' }} />
          <div className="stat-value">{data.totalAttended}</div>
          <div style={{ color: 'var(--text-muted)' }}>Checked In</div>
        </div>
        <div className="glass-panel stat-card">
          <Clock size={32} color="#f59e0b" style={{ marginBottom: '1rem' }} />
          <div className="stat-value">{data.notAttended}</div>
          <div style={{ color: 'var(--text-muted)' }}>Pending Arrival</div>
        </div>
      </div>

      <h3 style={{ marginBottom: '1rem' }}>Recent Registrations</h3>
      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Scan Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.attendees.map((attendee: any) => (
              <tr key={attendee.id}>
                <td style={{ fontWeight: 500 }}>{attendee.name}</td>
                <td style={{ color: 'var(--text-muted)' }}>{attendee.email}</td>
                <td>
                  <span className={`badge ${attendee.attended ? 'badge-success' : 'badge-pending'}`}>
                    {attendee.attended ? 'Attended' : 'Pending'}
                  </span>
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  {attendee.scannedAt ? new Date(attendee.scannedAt).toLocaleTimeString() : '-'}
                </td>
                <td>
                  <button onClick={() => handleDelete(attendee.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Trash2 size={16} /> Delete
                  </button>
                </td>
              </tr>
            ))}
            {data.attendees.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No attendees yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
