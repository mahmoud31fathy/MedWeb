"use client";
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
                <input required type="text" className="input" style={{ paddingLeft: '2.5rem' }} placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
            </div>
            <div className="input-group">
              <label>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-muted)' }} />
                <input required type="email" className="input" style={{ paddingLeft: '2.5rem' }} placeholder="john@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div className="input-group">
              <label>Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-muted)' }} />
                <input required type="tel" className="input" style={{ paddingLeft: '2.5rem' }} placeholder="+1 234 567 890" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
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
