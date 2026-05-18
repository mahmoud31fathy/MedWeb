"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Scan, Users, LogOut, CalendarDays, Stethoscope } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/admin/login') return <>{children}</>;

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const [adminName, setAdminName] = useState('Admin');
  const [adminRole, setAdminRole] = useState('');

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        if (data.name) setAdminName(data.name);
        if (data.role) setAdminRole(data.role);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="container" style={{ paddingTop: '0' }}>
      <nav className="glass-panel" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '1rem 2rem',
        marginBottom: '2.5rem',
        borderRadius: '20px',
        position: 'sticky',
        top: '1.5rem',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem', borderRadius: '10px' }}>
              <Stethoscope size={24} />
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.5px' }}>
              MEDWEB <span style={{ color: 'var(--primary)' }}>ADMIN</span>
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            padding: '0.25rem 1rem', 
            borderLeft: '1px solid var(--border-color)',
            lineHeight: '1.2'
          }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>{adminName}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{adminRole}</div>
          </div>
        </div>

        <div className="nav-links" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link href="/admin/dashboard" className={`nav-link ${pathname === '/admin/dashboard' ? 'active' : ''}`} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.6rem 1rem',
              borderRadius: '10px',
              background: pathname === '/admin/dashboard' ? 'rgba(13, 148, 136, 0.1)' : 'transparent',
              color: pathname === '/admin/dashboard' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 600
            }}>
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link href="/admin/scan" className={`nav-link ${pathname === '/admin/scan' ? 'active' : ''}`}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.6rem 1rem',
              borderRadius: '10px',
              background: pathname === '/admin/scan' ? 'rgba(13, 148, 136, 0.1)' : 'transparent',
              color: pathname === '/admin/scan' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 600
            }}>
            <Scan size={18} /> Scan QR
          </Link>
          <Link href="/admin/talks" className={`nav-link ${pathname === '/admin/talks' ? 'active' : ''}`}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.6rem 1rem',
              borderRadius: '10px',
              background: pathname === '/admin/talks' ? 'rgba(13, 148, 136, 0.1)' : 'transparent',
              color: pathname === '/admin/talks' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 600
            }}>
            <CalendarDays size={18} /> Schedule
          </Link>
          <Link href="/admin/subadmins" className={`nav-link ${pathname === '/admin/subadmins' ? 'active' : ''}`}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.6rem 1rem',
              borderRadius: '10px',
              background: pathname === '/admin/subadmins' ? 'rgba(13, 148, 136, 0.1)' : 'transparent',
              color: pathname === '/admin/subadmins' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 600
            }}>
            <Users size={18} /> Admins
          </Link>
          
          <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 0.5rem' }}></div>

          <button onClick={handleLogout} className="btn-danger" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              cursor: 'pointer',
              padding: '0.6rem 1.2rem',
              borderRadius: '10px',
              border: 'none',
              color: 'white',
              fontWeight: 600,
              background: 'var(--danger)'
            }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </nav>
      {children}
    </div>
  );
}
