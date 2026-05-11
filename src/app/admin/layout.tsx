"use client";
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
          <Link href="/admin/dashboard" className={`nav-link ${pathname === '/admin/dashboard' ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link href="/admin/scan" className={`nav-link ${pathname === '/admin/scan' ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Scan size={18} /> Scan QR
          </Link>
          <Link href="/admin/subadmins" className={`nav-link ${pathname === '/admin/subadmins' ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} /> Admins
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
