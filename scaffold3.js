const fs = require('fs');
const path = require('path');

const files = {
  'src/app/layout.tsx': `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vortex Event",
  description: "Register for the premium tech event",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`,
  'src/app/page.tsx': `"use client";
import { useState } from 'react';
import { User, Mail, Phone, CheckCircle } from 'lucide-react';

export default function Home() {
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register');
      
      setStatus('success');
      setMessage('Registration successful! Please check your email for the ticket and QR code.');
      setForm({ name: '', email: '', phone: '' });
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message);
    }
  };

  return (
    <main className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="hero-title">Nexus Event</h1>
          <p style={{ color: 'var(--text-muted)' }}>Join us for the tech event of the year.</p>
        </div>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <CheckCircle size={64} color="var(--success)" style={{ marginBottom: '1rem' }} />
            <h3>You are on the list!</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>{message}</p>
            <button className="btn" style={{ marginTop: '2rem' }} onClick={() => setStatus('idle')}>Register Another</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-muted)' }} />
                <input required type="text" className="input" style={{ paddingLeft: '2.5rem' }} placeholder="John Doe" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
            </div>
            <div className="input-group">
              <label>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-muted)' }} />
                <input required type="email" className="input" style={{ paddingLeft: '2.5rem' }} placeholder="john@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
            </div>
            <div className="input-group">
              <label>Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-muted)' }} />
                <input required type="tel" className="input" style={{ paddingLeft: '2.5rem' }} placeholder="+1 234 567 890" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
            </div>
            
            {status === 'error' && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{message}</div>}
            
            <button type="submit" className="btn" style={{ width: '100%' }} disabled={status === 'loading'}>
              {status === 'loading' ? <div className="loader"></div> : 'Claim Your Ticket'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
`,
  'src/app/admin/layout.tsx': `"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Scan, Users, LogOut } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/admin/login') return <>{children}</>;

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <div className="container">
      <nav className="nav">
        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>NEXUS ADMIN</div>
        <div className="nav-links">
          <Link href="/admin/dashboard" className={\`nav-link \${pathname === '/admin/dashboard' ? 'active' : ''}\`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link href="/admin/scan" className={\`nav-link \${pathname === '/admin/scan' ? 'active' : ''}\`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Scan size={18} /> Scan QR
          </Link>
          <Link href="/admin/subadmins" className={\`nav-link \${pathname === '/admin/subadmins' ? 'active' : ''}\`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} /> Sub-Admins
          </Link>
          <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </nav>
      {children}
    </div>
  );
}
`,
  'src/app/admin/login/page.tsx': `"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail } from 'lucide-react';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to login');
      router.push('/admin/dashboard');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Admin Portal</h2>
        <form onSubmit={handleLogin}>
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
          {status === 'error' && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{errorMsg}</div>}
          <button type="submit" className="btn" style={{ width: '100%' }} disabled={status === 'loading'}>
            {status === 'loading' ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
`,
  'src/app/admin/dashboard/page.tsx': `"use client";
import { useEffect, useState } from 'react';
import { Users, CheckCircle, Clock } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

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
            </tr>
          </thead>
          <tbody>
            {data.attendees.map((attendee: any) => (
              <tr key={attendee.id}>
                <td style={{ fontWeight: 500 }}>{attendee.name}</td>
                <td style={{ color: 'var(--text-muted)' }}>{attendee.email}</td>
                <td>
                  <span className={\`badge \${attendee.attended ? 'badge-success' : 'badge-pending'}\`}>
                    {attendee.attended ? 'Attended' : 'Pending'}
                  </span>
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  {attendee.scannedAt ? new Date(attendee.scannedAt).toLocaleTimeString() : '-'}
                </td>
              </tr>
            ))}
            {data.attendees.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No attendees yet.</td>
              </tr>
            )}
          </tbody>
        </table>
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
console.log('Scaffold 3 complete.');
