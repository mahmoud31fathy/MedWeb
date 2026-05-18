'use client';

import { useEffect, useState } from 'react';

export default function CursorGlow() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -2,
        pointerEvents: 'none',
        '--mouse-x': `${position.x}px`,
        '--mouse-y': `${position.y}px`,
      } as any}
    >
      <div className="medical-glow" />
      
      <style jsx>{`
        .medical-glow {
          position: absolute;
          width: 500px;
          height: 500px;
          top: calc(var(--mouse-y) - 250px);
          left: calc(var(--mouse-x) - 250px);
          background: radial-gradient(circle, var(--primary) 0%, transparent 70%);
          opacity: 0.12;
          border-radius: 50%;
          filter: blur(50px);
          animation: scan-shimmer 4s ease-in-out infinite;
          transition: transform 0.1s ease-out;
        }

        @keyframes scan-shimmer {
          0%, 100% {
            transform: scale(1);
            opacity: 0.1;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.15;
          }
        }
      `}</style>
    </div>
  );
}
