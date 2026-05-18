'use client';

export default function MedicalPulseBackground() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: -3,
      pointerEvents: 'none',
      overflow: 'hidden'
    }}>
      {/* EKG Heartbeat Line */}
      <div className="ekg-container">
        <svg viewBox="0 0 1000 100" preserveAspectRatio="none" style={{ width: '100%', height: '100px', opacity: 0.1 }}>
          <path 
            className="ekg-path"
            d="M0,50 L200,50 L210,40 L220,60 L230,50 L250,50 L260,10 L275,90 L290,50 L350,50 L360,40 L370,60 L380,50 L600,50 L610,10 L625,90 L640,50 L1000,50"
            fill="none" 
            stroke="var(--primary)" 
            strokeWidth="2"
          />
        </svg>
      </div>

      <style jsx>{`
        .ekg-container {
          position: absolute;
          bottom: 10%;
          left: 0;
          width: 200%;
          animation: slide-ekg 25s linear infinite;
        }

        @keyframes slide-ekg {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        .ekg-path {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: draw-ekg 5s linear infinite;
        }

        @keyframes draw-ekg {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}
