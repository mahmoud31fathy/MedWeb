"use client";
import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { CheckCircle, XCircle, Camera, CameraOff, Scan, RefreshCw } from 'lucide-react';

export default function ScanPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [attendee, setAttendee] = useState<any>(null);
  const qrCodeInstanceRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    // Initialize the scanner instance once
    const html5QrCode = new Html5Qrcode("qr-reader");
    qrCodeInstanceRef.current = html5QrCode;

    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(err => console.error("Error stopping scanner on cleanup", err));
      }
    };
  }, []);

  const startScanner = async () => {
    if (!qrCodeInstanceRef.current) return;
    
    setStatus('idle');
    setAttendee(null);
    setMessage('');
    
    try {
      await qrCodeInstanceRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleScan(decodedText);
        },
        (errorMessage) => {
          // ignore common scan errors
        }
      );
      setIsScanning(true);
    } catch (err) {
      console.error("Failed to start scanner:", err);
      alert("Could not start camera. Please ensure camera access is allowed.");
    }
  };

  const stopScanner = async () => {
    if (qrCodeInstanceRef.current && qrCodeInstanceRef.current.isScanning) {
      try {
        await qrCodeInstanceRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error("Failed to stop scanner:", err);
      }
    }
  };

  const handleScan = async (qrCode: string) => {
    // Automatically stop scanner on first detection to process
    await stopScanner();
    
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
      setMessage(data.message || (data.success ? 'Scan successful!' : 'Access denied.'));
      setAttendee(data.attendee);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message);
    }
  };

  const resetAndScanAgain = () => {
    setStatus('idle');
    setAttendee(null);
    setMessage('');
    startScanner();
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '3rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 className="hero-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>QR Ticket Verification</h1>
        <p style={{ color: 'var(--text-muted)' }}>Scan attendee tickets to verify their event registration.</p>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start' }}>
        {/* Scanner Panel */}
        <div className="glass-panel" style={{ flex: '1 1 450px', maxWidth: '500px', padding: '1.5rem', position: 'relative' }}>
          <div 
            style={{ 
              position: 'relative', 
              width: '100%', 
              borderRadius: '16px', 
              overflow: 'hidden', 
              backgroundColor: '#000', 
              minHeight: '350px',
              border: '1px solid var(--border-color)'
            }}
          >
            {/* Dedicated scanner div - MUST stay empty for React */}
            <div id="qr-reader" style={{ width: '100%' }}></div>

            {/* Overlays are now siblings to the scanner container, not children */}
            {!isScanning && status === 'idle' && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15, 23, 42, 0.8)', zIndex: 10 }}>
                <div style={{ padding: '2rem', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', marginBottom: '1.5rem' }}>
                  <Camera size={48} color="var(--primary)" />
                </div>
                <p style={{ color: 'white', fontWeight: 500 }}>Scanner is Ready</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Click the button below to activate camera</p>
              </div>
            )}
            
            {status === 'loading' && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15, 23, 42, 0.9)', zIndex: 20 }}>
                <div className="loader"></div>
                <p style={{ color: 'white', marginTop: '1rem', fontWeight: 500 }}>Verifying Ticket...</p>
              </div>
            )}
          </div>
          
          <button 
            onClick={isScanning ? stopScanner : startScanner}
            disabled={status === 'loading'}
            className="btn"
            style={{ 
              width: '100%', 
              marginTop: '1.5rem', 
              height: '3.5rem',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.75rem',
              fontSize: '1.125rem',
              fontWeight: 600,
              background: isScanning ? 'rgba(239, 68, 68, 0.1)' : 'var(--primary)',
              color: isScanning ? 'var(--danger)' : 'white',
              border: isScanning ? '1px solid var(--danger)' : 'none'
            }}
          >
            {isScanning ? <CameraOff size={22} /> : <Camera size={22} />}
            {isScanning ? 'Stop Scanner' : 'Start Scanning'}
          </button>
        </div>

        {/* Status Panel */}
        {status !== 'idle' && status !== 'loading' && (
          <div className="glass-panel" style={{ flex: '1 1 350px', maxWidth: '400px', padding: '2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'fadeIn 0.3s ease-out' }}>
            {status === 'success' ? (
              <div style={{ width: '100%' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <CheckCircle size={48} color="var(--success)" />
                </div>
                <h3 style={{ color: 'var(--success)', fontSize: '1.75rem', marginBottom: '0.5rem' }}>Access Granted</h3>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '0.25rem' }}>{attendee?.name}</p>
                  <p style={{ color: 'var(--text-muted)' }}>{attendee?.email}</p>
                  {attendee?.role && (
                    <span className="badge badge-primary" style={{ marginTop: '0.75rem' }}>{attendee.role}</span>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ width: '100%' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <XCircle size={48} color="var(--danger)" />
                </div>
                <h3 style={{ color: 'var(--danger)', fontSize: '1.75rem', marginBottom: '0.5rem' }}>Access Denied</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{message}</p>
                {attendee && (
                   <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1.5rem', textAlign: 'left' }}>
                      <p style={{ fontWeight: 600 }}>{attendee.name}</p>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Ticket already used or invalid.</p>
                   </div>
                )}
              </div>
            )}

            <button 
              onClick={resetAndScanAgain}
              className="btn"
              style={{ width: '100%', gap: '0.5rem' }}
            >
              <RefreshCw size={18} />
              Scan Next Ticket
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

