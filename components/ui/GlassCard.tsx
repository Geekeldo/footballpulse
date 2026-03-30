    'use client';

import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function GlassCard({ children, className = '', hover = true }: Props) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl p-8
        border border-white/10
        backdrop-blur-xl
        transition-all duration-500 ease-out
        ${hover ? 'hover:scale-[1.02] hover:shadow-2xl hover:border-white/20 hover:-translate-y-1' : ''}
        ${className}
      `}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.1)',
      }}
    >
      {children}
    </div>
  );
}