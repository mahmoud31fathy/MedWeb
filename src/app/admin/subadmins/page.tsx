"use client";
import { useState, useEffect } from 'react';
import { Trash2, UserPlus, Mail, Lock, User } from 'lucide-react';

export default function SubAdminsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [form, setForm] = useState({ name: '', email: '', password: 'admin123' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    // Fetch stats to get current user info
    const statsRes = await fetch('/api/admin/stats');
    const statsData = await statsRes.json();
    setCurrentUser(statsData);

    // Fetch admins list
    const res = await fetch('/api/admin/subadmins');
    const data = await res.json();
    if (data.admins) setAdmins(data.admins);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/subadmins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setForm({ name: '', email: '', password: 'admin123' });
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this admin?')) return;
    try {
      await fetch(`/api/admin/subadmins?id=${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const isSuperAdmin = currentUser?.role === 'Super admin';

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Manage Admins</h2>

      <div style={{ display: 'grid', gridTemplateColumns: isSuperAdmin ? '1fr 2fr' : '1fr', gap: '2rem' }}>
        {isSuperAdmin && (
          <div className="glass-panel" style={{ padding: '2rem', height: 'fit-content' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserPlus size={20} /> Add New Admin
            </h3>
            <form onSubmit={handleAdd}>
              <div className="input-group">
                <label>Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-muted)' }} />
                  <input required type="text" className="input" style={{ paddingLeft: '2.5rem' }} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
              </div>
              <div className="input-group">
                <label>Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-muted)' }} />
                  <input required type="email" className="input" style={{ paddingLeft: '2.5rem' }} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div className="input-group">
                <label>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-muted)' }} />
                  <input required type="password" className="input" style={{ paddingLeft: '2.5rem' }} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                </div>
              </div>
              {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
              <button type="submit" className="btn btn-accent" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Adding...' : 'Create Admin'}
              </button>
            </form>
          </div>
        )}

        <div className="glass-panel" style={{ overflowX: 'auto', padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Admin List</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => {
                const isUserRow = currentUser?.email === admin.email;
                const isSuper = admin.role === 'Super admin';
                
                return (
                  <tr key={admin.id} style={{ 
                    background: isSuper ? 'rgba(13, 148, 136, 0.05)' : 'transparent',
                    borderLeft: isSuper ? '4px solid var(--primary)' : 'none'
                  }}>
                    <td style={{ fontWeight: 700, color: isSuper ? 'var(--primary)' : 'var(--text-main)' }}>
                      {admin.name}
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {admin.email}
                      {isUserRow && (
                        <span style={{ 
                          marginLeft: '0.75rem', 
                          fontSize: '0.7rem', 
                          fontWeight: 800, 
                          color: 'var(--primary)',
                          background: 'rgba(13, 148, 136, 0.1)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          verticalAlign: 'middle'
                        }}>
                          YOU
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${isSuper ? 'badge-success' : 'badge-pending'}`}>
                        {admin.role}
                      </span>
                    </td>
                    <td>
                      {isSuperAdmin && !isSuper && (
                        <button onClick={() => handleDelete(admin.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Trash2 size={16} /> Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {admins.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No admins found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
