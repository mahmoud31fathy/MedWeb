'use client';

import { useEffect, useState } from 'react';
import { History, User, Clock } from 'lucide-react';

interface Log {
  id: string;
  action: string;
  details: string;
  adminName: string;
  createdAt: string;
}

export default function ActivityLog() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/logs');
      const data = await res.json();
      if (Array.isArray(data)) setLogs(data);
    } catch (error) {
      console.error('Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <History size={20} className="text-primary" style={{ color: 'var(--primary)' }} />
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Activity Log</h2>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <div className="loader" />
        </div>
      ) : logs.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>No recent activity</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {logs.map((log) => (
            <div key={log.id} style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid var(--border-color)' }}>
              <div style={{ 
                position: 'absolute', 
                left: '-6px', 
                top: '0', 
                width: '10px', 
                height: '10px', 
                borderRadius: '50%', 
                background: 'var(--primary)',
                border: '2px solid var(--bg-main)'
              }} />
              
              <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.25rem' }}>{log.action}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{log.details}</div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <User size={12} /> {log.adminName}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={12} /> {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
