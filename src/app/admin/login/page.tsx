"use client";
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail } from 'lucide-react';

export default function AdminLogin() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    const email = formData.get('email')?.toString() || '';
    const password = formData.get('password')?.toString() || '';

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to login');

      // Force navigation to ensure fresh load
      window.location.href = '/admin/dashboard';
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Admin Portal</h2>
        <form ref={formRef} onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-muted)' }} />
              <input name="email" required type="email" className="input" style={{ paddingLeft: '2.5rem' }} />
            </div>
          </div>
          <div className="input-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-muted)' }} />
              <input name="password" required type="password" className="input" style={{ paddingLeft: '2.5rem' }} />
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
