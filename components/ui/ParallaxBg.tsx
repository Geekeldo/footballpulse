'use client';

import { useEffect, useState } from 'react';

export default function ParallaxBg() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => setOffset(window.scrollY * 0.3);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          transform: `translateY(${offset * 0.2}px)`,
        }}
      />
      {/* Gradient overlay */}
      <div
        className="absolute top-0 left-0 right-0 h-[500px]"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, var(--accent)10 0%, transparent 60%)',
          transform: `translateY(${-offset * 0.1}px)`,
        }}
      />
    </div>
  );
}