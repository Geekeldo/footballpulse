'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  end: number;
  suffix?: string;
  label: string;
  duration?: number;
}

export default function CounterStat({ end, suffix = '', label, duration = 2000 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;

    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [started, end, duration]);

  return (
    <div ref={ref} className="text-center">
      <div
        className="text-5xl md:text-6xl font-bold font-display mb-2"
        style={{ color: 'var(--accent)' }}
      >
        {count}
        {suffix}
      </div>
      <div className="text-sm uppercase tracking-widest opacity-60" style={{ color: 'var(--ink)' }}>
        {label}
      </div>
    </div>
  );
}