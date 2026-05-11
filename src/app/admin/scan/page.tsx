"use client";
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
