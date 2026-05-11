const fs = require('fs');
const path = require('path');

const files = {
  'src/app/admin/scan/page.tsx': `"use client";
import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { CheckCircle, XCircle } from 'lucide-react';

export default function ScanPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [attendee, setAttendee] = useState<any>(null);

  useEffect(() => {
    let scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(onScanSuccess, onScanFailure);

    function onScanSuccess(decodedText: string) {
      if (status === 'loading') return;
      setScanResult(decodedText);
      scanner.pause(true);
      handleScan(decodedText, scanner);
    }

    function onScanFailure(error: any) {
      // ignore
    }

    return () => {
      scanner.clear().catch(console.error);
    };
  }, []);

  const handleScan = async (qrCode: string, scanner: any) => {
    setStatus('loading');
    try {
      const res = await fetch('/api/admin/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Scan failed');
      
      setStatus(data.success ? 'success' : 'error');
      setMessage(data.message || (data.success ? 'Scan successful!' : 'Already scanned.'));
      setAttendee(data.attendee);
      
      setTimeout(() => {
        setStatus('idle');
        setScanResult(null);
        setAttendee(null);
        scanner.resume();
      }, 4000);
      
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message);
      
      setTimeout(() => {
        setStatus('idle');
        setScanResult(null);
        setAttendee(null);
        scanner.resume();
      }, 4000);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Scan QR Ticket</h2>
      
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '1.5rem' }}>
          <div id="qr-reader" style={{ width: '100%' }}></div>
        </div>

        {status !== 'idle' && (
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {status === 'loading' && <div className="loader"></div>}
            
            {status === 'success' && (
              <>
                <CheckCircle size={64} color="var(--success)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ color: 'var(--success)' }}>Access Granted</h3>
                <p style={{ marginTop: '0.5rem', fontWeight: 600 }}>{attendee?.name}</p>
                <p style={{ color: 'var(--text-muted)' }}>{attendee?.email}</p>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle size={64} color="var(--danger)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ color: 'var(--danger)' }}>{message}</h3>
                {attendee && (
                  <p style={{ marginTop: '0.5rem', fontWeight: 600 }}>{attendee.name}</p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
`,
  'src/app/admin/subadmins/page.tsx': `"use client";
import { useState, useEffect } from 'react';
import { Trash2, UserPlus, Mail, Lock, User } from 'lucide-react';

export default function SubAdminsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAdmins = async () => {
    const res = await fetch('/api/admin/subadmins');
    const data = await res.json();
    if (data.admins) setAdmins(data.admins);
  };

  useEffect(() => {
    fetchAdmins();
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
      
      setForm({ name: '', email: '', password: '' });
      fetchAdmins();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this admin?')) return;
    try {
      await fetch(\`/api/admin/subadmins?id=\${id}\`, { method: 'DELETE' });
      fetchAdmins();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Manage Sub-Admins</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2rem', height: 'fit-content' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserPlus size={20} /> Add New Sub-Admin
          </h3>
          <form onSubmit={handleAdd}>
            <div className="input-group">
              <label>Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-muted)' }} />
                <input required type="text" className="input" style={{ paddingLeft: '2.5rem' }} value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
            </div>
            <div className="input-group">
              <label>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-muted)' }} />
                <input required type="email" className="input" style={{ paddingLeft: '2.5rem' }} value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
            </div>
            <div className="input-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-muted)' }} />
                <input required type="password" className="input" style={{ paddingLeft: '2.5rem' }} value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
              </div>
            </div>
            {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
            <button type="submit" className="btn btn-accent" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Adding...' : 'Create Sub-Admin'}
            </button>
          </form>
        </div>

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
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td style={{ fontWeight: 500 }}>{admin.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{admin.email}</td>
                  <td>
                    <span className={\`badge \${admin.role === 'ADMIN' ? 'badge-success' : 'badge-pending'}\`}>
                      {admin.role}
                    </span>
                  </td>
                  <td>
                    {admin.role !== 'ADMIN' && (
                      <button onClick={() => handleDelete(admin.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Trash2 size={16} /> Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
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
`
};

for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}
console.log('Scaffold 4 complete.');
