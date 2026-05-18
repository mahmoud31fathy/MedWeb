'use client';

import { Stethoscope, HeartPulse, Activity, Plus, Pill, Dna } from 'lucide-react';

export default function FloatingMedicalIcons() {
  const icons = [
    { Icon: Stethoscope, top: '15%', left: '10%', delay: '0s', size: 40 },
    { Icon: HeartPulse, top: '25%', left: '85%', delay: '2s', size: 35 },
    { Icon: Activity, top: '65%', left: '5%', delay: '4s', size: 45 },
    { Icon: Plus, top: '80%', left: '80%', delay: '1s', size: 30 },
    { Icon: Pill, top: '45%', left: '90%', delay: '3s', size: 38 },
    { Icon: Dna, top: '10%', left: '75%', delay: '5s', size: 42 },
    { Icon: Stethoscope, top: '85%', left: '20%', delay: '6s', size: 32 },
    { Icon: HeartPulse, top: '50%', left: '15%', delay: '2.5s', size: 36 },
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: -1,
      overflow: 'hidden',
      pointerEvents: 'none',
      opacity: 0.12
    }}>
      {icons.map((item, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            top: item.top,
            left: item.left,
            color: 'var(--primary)',
            animation: `float ${12 + index % 5}s ease-in-out infinite`,
            animationDelay: item.delay,
            filter: 'blur(1px)'
          }}
        >
          <item.Icon size={item.size} />
        </div>
      ))}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-30px) rotate(10deg);
          }
        }
      `}</style>
    </div>
  );
}
