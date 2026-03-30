'use client';

interface Props {
  size?: number;
  color?: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  delay?: number;
}

export default function FloatingOrb({
  size = 300,
  color = 'var(--accent)',
  top,
  left,
  right,
  bottom,
  delay = 0,
}: Props) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color}20 0%, ${color}05 50%, transparent 70%)`,
        top,
        left,
        right,
        bottom,
        animation: `floatOrb 8s ease-in-out ${delay}s infinite alternate`,
        filter: 'blur(40px)',
        zIndex: 0,
      }}
    />
  );
}