'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  BarChart3, FileText, DollarSign, Eye, TrendingUp, Send, RefreshCw,
  Loader2, Check, AlertCircle, Zap, Lock, Image, Bold, Italic, Heading,
  Quote, List, Link2, LogOut, Twitter, Facebook, Instagram, Trash2, Edit3,
  Search, Filter, ChevronLeft, ChevronRight, X, ExternalLink, Clock, Globe,
  Archive, CheckCircle, XCircle, Users, Activity, Wifi, ArrowUp, ArrowDown,
  Monitor, Smartphone, Tablet, MapPin, TrendingDown, PieChart, Calendar,
  Sun, Moon, Maximize2, Minimize2, Bell, Settings, MoreHorizontal,
  ChevronDown, ChevronUp, Layers, Database, Server, Cpu, HardDrive,
  Share2, Star, Heart, MessageCircle, Bookmark, Hash, BarChart2
} from 'lucide-react';

// ============================================================
// ANIMATED GLOBE COMPONENT (Canvas-based)
// ============================================================
function AnimatedGlobe({ connections }: { connections: any[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const rotationRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width;
    const h = rect.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) / 2 - 30;

    function latLngTo3D(lat: number, lng: number, r: number) {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + rotationRef.current) * (Math.PI / 180);
      return {
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.cos(phi),
        z: r * Math.sin(phi) * Math.sin(theta),
      };
    }

    function project(x: number, y: number, z: number) {
      const scale = 300 / (300 + z);
      return { x: cx + x * scale, y: cy - y * scale, z, scale };
    }

    // Simplified world landmass points
    const landPoints: [number, number][] = [];
    // Generate approximate land outlines
    const continents = [
      // Europe
      ...Array.from({ length: 40 }, (_, i) => [48 + Math.random() * 15, -10 + Math.random() * 40] as [number, number]),
      // Africa
      ...Array.from({ length: 50 }, (_, i) => [-5 + Math.random() * 35, -15 + Math.random() * 50] as [number, number]),
      // Asia
      ...Array.from({ length: 60 }, (_, i) => [20 + Math.random() * 40, 40 + Math.random() * 100] as [number, number]),
      // North America
      ...Array.from({ length: 50 }, (_, i) => [25 + Math.random() * 30, -130 + Math.random() * 70] as [number, number]),
      // South America
      ...Array.from({ length: 40 }, (_, i) => [-30 + Math.random() * 35, -80 + Math.random() * 35] as [number, number]),
      // Australia
      ...Array.from({ length: 20 }, (_, i) => [-35 + Math.random() * 15, 115 + Math.random() * 30] as [number, number]),
    ];
    landPoints.push(...continents);

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);

      // Globe glow
      const glowGrad = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 1.4);
      glowGrad.addColorStop(0, 'rgba(24, 95, 165, 0.08)');
      glowGrad.addColorStop(1, 'rgba(24, 95, 165, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, w, h);

      // Globe sphere
      const sphereGrad = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, 0, cx, cy, radius);
      sphereGrad.addColorStop(0, 'rgba(24, 95, 165, 0.06)');
      sphereGrad.addColorStop(0.7, 'rgba(24, 95, 165, 0.03)');
      sphereGrad.addColorStop(1, 'rgba(24, 95, 165, 0.01)');
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = sphereGrad;
      ctx.fill();

      // Globe outline
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(24, 95, 165, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Grid lines
      ctx.strokeStyle = 'rgba(24, 95, 165, 0.06)';
      ctx.lineWidth = 0.5;

      // Latitude lines
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        for (let lng = 0; lng <= 360; lng += 3) {
          const p3d = latLngTo3D(lat, lng, radius);
          const p = project(p3d.x, p3d.y, p3d.z);
          if (p3d.z > -radius * 0.2) {
            if (lng === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          }
        }
        ctx.stroke();
      }

      // Longitude lines
      for (let lng = 0; lng < 360; lng += 30) {
        ctx.beginPath();
        for (let lat = -90; lat <= 90; lat += 3) {
          const p3d = latLngTo3D(lat, lng, radius);
          const p = project(p3d.x, p3d.y, p3d.z);
          if (p3d.z > -radius * 0.2) {
            if (lat === -90) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          }
        }
        ctx.stroke();
      }

      // Land dots
      landPoints.forEach(([lat, lng]) => {
        const p3d = latLngTo3D(lat, lng, radius);
        if (p3d.z > 0) {
          const p = project(p3d.x, p3d.y, p3d.z);
          const alpha = Math.max(0, p3d.z / radius) * 0.4;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.2 * p.scale, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(24, 95, 165, ${alpha})`;
          ctx.fill();
        }
      });

      // Connection points with pulse
      connections.forEach((conn, idx) => {
        if (!conn.lat || !conn.lng) return;
        const p3d = latLngTo3D(conn.lat, conn.lng, radius);
        if (p3d.z > 0) {
          const p = project(p3d.x, p3d.y, p3d.z);
          const alpha = Math.max(0.3, p3d.z / radius);
          const size = (conn.count || 1) * 2 + 3;

          // Outer pulse
          const pulseSize = size + Math.sin(Date.now() / 500 + idx) * 4 + 4;
          ctx.beginPath();
          ctx.arc(p.x, p.y, pulseSize * p.scale, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(186, 117, 23, ${alpha * 0.15})`;
          ctx.fill();

          // Inner dot
          ctx.beginPath();
          ctx.arc(p.x, p.y, size * p.scale, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(186, 117, 23, ${alpha * 0.8})`;
          ctx.fill();

          // Core
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2 * p.scale, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 200, 50, ${alpha})`;
          ctx.fill();

          // Label
          if (conn.count > 2 && p3d.z > radius * 0.5) {
            ctx.font = `bold ${10 * p.scale}px system-ui`;
            ctx.fillStyle = `rgba(24, 95, 165, ${alpha * 0.9})`;
            ctx.textAlign = 'center';
            ctx.fillText(conn.country || '', p.x, p.y - size * p.scale - 6);
            ctx.font = `${9 * p.scale}px system-ui`;
            ctx.fillStyle = `rgba(100, 100, 100, ${alpha * 0.7})`;
            ctx.fillText(`${conn.count} users`, p.x, p.y - size * p.scale + 4);
          }
        }
      });

      // Connection arcs
      if (connections.length > 1) {
        for (let i = 0; i < Math.min(connections.length - 1, 8); i++) {
          const c1 = connections[i];
          const c2 = connections[(i + 1) % connections.length];
          if (!c1.lat || !c2.lat) continue;

          const steps = 30;
          ctx.beginPath();
          let started = false;
          for (let s = 0; s <= steps; s++) {
            const t = s / steps;
            const lat = c1.lat + (c2.lat - c1.lat) * t;
            const lng = c1.lng + (c2.lng - c1.lng) * t;
            const arcHeight = Math.sin(t * Math.PI) * 30;
            const p3d = latLngTo3D(lat, lng, radius + arcHeight);
            if (p3d.z > 0) {
              const p = project(p3d.x, p3d.y, p3d.z);
              if (!started) { ctx.moveTo(p.x, p.y); started = true; }
              else ctx.lineTo(p.x, p.y);
            }
          }
          ctx.strokeStyle = 'rgba(186, 117, 23, 0.2)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      rotationRef.current += 0.15;
      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [connections]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }} />;
}

// ============================================================
// SPARKLINE COMPONENT
// ============================================================
function Sparkline({ data, color = 'var(--ink)', height = 32, width = 80 }: { data: number[], color?: string, height?: number, width?: number }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} className="shrink-0">
      <defs>
        <linearGradient id={`sg-${color.replace(/[^a-z0-9]/gi, '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#sg-${color.replace(/[^a-z0-9]/gi, '')})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={width} cy={parseFloat(points.split(' ').pop()?.split(',')[1] || '0')} r="2.5" fill={color} />
    </svg>
  );
}

// ============================================================
// DONUT CHART
// ============================================================
function DonutChart({ segments, size = 120 }: { segments: { label: string, value: number, color: string }[], size?: number }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const r = (size - 20) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const strokeW = 18;
  let cumAngle = -90;

  return (
    <svg width={size} height={size}>
      {/* Background circle */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth={strokeW} />
      {segments.map((seg, i) => {
        const angle = (seg.value / total) * 360;
        const startAngle = cumAngle;
        cumAngle += angle;
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = ((startAngle + angle) * Math.PI) / 180;
        const x1 = cx + r * Math.cos(startRad);
        const y1 = cy + r * Math.sin(startRad);
        const x2 = cx + r * Math.cos(endRad);
        const y2 = cy + r * Math.sin(endRad);
        const largeArc = angle > 180 ? 1 : 0;
        if (angle === 0) return null;
        return (
          <path key={i}
            d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
            fill="none" stroke={seg.color} strokeWidth={strokeW} strokeLinecap="round"
            style={{ transition: 'all 0.6s ease' }}
          />
        );
      })}
      <text x={cx} y={cy - 4} textAnchor="middle" className="text-lg font-bold" fill="var(--ink)" style={{ fontFamily: 'var(--font-display)' }}>
        {total.toLocaleString()}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" className="text-[9px] uppercase" fill="var(--muted)">
        total
      </text>
    </svg>
  );
}

// ============================================================
// AREA CHART
// ============================================================
function AreaChart({ data, dataKey = 'views', height = 200, color = '#185FA5' }: { data: any[], dataKey?: string, height?: number, color?: string }) {
  if (!data || data.length < 2) return <div className="flex items-center justify-center" style={{ height, color: 'var(--muted)' }}>No data</div>;

  const values = data.map(d => d[dataKey] || 0);
  const max = Math.max(...values) || 1;
  const min = 0;
  const range = max - min;
  const w = 100;
  const h = 100;
  const padding = 2;

  const points = values.map((v, i) => {
    const x = padding + (i / (values.length - 1)) * (w - padding * 2);
    const y = h - padding - ((v - min) / range) * (h - padding * 2);
    return { x, y, value: v };
  });

  const pathD = points.map((p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cpx1 = prev.x + (p.x - prev.x) / 3;
    const cpx2 = p.x - (p.x - prev.x) / 3;
    return `C ${cpx1} ${prev.y} ${cpx2} ${p.y} ${p.x} ${p.y}`;
  }).join(' ');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${h} L ${points[0].x} ${h} Z`;

  return (
    <div style={{ height }} className="relative">
      {/* Y axis labels */}
      <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between pr-2" style={{ width: '40px' }}>
        {[max, Math.round(max * 0.5), 0].map((v, i) => (
          <span key={i} className="text-[9px]" style={{ color: 'var(--muted)' }}>{v.toLocaleString()}</span>
        ))}
      </div>
      <div className="absolute left-10 right-0 top-0 bottom-4">
        <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={color} stopOpacity="0.01" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <line key={y} x1={padding} y1={y} x2={w - padding} y2={y} stroke="var(--border)" strokeWidth="0.3" strokeDasharray="2 2" />
          ))}
          <path d={areaD} fill="url(#areaGrad)" />
          <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          {/* Dots */}
          {points.filter((_, i) => i % Math.max(1, Math.floor(points.length / 10)) === 0 || i === points.length - 1).map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="1.5" fill="white" stroke={color} strokeWidth="1" vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
      </div>
      {/* X axis labels */}
      <div className="absolute left-10 right-0 bottom-0 flex justify-between">
        {data.filter((_, i) => i % Math.max(1, Math.floor(data.length / 6)) === 0 || i === data.length - 1).map((d, i) => (
          <span key={i} className="text-[9px]" style={{ color: 'var(--muted)' }}>{d.date?.slice(5) || ''}</span>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// REAL-TIME INDICATOR
// ============================================================
function LiveDot() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#22c55e' }} />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: '#22c55e' }} />
    </span>
  );
}

// ============================================================
// HEATMAP COMPONENT
// ============================================================
function HeatmapChart({ data }: { data: number[][] }) {
  // 7 days x 24 hours
  const max = Math.max(...data.flat()) || 1;
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return (
    <div className="space-y-1">
      <div className="flex gap-0.5 ml-8">
        {Array.from({ length: 24 }, (_, h) => (
          <div key={h} className="flex-1 text-center text-[8px]" style={{ color: 'var(--muted)' }}>
            {h % 4 === 0 ? `${h}h` : ''}
          </div>
        ))}
      </div>
      {data.map((row, d) => (
        <div key={d} className="flex items-center gap-0.5">
          <span className="text-[9px] w-7 shrink-0" style={{ color: 'var(--muted)' }}>{days[d]}</span>
          {row.map((v, h) => {
            const intensity = v / max;
            return (
              <div key={h} className="flex-1 aspect-square rounded-sm" title={`${days[d]} ${h}h: ${v}`}
                style={{ background: intensity > 0 ? `rgba(24, 95, 165, ${Math.max(0.08, intensity * 0.8)})` : 'var(--border)', minWidth: '4px' }} />
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// AUTH WRAPPER
// ============================================================
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/admin-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwd }),
    });
    if (res.ok) {
      setAuthed(true);
      sessionStorage.setItem('fp_admin', '1');
      sessionStorage.setItem('fp_admin_pwd', pwd);
    } else {
      setError('Wrong password');
    }
  }

  useEffect(() => {
    if (sessionStorage.getItem('fp_admin') === '1') setAuthed(true);
  }, []);

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--paper)' }}>
        <div className="w-full max-w-sm anim-scale">
          <div className="text-center mb-8">
            <div className="font-display text-4xl mb-2" style={{ color: 'var(--ink)' }}>Football<span style={{ color: 'var(--accent)' }}>Pulse</span></div>
            <div className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--muted)' }}>Admin panel</div>
          </div>
          <div className="p-8" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}>
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-6" style={{ background: 'var(--paper-warm)', borderRadius: '12px' }}>
              <Lock size={20} style={{ color: 'var(--ink)' }} />
            </div>
            <form onSubmit={login}>
              <label className="block text-[10px] font-bold uppercase tracking-[0.12em] mb-2" style={{ color: 'var(--muted)' }}>Password</label>
              <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} autoFocus
                className="w-full px-4 py-3 text-sm outline-none"
                style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--ink)' }}
                placeholder="Enter admin password" />
              {error && <p className="text-xs mt-2" style={{ color: 'var(--accent)' }}>{error}</p>}
              <button type="submit" className="w-full mt-4 py-3 text-sm font-bold uppercase tracking-wider hover:opacity-90"
                style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: '6px' }}>Sign in</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return <Dashboard onLogout={() => { setAuthed(false); sessionStorage.removeItem('fp_admin'); sessionStorage.removeItem('fp_admin_pwd'); }} />;
}

// ============================================================
// MAIN DASHBOARD
// ============================================================
function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<'overview' | 'articles' | 'realtime' | 'pronos' | 'editor' | 'social' | 'cron' | 'teams' | 'players'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [sideCollapsed, setSideCollapsed] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/stats?period=${period}`);
      setStats(await res.json());
    } catch { }
    setLoading(false);
  }, [period]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
    { id: 'realtime' as const, label: 'Real-time', icon: Activity },
    { id: 'articles' as const, label: 'Articles', icon: FileText },
    { id: 'editor' as const, label: 'New article', icon: Edit3 },
    { id: 'social' as const, label: 'Social', icon: Send },
    { id: 'cron' as const, label: 'AI Cron', icon: Zap },
    { id: 'teams' as const, label: 'Teams', icon: Globe },
    { id: 'players' as const, label: 'Players', icon: Zap },
    { id: 'pronos' as const, label: 'Pronos', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--paper)' }}>
      {/* Sidebar */}
      <aside className="shrink-0 flex flex-col transition-all duration-300"
        style={{
          width: sideCollapsed ? '60px' : '220px',
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          height: '100vh',
          position: 'sticky',
          top: 0,
        }}>
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
          {!sideCollapsed && (
            <span className="font-display text-lg" style={{ color: 'var(--ink)' }}>
              F<span style={{ color: 'var(--accent)' }}>P</span>
              <span className="text-[10px] uppercase tracking-wider ml-2 font-sans font-bold" style={{ color: 'var(--muted)' }}>Admin</span>
            </span>
          )}
          <button onClick={() => setSideCollapsed(!sideCollapsed)} className="p-1 hover:opacity-60">
            {sideCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium transition-all hover:bg-[var(--paper-warm)]"
              style={{
                color: tab === t.id ? 'var(--ink)' : 'var(--muted)',
                background: tab === t.id ? 'var(--paper-warm)' : 'transparent',
                borderRight: tab === t.id ? '2px solid var(--ink)' : '2px solid transparent',
              }}>
              <t.icon size={16} />
              {!sideCollapsed && <span className="uppercase tracking-wider">{t.label}</span>}
              {t.id === 'realtime' && !sideCollapsed && <LiveDot />}
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-3" style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 text-xs hover:opacity-60"
            style={{ color: 'var(--muted)' }}>
            <LogOut size={16} />
            {!sideCollapsed && <span className="uppercase tracking-wider font-bold">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-3 sticky top-0 z-10"
          style={{ background: 'var(--paper)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(8px)' }}>
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--ink)' }}>
              {tabs.find(t => t.id === tab)?.label}
            </h1>
            {tab === 'realtime' && <LiveDot />}
          </div>
          <div className="flex items-center gap-2">
            <select value={period} onChange={e => setPeriod(e.target.value)}
              className="text-xs px-3 py-1.5 outline-none" style={{ background: 'var(--paper-warm)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--ink)' }}>
              <option value="1d">Today</option><option value="7d">7 days</option><option value="30d">30 days</option><option value="90d">90 days</option>
            </select>
            <button onClick={fetchStats} className="p-1.5 hover:opacity-60" style={{ background: 'var(--paper-warm)', borderRadius: '6px' }}>
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>

        <div className="p-6">
          {loading && !stats ? (
            <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin" style={{ color: 'var(--muted)' }} /></div>
          ) : (
            <>
              {tab === 'overview' && stats && <OverviewTab stats={stats} />}
              {tab === 'realtime' && <RealtimeTab />}
              {tab === 'articles' && <ArticlesTab />}
              {tab === 'editor' && <EditorTab onSaved={() => setTab('articles')} />}
              {tab === 'social' && stats && <SocialTab articles={stats.topArticles || []} />}
              {tab === 'cron' && <CronTab />}
              {tab === 'teams' && <TeamsTab />}
              {tab === 'players' && <PlayersTab />}
              {tab === 'pronos' && <PronosTab />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// ============================================================
// OVERVIEW TAB — Enhanced
// ============================================================
function OverviewTab({ stats }: { stats: any }) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const cards = [
    {
      label: 'Total articles', value: stats.overview.totalArticles, icon: FileText, color: '#185FA5',
      change: '+12%', positive: true, sparkData: [12, 15, 13, 18, 22, 25, 28, 30, 27, 35, 32, 38]
    },
    {
      label: 'Total views', value: stats.overview.totalViews.toLocaleString(), icon: Eye, color: '#0F6E56',
      change: '+24%', positive: true, sparkData: [100, 120, 110, 150, 180, 200, 190, 230, 260, 280, 310, 350]
    },
    {
      label: 'Revenue', value: `$${stats.overview.totalRevenue.toFixed(2)}`, icon: DollarSign, color: '#BA7517',
      change: '+8%', positive: true, sparkData: [5, 8, 6, 12, 15, 18, 14, 20, 22, 25, 28, 30]
    },
    {
      label: 'Recent (7d)', value: stats.overview.recentArticles, icon: TrendingUp, color: '#534AB7',
      change: '-3%', positive: false, sparkData: [8, 10, 7, 5, 9, 12, 8, 6, 10, 7, 5, 4]
    },
  ];

  // Generate heatmap data
  const heatmapData = Array.from({ length: 7 }, () =>
    Array.from({ length: 24 }, () => Math.floor(Math.random() * 50))
  );

  const langSegments = Object.entries(stats.overview.articlesByLang || {}).map(([lang, count]: any, i) => ({
    label: lang.toUpperCase(),
    value: count,
    color: ['#185FA5', '#0F6E56', '#BA7517', '#534AB7', '#C43D3D'][i % 5],
  }));

  const categoryData = [
    { name: 'Transfers', value: 35, color: '#185FA5' },
    { name: 'Leagues', value: 28, color: '#0F6E56' },
    { name: 'Analysis', value: 18, color: '#BA7517' },
    { name: 'CL', value: 12, color: '#534AB7' },
    { name: 'Other', value: 7, color: '#888' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <div key={c.label}
            className="admin-card p-5 anim-up cursor-pointer transition-all duration-200"
            style={{
              animationDelay: `${i * 80}ms`,
              transform: hoveredCard === i ? 'translateY(-2px)' : 'none',
              boxShadow: hoveredCard === i ? '0 8px 25px rgba(0,0,0,0.08)' : 'none',
            }}
            onMouseEnter={() => setHoveredCard(i)}
            onMouseLeave={() => setHoveredCard(null)}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--muted)' }}>{c.label}</span>
              <div className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ background: `${c.color}12` }}>
                <c.icon size={15} style={{ color: c.color }} />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold font-display" style={{ color: 'var(--ink)' }}>{c.value}</div>
                <div className="flex items-center gap-1 mt-1">
                  {c.positive ? <ArrowUp size={10} style={{ color: '#0F6E56' }} /> : <ArrowDown size={10} style={{ color: '#C43D3D' }} />}
                  <span className="text-[10px] font-bold" style={{ color: c.positive ? '#0F6E56' : '#C43D3D' }}>{c.change}</span>
                  <span className="text-[10px]" style={{ color: 'var(--muted)' }}>vs last period</span>
                </div>
              </div>
              <Sparkline data={c.sparkData} color={c.color} height={36} width={70} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Views chart */}
        <div className="admin-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--muted)' }}>Views over time</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: '#185FA5' }} />
                <span className="text-[10px]" style={{ color: 'var(--muted)' }}>Views</span>
              </div>
            </div>
          </div>
          <AreaChart data={stats.chartData || []} height={200} color="#185FA5" />
        </div>

        {/* Language donut */}
        <div className="admin-card p-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] mb-6" style={{ color: 'var(--muted)' }}>By language</h3>
          <div className="flex flex-col items-center">
            <DonutChart segments={langSegments} size={130} />
            <div className="mt-4 space-y-2 w-full">
              {langSegments.map(seg => (
                <div key={seg.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: seg.color }} />
                    <span className="text-xs font-bold" style={{ color: 'var(--ink)' }}>{seg.label}</span>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>{seg.value} ({Math.round(seg.value / (langSegments.reduce((s, x) => s + x.value, 0) || 1) * 100)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heatmap */}
        <div className="admin-card p-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] mb-6" style={{ color: 'var(--muted)' }}>Traffic heatmap (this week)</h3>
          <HeatmapChart data={heatmapData} />
          <div className="flex items-center justify-end gap-1 mt-3">
            <span className="text-[9px]" style={{ color: 'var(--muted)' }}>Less</span>
            {[0.05, 0.2, 0.4, 0.6, 0.8].map(v => (
              <div key={v} className="w-3 h-3 rounded-sm" style={{ background: `rgba(24, 95, 165, ${v})` }} />
            ))}
            <span className="text-[9px]" style={{ color: 'var(--muted)' }}>More</span>
          </div>
        </div>

        {/* Categories */}
        <div className="admin-card p-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] mb-6" style={{ color: 'var(--muted)' }}>Content by category</h3>
          <div className="space-y-3">
            {categoryData.map(cat => {
              const total = categoryData.reduce((s, c) => s + c.value, 0);
              const pct = Math.round((cat.value / total) * 100);
              return (
                <div key={cat.name}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-bold" style={{ color: 'var(--ink)' }}>{cat.name}</span>
                    <span style={{ color: 'var(--muted)' }}>{cat.value} ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: cat.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top articles - enhanced */}
      <div className="admin-card">
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--muted)' }}>Top performing articles</h3>
          <span className="text-[10px]" style={{ color: 'var(--muted)' }}>{stats.topArticles?.length || 0} articles</span>
        </div>
        {(stats.topArticles || []).slice(0, 8).map((a: any, i: number) => (
          <div key={a.id} className="flex items-center gap-4 px-6 py-3 hover:bg-[var(--paper-warm)] transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold"
              style={{
                background: i < 3 ? ['#FFD700', '#C0C0C0', '#CD7F32'][i] + '20' : 'var(--paper-warm)',
                color: i < 3 ? ['#B8860B', '#696969', '#8B4513'][i] : 'var(--muted)',
              }}>
              {i + 1}
            </div>
            <div className="w-10 h-10 rounded overflow-hidden shrink-0" style={{ background: 'var(--paper-warm)' }}>
              {a.cover_image ? <img src={a.cover_image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[9px] font-bold" style={{ color: 'var(--muted)' }}>FP</div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--ink)' }}>{a.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--paper-warm)', color: 'var(--muted)' }}>{a.lang}</span>
                <span className="text-[10px] capitalize" style={{ color: 'var(--muted)' }}>{a.category}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold" style={{ color: 'var(--ink)' }}>{(a.views || 0).toLocaleString()}</p>
              <p className="text-[10px]" style={{ color: 'var(--muted)' }}>views</p>
            </div>
            <Sparkline data={[3, 5, 4, 8, 12, 10, 15, 13, 18, 20, 17, 22].map(v => v * (i + 1))} color={i < 3 ? '#0F6E56' : 'var(--muted)'} height={24} width={50} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// REAL-TIME TAB — Globe + Live connections
// ============================================================
// Remplacer le RealtimeTab dans votre admin page

function RealtimeTab() {
  const [data, setData] = useState<any>(null);
  const [heatmapData, setHeatmapData] = useState<number[][]>([]);
  const [history, setHistory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Fetch initial data
  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchRealtimeData, 10000); // Refresh toutes les 10s
    return () => clearInterval(interval);
  }, []);

  // SSE pour les mises à jour en temps réel
  useEffect(() => {
    const es = new EventSource('/api/realtime/stream');
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data);
        setData((prev: any) => prev ? {
          ...prev,
          activeUsers: update.activeUsers,
          connections: update.connections,
        } : prev);

        // Ajouter le dernier événement au feed
        if (update.lastEvent) {
          setRecentEvents(prev => {
            const exists = prev[0]?.time === update.lastEvent.time && prev[0]?.page === update.lastEvent.page;
            if (exists) return prev;
            return [{ ...update.lastEvent, id: Date.now() }, ...prev].slice(0, 50);
          });
        }
      } catch { }
    };

    es.onerror = () => {
      es.close();
      // Reconnexion automatique après 5s
      setTimeout(() => {
        if (eventSourceRef.current === es) {
          const newEs = new EventSource('/api/realtime/stream');
          eventSourceRef.current = newEs;
        }
      }, 5000);
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, []);

  async function fetchAll() {
    setLoading(true);
    await Promise.all([fetchRealtimeData(), fetchHeatmap(), fetchHistory()]);
    setLoading(false);
  }

  async function fetchRealtimeData() {
    try {
      const res = await fetch('/api/realtime?type=overview');
      const d = await res.json();
      setData(d);
      if (d.recentEvents) setRecentEvents(prev => {
        // Fusionner sans doublons
        const existing = new Set(prev.map((e: any) => e.time + e.page));
        const newEvents = d.recentEvents.filter((e: any) => !existing.has(e.time + e.page));
        return [...newEvents.map((e: any) => ({ ...e, id: Math.random() })), ...prev].slice(0, 50);
      });
    } catch { }
  }

  async function fetchHeatmap() {
    try {
      const res = await fetch('/api/realtime?type=heatmap');
      const d = await res.json();
      setHeatmapData(d.heatmap || []);
    } catch { }
  }

  async function fetchHistory() {
    try {
      const res = await fetch('/api/realtime?type=history');
      setHistory(await res.json());
    } catch { }
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--muted)' }} />
      </div>
    );
  }

  const totalOnline = data.activeUsers || 0;
  const connections = data.connections || [];
  const topPages = data.topPages || [];
  const devices = data.devices || { desktop: 0, mobile: 0, tablet: 0 };
  const sources = data.sources || { direct: 0, google: 0, social: 0, referral: 0, other: 0 };
  const pageViewsTimeline = data.pageViewsTimeline || [];

  const totalDevices = devices.desktop + devices.mobile + devices.tablet || 1;
  const totalSources = Object.values(sources).reduce((s: number, v: any) => s + v, 0) as number || 1;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="admin-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <LiveDot />
            <span className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--muted)' }}>Online now</span>
          </div>
          <div className="text-3xl font-bold font-display" style={{ color: '#0F6E56' }}>{totalOnline}</div>
          <div className="text-[10px] mt-1" style={{ color: 'var(--muted)' }}>Active users</div>
        </div>
        <div className="admin-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Eye size={12} style={{ color: 'var(--muted)' }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--muted)' }}>Views / min</span>
          </div>
          <div className="text-3xl font-bold font-display" style={{ color: '#185FA5' }}>
            {pageViewsTimeline.length > 0 ? pageViewsTimeline[pageViewsTimeline.length - 1].count : 0}
          </div>
          <Sparkline data={pageViewsTimeline.map((p: any) => p.count)} color="#185FA5" height={24} width={80} />
        </div>
        <div className="admin-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={12} style={{ color: 'var(--muted)' }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--muted)' }}>Countries</span>
          </div>
          <div className="text-3xl font-bold font-display" style={{ color: '#BA7517' }}>
            {connections.filter((c: any) => c.count > 0).length}
          </div>
          <div className="text-[10px] mt-1" style={{ color: 'var(--muted)' }}>Active regions</div>
        </div>
        <div className="admin-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={12} style={{ color: 'var(--muted)' }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--muted)' }}>Bounce rate</span>
          </div>
          <div className="text-3xl font-bold font-display" style={{ color: '#534AB7' }}>
            {history?.bounceRate || 0}%
          </div>
          <div className="text-[10px] mt-1" style={{ color: 'var(--muted)' }}>
            {history?.avgPagesPerSession || 0} pages/session
          </div>
        </div>
      </div>

      {/* Globe + Countries */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        <div className="admin-card overflow-hidden" style={{ minHeight: '420px' }}>
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2">
              <Globe size={14} style={{ color: 'var(--ink)' }} />
              <h3 className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--muted)' }}>Worldwide connections</h3>
            </div>
            <div className="flex items-center gap-1.5">
              <LiveDot />
              <span className="text-[10px] font-bold" style={{ color: '#0F6E56' }}>{totalOnline} online</span>
            </div>
          </div>
          <div className="p-4" style={{ height: '380px' }}>
            <AnimatedGlobe connections={connections} />
          </div>
        </div>

        <div className="space-y-4">
          {/* Countries list */}
          <div className="admin-card">
            <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--muted)' }}>By country</h3>
            </div>
            <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
              {connections.length === 0 ? (
                <p className="px-5 py-4 text-xs text-center" style={{ color: 'var(--muted)' }}>No active users</p>
              ) : connections.map((c: any) => (
                <div key={c.code} className="flex items-center gap-3 px-5 py-2 hover:bg-[var(--paper-warm)]" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className="text-lg">{getFlagEmoji(c.code)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium" style={{ color: 'var(--ink)' }}>{c.country}</p>
                    <div className="h-1 mt-1 rounded-full" style={{ background: 'var(--border)' }}>
                      <div className="h-full rounded-full transition-all" style={{
                        width: `${(c.count / (connections[0]?.count || 1)) * 100}%`,
                        background: '#185FA5'
                      }} />
                    </div>
                  </div>
                  <span className="text-xs font-bold" style={{ color: 'var(--ink)' }}>{c.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Devices */}
          <div className="admin-card p-5">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] mb-4" style={{ color: 'var(--muted)' }}>Devices</h3>
            {[
              { label: 'Desktop', icon: Monitor, value: devices.desktop, color: '#185FA5' },
              { label: 'Mobile', icon: Smartphone, value: devices.mobile, color: '#0F6E56' },
              { label: 'Tablet', icon: Tablet, value: devices.tablet, color: '#BA7517' },
            ].map(d => {
              const pct = Math.round((d.value / totalDevices) * 100);
              return (
                <div key={d.label} className="flex items-center gap-3 mb-3">
                  <d.icon size={14} style={{ color: d.color }} />
                  <div className="flex-1">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="font-bold" style={{ color: 'var(--ink)' }}>{d.label}</span>
                      <span style={{ color: 'var(--muted)' }}>{d.value} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: d.color }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live views */}
        <div className="admin-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--muted)' }}>Live page views (30 min)</h3>
            <LiveDot />
          </div>
          <AreaChart data={pageViewsTimeline.map((p: any) => ({ date: p.time, views: p.count }))} height={180} color="#0F6E56" />
        </div>

        {/* Event feed */}
        <div className="admin-card">
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--muted)' }}>Live event feed</h3>
            <LiveDot />
          </div>
          <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
            {recentEvents.length === 0 ? (
              <p className="px-6 py-8 text-xs text-center" style={{ color: 'var(--muted)' }}>Waiting for events...</p>
            ) : recentEvents.slice(0, 20).map((evt: any, i: number) => (
              <div key={evt.id || i} className="flex items-center gap-3 px-5 py-2 hover:bg-[var(--paper-warm)] transition-colors"
                style={{
                  borderBottom: '1px solid var(--border)',
                  animation: i === 0 ? 'fadeSlideIn 0.3s ease' : 'none',
                }}>
                <span className="text-sm">{getFlagEmoji(evt.country)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] truncate" style={{ color: 'var(--ink)' }}>{evt.page}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px]" style={{ color: 'var(--muted)' }}>{evt.device}</span>
                    <span className="text-[9px]" style={{ color: 'var(--muted)' }}>·</span>
                    <span className="text-[9px]" style={{ color: 'var(--muted)' }}>{evt.time}</span>
                  </div>
                </div>
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: i === 0 ? '#22c55e' : 'var(--border)' }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active pages */}
        <div className="admin-card">
          <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--muted)' }}>Active pages</h3>
          </div>
          {topPages.length === 0 ? (
            <p className="px-5 py-6 text-xs text-center" style={{ color: 'var(--muted)' }}>No active pages</p>
          ) : topPages.map((p: any, i: number) => (
            <div key={p.page} className="flex items-center gap-3 px-5 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="w-5 text-[10px] font-bold" style={{ color: 'var(--muted)' }}>{i + 1}</div>
              <p className="flex-1 text-[11px] truncate" style={{ color: 'var(--ink)' }}>{p.page}</p>
              <div className="flex items-center gap-1.5">
                <Users size={10} style={{ color: '#0F6E56' }} />
                <span className="text-[11px] font-bold" style={{ color: '#0F6E56' }}>{p.users}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Traffic sources */}
        <div className="admin-card p-5">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] mb-4" style={{ color: 'var(--muted)' }}>Traffic sources (24h)</h3>
          {[
            { source: 'Direct', pct: Math.round((sources.direct / totalSources) * 100), color: '#185FA5', icon: Globe },
            { source: 'Google', pct: Math.round((sources.google / totalSources) * 100), color: '#0F6E56', icon: Search },
            { source: 'Social', pct: Math.round((sources.social / totalSources) * 100), color: '#BA7517', icon: Share2 },
            { source: 'Referral', pct: Math.round((sources.referral / totalSources) * 100), color: '#534AB7', icon: ExternalLink },
          ].map(s => (
            <div key={s.source} className="flex items-center gap-3 mb-3">
              <div className="w-7 h-7 flex items-center justify-center rounded-md" style={{ background: `${s.color}12` }}>
                <s.icon size={12} style={{ color: s.color }} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="font-bold" style={{ color: 'var(--ink)' }}>{s.source}</span>
                  <span style={{ color: 'var(--muted)' }}>{s.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${s.pct}%`, background: s.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Heatmap */}
        <div className="admin-card p-5">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] mb-4" style={{ color: 'var(--muted)' }}>Traffic heatmap (7d)</h3>
          {heatmapData.length > 0 ? (
            <>
              <HeatmapChart data={heatmapData} />
              <div className="flex items-center justify-end gap-1 mt-3">
                <span className="text-[9px]" style={{ color: 'var(--muted)' }}>Less</span>
                {[0.05, 0.2, 0.4, 0.6, 0.8].map(v => (
                  <div key={v} className="w-3 h-3 rounded-sm" style={{ background: `rgba(24, 95, 165, ${v})` }} />
                ))}
                <span className="text-[9px]" style={{ color: 'var(--muted)' }}>More</span>
              </div>
            </>
          ) : (
            <p className="text-xs text-center py-6" style={{ color: 'var(--muted)' }}>Not enough data yet</p>
          )}
        </div>
      </div>

      {/* Browsers */}
      {data.browsers && data.browsers.length > 0 && (
        <div className="admin-card p-5">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] mb-4" style={{ color: 'var(--muted)' }}>Active browsers</h3>
          <div className="flex items-center gap-4 flex-wrap">
            {data.browsers.map((b: any) => (
              <div key={b.name} className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'var(--paper-warm)' }}>
                <span className="text-xs font-bold" style={{ color: 'var(--ink)' }}>{b.name}</span>
                <span className="text-[10px]" style={{ color: 'var(--muted)' }}>{b.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ============================================================
// HELPER: Country code → flag emoji
// ============================================================
function getFlagEmoji(countryCode: string) {
  if (!countryCode || countryCode.length !== 2) return '🌍';
  const codePoints = countryCode.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// ============================================================
// ARTICLES TAB — List, filter, edit, delete, status change
// ============================================================
function ArticlesTab() {
  const [articles, setArticles] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterLang, setFilterLang] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCat, setFilterCat] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'views' | 'title'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ admin: '1', page: String(page), limit: '20' });
    if (filterLang !== 'all') params.set('lang', filterLang);
    if (filterStatus !== 'all') params.set('status', filterStatus);
    if (filterCat !== 'all') params.set('category', filterCat);
    if (search) params.set('search', search);
    params.set('sort', sortBy);
    params.set('dir', sortDir);

    const res = await fetch(`/api/articles?${params}`);
    const data = await res.json();
    setArticles(data.articles || []);
    setTotal(data.total || 0);
    setTotalPages(data.totalPages || 1);
    setLoading(false);
  }, [page, filterLang, filterStatus, filterCat, search, sortBy, sortDir]);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  async function deleteArticle(id: string) {
    if (!confirm('Delete this article? This cannot be undone.')) return;
    setDeleting(id);
    await fetch(`/api/articles/${id}`, { method: 'DELETE' });
    setDeleting(null);
    fetchArticles();
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/articles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchArticles();
  }

  async function saveEdit() {
    if (!editing) return;
    await fetch(`/api/articles/${editing.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: editing.title,
        excerpt: editing.excerpt,
        category: editing.category,
        cover_image: editing.cover_image,
        status: editing.status,
      }),
    });
    setEditing(null);
    fetchArticles();
  }

  const statusColor = (s: string) => {
    if (s === 'published') return { bg: '#E1F5EE', color: '#085041' };
    if (s === 'draft') return { bg: '#FAEEDA', color: '#633806' };
    return { bg: 'var(--paper-warm)', color: 'var(--muted)' };
  };

  function toggleSort(key: 'date' | 'views' | 'title') {
    if (sortBy === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(key); setSortDir('desc'); }
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return <ChevronDown size={10} style={{ color: 'var(--border)' }} />;
    return sortDir === 'asc' ? <ChevronUp size={10} style={{ color: 'var(--ink)' }} /> : <ChevronDown size={10} style={{ color: 'var(--ink)' }} />;
  };

  // Stats summary
  const publishedCount = articles.filter(a => a.status === 'published').length;
  const draftCount = articles.filter(a => a.status === 'draft').length;
  const totalViews = articles.reduce((s, a) => s + (a.views || 0), 0);

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex items-center gap-4 flex-wrap">
        {[
          { label: 'Total', value: total, color: 'var(--ink)' },
          { label: 'Published', value: publishedCount, color: '#0F6E56' },
          { label: 'Drafts', value: draftCount, color: '#BA7517' },
          { label: 'Views (page)', value: totalViews.toLocaleString(), color: '#185FA5' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'var(--paper-warm)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
            <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--muted)' }}>{s.label}</span>
            <span className="text-xs font-bold" style={{ color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] px-3 py-2" style={{ background: 'var(--paper-warm)', borderRadius: '6px', border: '1px solid var(--border)' }}>
          <Search size={14} style={{ color: 'var(--muted)' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search articles..."
            className="flex-1 text-sm outline-none bg-transparent" style={{ color: 'var(--ink)' }} />
          {search && <button onClick={() => setSearch('')}><X size={14} style={{ color: 'var(--muted)' }} /></button>}
        </div>
        {[
          { val: filterLang, set: setFilterLang, opts: ['all', 'fr', 'en', 'ar', 'es'], label: 'Lang' },
          { val: filterStatus, set: setFilterStatus, opts: ['all', 'published', 'draft', 'archived'], label: 'Status' },
          { val: filterCat, set: setFilterCat, opts: ['all', 'transfers', 'leagues', 'analysis', 'champions-league', 'premier-league', 'la-liga', 'serie-a', 'general'], label: 'Category' },
        ].map(f => (
          <select key={f.label} value={f.val} onChange={e => { f.set(e.target.value); setPage(1); }}
            className="text-xs px-3 py-2 outline-none capitalize" style={{ background: 'var(--paper-warm)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--ink)' }}>
            {f.opts.map(o => <option key={o} value={o}>{o === 'all' ? `All ${f.label}` : o}</option>)}
          </select>
        ))}

        {/* View mode toggle */}
        <div className="flex items-center rounded-md overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          <button onClick={() => setViewMode('list')} className="px-2.5 py-1.5"
            style={{ background: viewMode === 'list' ? 'var(--ink)' : 'transparent', color: viewMode === 'list' ? 'var(--paper)' : 'var(--muted)' }}>
            <List size={13} />
          </button>
          <button onClick={() => setViewMode('grid')} className="px-2.5 py-1.5"
            style={{ background: viewMode === 'grid' ? 'var(--ink)' : 'transparent', color: viewMode === 'grid' ? 'var(--paper)' : 'var(--muted)' }}>
            <Layers size={13} />
          </button>
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="admin-card p-6 space-y-4" style={{ border: '2px solid var(--ink)' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>Editing article</h3>
            <button onClick={() => setEditing(null)}><X size={18} /></button>
          </div>
          <input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })}
            className="w-full px-3 py-2 text-sm outline-none" style={{ background: 'var(--paper-warm)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--ink)' }} />
          <input value={editing.excerpt || ''} onChange={e => setEditing({ ...editing, excerpt: e.target.value })} placeholder="Excerpt"
            className="w-full px-3 py-2 text-sm outline-none" style={{ background: 'var(--paper-warm)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--ink)' }} />
          <div className="flex gap-3">
            <select value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })}
              className="flex-1 text-xs px-3 py-2 outline-none" style={{ background: 'var(--paper-warm)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--ink)' }}>
              {['general', 'transfers', 'leagues', 'analysis', 'champions-league', 'premier-league', 'la-liga', 'serie-a', 'bundesliga'].map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value })}
              className="flex-1 text-xs px-3 py-2 outline-none" style={{ background: 'var(--paper-warm)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--ink)' }}>
              <option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option>
            </select>
          </div>
          <input value={editing.cover_image || ''} onChange={e => setEditing({ ...editing, cover_image: e.target.value })} placeholder="Cover image URL"
            className="w-full px-3 py-2 text-sm outline-none" style={{ background: 'var(--paper-warm)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--ink)' }} />
          {editing.cover_image && (
            <img src={editing.cover_image} alt="" className="h-24 object-cover rounded" onError={e => (e.currentTarget.style.display = 'none')} />
          )}
          <div className="flex gap-2">
            <button onClick={saveEdit} className="flex items-center gap-2 px-6 py-2 text-sm font-bold uppercase tracking-wider hover:opacity-90"
              style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: '6px' }}>
              <Check size={14} /> Save changes
            </button>
            <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm hover:opacity-60" style={{ color: 'var(--muted)' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Article list */}
      {viewMode === 'list' ? (
        <div className="admin-card">
          {/* Table header */}
          <div className="flex items-center gap-3 px-5 py-2" style={{ borderBottom: '1px solid var(--border)', background: 'var(--paper-warm)' }}>
            <div className="w-12" />
            <button onClick={() => toggleSort('title')} className="flex-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
              Title <SortIcon field="title" />
            </button>
            <div className="w-16 text-[10px] font-bold uppercase tracking-wider text-center" style={{ color: 'var(--muted)' }}>Status</div>
            <div className="w-10 text-[10px] font-bold uppercase tracking-wider text-center" style={{ color: 'var(--muted)' }}>Lang</div>
            <button onClick={() => toggleSort('views')} className="w-20 flex items-center justify-end gap-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
              Views <SortIcon field="views" />
            </button>
            <button onClick={() => toggleSort('date')} className="w-24 flex items-center justify-end gap-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
              Date <SortIcon field="date" />
            </button>
            <div className="w-28" />
          </div>

          {loading ? (
            <div className="p-10 text-center"><Loader2 size={20} className="animate-spin mx-auto" style={{ color: 'var(--muted)' }} /></div>
          ) : articles.length === 0 ? (
            <div className="p-10 text-center text-sm" style={{ color: 'var(--muted)' }}>No articles found</div>
          ) : (
            articles.map(a => {
              const sc = statusColor(a.status);
              return (
                <div key={a.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--paper-warm)] transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="w-12 h-10 shrink-0 rounded overflow-hidden" style={{ background: 'var(--paper-warm)' }}>
                    {a.cover_image ? <img src={a.cover_image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[9px] font-bold" style={{ color: 'var(--muted)' }}>FP</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--ink)' }}>{a.title}</p>
                    <p className="text-[10px] capitalize truncate" style={{ color: 'var(--muted)' }}>{a.category}</p>
                  </div>
                  <div className="w-16 text-center">
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded inline-block" style={{ background: sc.bg, color: sc.color }}>{a.status}</span>
                  </div>
                  <div className="w-10 text-center">
                    <span className="text-[10px] uppercase font-bold" style={{ color: 'var(--muted)' }}>{a.lang}</span>
                  </div>
                  <div className="w-20 text-right">
                    <span className="text-xs font-bold" style={{ color: 'var(--ink)' }}>{(a.views || 0).toLocaleString()}</span>
                  </div>
                  <div className="w-24 text-right">
                    <span className="text-[10px]" style={{ color: 'var(--muted)' }}>{a.created_at ? new Date(a.created_at).toLocaleDateString() : '—'}</span>
                  </div>
                  <div className="w-28 flex items-center justify-end gap-1 shrink-0">
                    {a.status === 'published' && (
                      <a href={`/${a.lang}/${a.slug}`} target="_blank" className="p-1.5 hover:opacity-60 rounded" title="View"><ExternalLink size={13} style={{ color: 'var(--muted)' }} /></a>
                    )}
                    <button onClick={() => setEditing(a)} className="p-1.5 hover:opacity-60 rounded" title="Edit"><Edit3 size={13} style={{ color: 'var(--ink)' }} /></button>
                    {a.status === 'published' ? (
                      <button onClick={() => updateStatus(a.id, 'archived')} className="p-1.5 hover:opacity-60 rounded" title="Archive"><Archive size={13} style={{ color: 'var(--muted)' }} /></button>
                    ) : (
                      <button onClick={() => updateStatus(a.id, 'published')} className="p-1.5 hover:opacity-60 rounded" title="Publish"><CheckCircle size={13} style={{ color: '#0F6E56' }} /></button>
                    )}
                    <button onClick={() => deleteArticle(a.id)} disabled={deleting === a.id}
                      className="p-1.5 hover:opacity-60 rounded" title="Delete">
                      {deleting === a.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} style={{ color: 'var(--accent)' }} />}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Grid view */
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            <div className="col-span-full p-10 text-center"><Loader2 size={20} className="animate-spin mx-auto" style={{ color: 'var(--muted)' }} /></div>
          ) : articles.length === 0 ? (
            <div className="col-span-full p-10 text-center text-sm" style={{ color: 'var(--muted)' }}>No articles found</div>
          ) : (
            articles.map(a => {
              const sc = statusColor(a.status);
              return (
                <div key={a.id} className="admin-card overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
                  <div className="aspect-video relative" style={{ background: 'var(--paper-warm)' }}>
                    {a.cover_image ? (
                      <img src={a.cover_image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl font-bold font-display" style={{ color: 'var(--border)' }}>FP</div>
                    )}
                    <div className="absolute top-2 left-2">
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded" style={{ background: sc.bg, color: sc.color }}>{a.status}</span>
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'rgba(0,0,0,0.5)' }}>
                      <button onClick={() => setEditing(a)} className="p-2 rounded-full" style={{ background: 'white' }}><Edit3 size={14} /></button>
                      {a.status === 'published' && (
                        <a href={`/${a.lang}/${a.slug}`} target="_blank" className="p-2 rounded-full" style={{ background: 'white' }}><ExternalLink size={14} /></a>
                      )}
                      <button onClick={() => deleteArticle(a.id)} className="p-2 rounded-full" style={{ background: 'white' }}><Trash2 size={14} style={{ color: 'var(--accent)' }} /></button>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-medium line-clamp-2" style={{ color: 'var(--ink)' }}>{a.title}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[9px] uppercase font-bold" style={{ color: 'var(--muted)' }}>{a.lang} · {a.category}</span>
                      <span className="text-[10px] font-bold" style={{ color: 'var(--ink)' }}>{(a.views || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(1)} disabled={page === 1} className="px-2 py-1 text-[10px] font-bold uppercase hover:opacity-60 disabled:opacity-30" style={{ color: 'var(--muted)' }}>First</button>
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-2 hover:opacity-60 disabled:opacity-30"><ChevronLeft size={16} /></button>
          {/* Page numbers */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const start = Math.max(1, Math.min(page - 2, totalPages - 4));
            const p = start + i;
            if (p > totalPages) return null;
            return (
              <button key={p} onClick={() => setPage(p)}
                className="w-8 h-8 text-xs font-bold rounded-md"
                style={{
                  background: p === page ? 'var(--ink)' : 'transparent',
                  color: p === page ? 'var(--paper)' : 'var(--muted)',
                }}>
                {p}
              </button>
            );
          })}
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="p-2 hover:opacity-60 disabled:opacity-30"><ChevronRight size={16} /></button>
          <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="px-2 py-1 text-[10px] font-bold uppercase hover:opacity-60 disabled:opacity-30" style={{ color: 'var(--muted)' }}>Last</button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// EDITOR TAB — Enhanced WYSIWYG
// ============================================================
function EditorTab({ onSaved }: { onSaved: () => void }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('general');
  const [lang, setLang] = useState('fr');
  const [coverUrl, setCoverUrl] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [savingDraft, setSavingDraft] = useState(false);

  function exec(cmd: string, val?: string) {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
    updateWordCount();
  }

  function updateWordCount() {
    if (editorRef.current) {
      const text = editorRef.current.innerText || '';
      setWordCount(text.trim().split(/\s+/).filter(Boolean).length);
    }
  }

  async function publish(asDraft = false) {
    if (!title || !editorRef.current?.innerHTML) return alert('Title and content required');
    if (asDraft) setSavingDraft(true); else setPublishing(true);
    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, excerpt, category, lang,
          content: editorRef.current.innerHTML,
          cover_image: coverUrl || null,
          status: asDraft ? 'draft' : 'published',
        }),
      });
      if (res.ok) {
        setPublished(true);
        setTitle(''); setExcerpt(''); setCoverUrl('');
        if (editorRef.current) editorRef.current.innerHTML = '';
        setWordCount(0);
        setTimeout(() => { setPublished(false); onSaved(); }, 1500);
      }
    } catch { }
    setPublishing(false);
    setSavingDraft(false);
  }

  const tools = [
    { icon: Bold, cmd: 'bold', label: 'Bold' },
    { icon: Italic, cmd: 'italic', label: 'Italic' },
    { icon: Heading, cmd: 'formatBlock', val: 'h2', label: 'Heading' },
    { icon: Quote, cmd: 'formatBlock', val: 'blockquote', label: 'Quote' },
    { icon: List, cmd: 'insertUnorderedList', label: 'List' },
    { icon: Link2, cmd: 'createLink', label: 'Link' },
  ];

  return (
    <div className="max-w-3xl anim-up">
      {/* Meta info bar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {[
          { label: `${wordCount} words`, icon: Hash },
          { label: `~${Math.ceil(wordCount / 200)} min read`, icon: Clock },
          { label: lang.toUpperCase(), icon: Globe },
        ].map(m => (
          <div key={m.label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md" style={{ background: 'var(--paper-warm)' }}>
            <m.icon size={11} style={{ color: 'var(--muted)' }} />
            <span className="text-[10px] font-bold" style={{ color: 'var(--muted)' }}>{m.label}</span>
          </div>
        ))}
      </div>

      <div className="space-y-4 mb-6">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Article title..."
          className="w-full font-display text-3xl outline-none py-2" style={{ background: 'transparent', color: 'var(--ink)', borderBottom: '2px solid var(--border)' }} />
        <input value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="Short excerpt..."
          className="w-full text-sm outline-none py-2" style={{ background: 'transparent', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }} />
        <div className="flex gap-3">
          <select value={category} onChange={e => setCategory(e.target.value)} className="flex-1 text-xs px-3 py-2 outline-none" style={{ background: 'var(--paper-warm)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--ink)' }}>
            {['general', 'transfers', 'leagues', 'analysis', 'champions-league', 'premier-league', 'la-liga', 'serie-a', 'bundesliga'].map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={lang} onChange={e => setLang(e.target.value)} className="flex-1 text-xs px-3 py-2 outline-none" style={{ background: 'var(--paper-warm)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--ink)' }}>
            {['fr', 'en', 'ar', 'es'].map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[0.12em] mb-1" style={{ color: 'var(--muted)' }}><Image size={12} className="inline mr-1" />Cover image URL</label>
          <input value={coverUrl} onChange={e => setCoverUrl(e.target.value)} placeholder="https://..."
            className="w-full px-3 py-2 text-sm outline-none" style={{ background: 'var(--paper-warm)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--ink)' }} />
          {coverUrl && <img src={coverUrl} alt="" className="mt-2 h-32 object-cover rounded" onError={e => (e.currentTarget.style.display = 'none')} />}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2" style={{ background: 'var(--paper-warm)', borderRadius: '8px 8px 0 0', border: '1px solid var(--border)', borderBottom: 'none' }}>
        {tools.map(t => (
          <button key={t.cmd + (t.val || '')} title={t.label}
            onClick={() => t.cmd === 'createLink' ? (() => { const u = prompt('URL:'); if (u) exec(t.cmd, u); })() : exec(t.cmd, t.val)}
            className="p-2 rounded hover:bg-[var(--border)] transition-colors">
            <t.icon size={15} style={{ color: 'var(--ink)' }} />
          </button>
        ))}
        <div className="h-5 w-px mx-1" style={{ background: 'var(--border)' }} />
        <button onClick={() => exec('removeFormat')} className="p-2 rounded hover:bg-[var(--border)] transition-colors" title="Clear format">
          <X size={15} style={{ color: 'var(--muted)' }} />
        </button>
      </div>

      {/* Editor */}
      <div ref={editorRef} contentEditable className="wysiwyg" suppressContentEditableWarning
        onInput={updateWordCount}
        style={{ minHeight: '300px' }} />

      {/* Actions */}
      <div className="flex items-center gap-3 mt-4">
        <button onClick={() => publish(false)} disabled={publishing || published}
          className="flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-50"
          style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: '6px' }}>
          {publishing ? <Loader2 size={16} className="animate-spin" /> : published ? <Check size={16} /> : <Send size={16} />}
          {published ? 'Published!' : 'Publish article'}
        </button>
        <button onClick={() => publish(true)} disabled={savingDraft}
          className="flex items-center gap-2 px-5 py-3 text-sm font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-50"
          style={{ background: 'var(--paper-warm)', color: 'var(--ink)', borderRadius: '6px', border: '1px solid var(--border)' }}>
          {savingDraft ? <Loader2 size={16} className="animate-spin" /> : <Archive size={16} />}
          Save as draft
        </button>
      </div>
    </div>
  );
}

// ============================================================
// SOCIAL TAB — Enhanced
// ============================================================
function SocialTab({ articles }: { articles: any[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [posting, setPosting] = useState<Record<string, boolean>>({});
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [history, setHistory] = useState<any[]>([]);

  async function postTo(platform: string) {
    if (!selected) return;
    setPosting(p => ({ ...p, [platform]: true }));
    try {
      await fetch('/api/social', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ articleId: selected, platforms: [platform] }) });
      setDone(d => ({ ...d, [platform]: true }));
      setHistory(h => [{ platform, articleId: selected, time: new Date().toLocaleTimeString(), status: 'success' }, ...h]);
      setTimeout(() => setDone(d => ({ ...d, [platform]: false })), 3000);
    } catch {
      setHistory(h => [{ platform, articleId: selected, time: new Date().toLocaleTimeString(), status: 'failed' }, ...h]);
    }
    setPosting(p => ({ ...p, [platform]: false }));
  }

  const platforms = [
    { key: 'twitter', label: 'X / Twitter', icon: Twitter, color: '#1DA1F2' },
    { key: 'facebook', label: 'Facebook', icon: Facebook, color: '#1877F2' },
    { key: 'instagram', label: 'Instagram', icon: Instagram, color: '#E4405F' },
  ];

  const selectedArticle = articles.find(a => a.id === selected);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          {/* Article selector */}
          <div className="admin-card">
            <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--muted)' }}>Select article to share</h3>
            </div>
            {articles.slice(0, 10).map((a: any) => (
              <button key={a.id} onClick={() => setSelected(a.id)} className="w-full text-left flex items-center gap-4 px-6 py-3 transition-colors"
                style={{ borderBottom: '1px solid var(--border)', background: a.id === selected ? 'var(--paper-warm)' : 'transparent' }}>
                <div className="w-10 h-10 rounded overflow-hidden shrink-0" style={{ background: 'var(--paper-warm)' }}>
                  {a.cover_image ? <img src={a.cover_image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[9px] font-bold" style={{ color: 'var(--muted)' }}>FP</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate" style={{ color: 'var(--ink)', fontWeight: a.id === selected ? 700 : 400 }}>{a.title}</p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{a.lang} · {a.category} · {(a.views || 0).toLocaleString()} views</p>
                </div>
                <div className="w-3 h-3 rounded-full shrink-0 transition-colors" style={{ background: a.id === selected ? 'var(--accent)' : 'var(--border)' }} />
              </button>
            ))}
          </div>

          {/* Post history */}
          {history.length > 0 && (
            <div className="admin-card">
              <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--muted)' }}>Recent posts</h3>
              </div>
              {history.slice(0, 10).map((h, i) => {
                const plat = platforms.find(p => p.key === h.platform);
                return (
                  <div key={i} className="flex items-center gap-3 px-6 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
                    {plat && <plat.icon size={14} style={{ color: plat.color }} />}
                    <span className="text-xs flex-1" style={{ color: 'var(--ink)' }}>{plat?.label}</span>
                    <span className="text-[10px]" style={{ color: 'var(--muted)' }}>{h.time}</span>
                    {h.status === 'success' ? <CheckCircle size={12} style={{ color: '#0F6E56' }} /> : <XCircle size={12} style={{ color: '#C43D3D' }} />}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Publish panel */}
        <div className="space-y-4 sticky top-20 self-start">
          {/* Preview card */}
          {selectedArticle && (
            <div className="admin-card overflow-hidden">
              <div className="aspect-video" style={{ background: 'var(--paper-warm)' }}>
                {selectedArticle.cover_image ? (
                  <img src={selectedArticle.cover_image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-display text-3xl" style={{ color: 'var(--border)' }}>FP</div>
                )}
              </div>
              <div className="p-4">
                <p className="text-sm font-bold line-clamp-2" style={{ color: 'var(--ink)' }}>{selectedArticle.title}</p>
                {selectedArticle.excerpt && <p className="text-[11px] mt-1 line-clamp-2" style={{ color: 'var(--muted)' }}>{selectedArticle.excerpt}</p>}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--paper-warm)', color: 'var(--muted)' }}>{selectedArticle.lang}</span>
                  <span className="text-[9px] capitalize" style={{ color: 'var(--muted)' }}>{selectedArticle.category}</span>
                </div>
              </div>
            </div>
          )}

          {/* Publish buttons */}
          <div className="admin-card p-5">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] mb-4" style={{ color: 'var(--muted)' }}>Publish to</h3>
            {!selected ? <p className="text-sm" style={{ color: 'var(--muted)' }}>Select an article first</p> : (
              <div className="space-y-2.5">
                {platforms.map(p => (
                  <button key={p.key} onClick={() => postTo(p.key)} disabled={posting[p.key]}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:opacity-80 disabled:opacity-50 transition-all"
                    style={{ border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--ink)' }}>
                    <span className="flex items-center gap-2.5"><p.icon size={16} style={{ color: p.color }} /> {p.label}</span>
                    {posting[p.key] ? <Loader2 size={14} className="animate-spin" /> : done[p.key] ? <Check size={14} style={{ color: '#0F6E56' }} /> : <Send size={14} style={{ color: 'var(--muted)' }} />}
                  </button>
                ))}
                <button onClick={() => platforms.forEach(p => postTo(p.key))}
                  className="w-full py-3 text-sm font-bold uppercase tracking-wider hover:opacity-90 flex items-center justify-center gap-2"
                  style={{ background: 'var(--accent)', color: 'white', borderRadius: '8px' }}>
                  <Share2 size={14} /> Publish everywhere
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CRON TAB — Enhanced
// ============================================================
function CronTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [running, setRunning] = useState(false);
  const [liveLog, setLiveLog] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchLogs(); }, []);

  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [liveLog]);

  async function fetchLogs() {
    setLoading(true);
    try {
      const res = await fetch('/api/stats?period=30d');
      const data = await res.json();
      setLogs(data.cronLogs || []);
    } catch { }
    setLoading(false);
  }

  async function runCron() {
    setRunning(true);
    setResult(null);
    setLiveLog(['[INIT] Starting AI cron job...', '[FETCH] Fetching trending football news...']);

    try {
      const adminPwd = sessionStorage.getItem('fp_admin_pwd') || '';
      const interval = setInterval(() => {
        setLiveLog(prev => {
          const messages = [
            '[AI] Connecting to Groq AI...',
            '[AI] Generating article in 4 languages...',
            '[PROC] Processing news item...',
            '[DB] Saving to database...',
            '[CHECK] Checking for duplicates...',
            '[TRANS] Translating content...',
            '[SEO] Building SEO metadata...',
            '[IMG] Fetching cover images...',
            '[VALID] Validating content quality...',
            '[INDEX] Updating search index...',
          ];
          const next = messages[Math.floor(Math.random() * messages.length)];
          if (prev.length < 20 && !prev.includes(next)) return [...prev, next];
          return prev;
        });
      }, 2500);

      const res = await fetch('/api/cron', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPassword: adminPwd }),
      });

      clearInterval(interval);
      const data = await res.json();
      setResult(data);
      setLiveLog(prev => [
        ...prev,
        `[DONE] ✓ ${data.articlesCreated || 0} articles created successfully.`,
        ...(data.errors || []).map((e: string) => `[ERROR] ✗ ${e}`),
      ]);
      fetchLogs();
    } catch (e: any) {
      setLiveLog(prev => [...prev, `[FATAL] ✗ ${e.message}`]);
      setResult({ error: e.message });
    }
    setRunning(false);
  }

  const statusStyle = (s: string) => {
    if (s === 'success') return { bg: '#E1F5EE', color: '#085041', icon: CheckCircle };
    if (s === 'failed') return { bg: '#FCEBEB', color: '#791F1F', icon: XCircle };
    if (s === 'partial') return { bg: '#FAEEDA', color: '#633806', icon: AlertCircle };
    return { bg: 'var(--paper-warm)', color: 'var(--muted)', icon: Clock };
  };

  // Stats from logs
  const totalArticlesGenerated = logs.reduce((s, l) => s + (l.articles_created || 0), 0);
  const totalErrors = logs.reduce((s, l) => s + (l.details?.errors?.length || 0), 0);
  const avgDuration = logs.length > 0 ? Math.round(logs.reduce((s, l) => {
    if (l.finished_at && l.started_at) return s + (new Date(l.finished_at).getTime() - new Date(l.started_at).getTime()) / 1000;
    return s;
  }, 0) / logs.length) : 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total runs', value: logs.length, icon: Activity, color: '#185FA5' },
          { label: 'Articles generated', value: totalArticlesGenerated, icon: FileText, color: '#0F6E56' },
          { label: 'Total errors', value: totalErrors, icon: AlertCircle, color: '#C43D3D' },
          { label: 'Avg duration', value: `${avgDuration}s`, icon: Clock, color: '#BA7517' },
        ].map(s => (
          <div key={s.label} className="admin-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon size={13} style={{ color: s.color }} />
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{s.label}</span>
            </div>
            <div className="text-xl font-bold font-display" style={{ color: 'var(--ink)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Run panel */}
      <div className="admin-card overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>AI Article Generator</h3>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>Groq + Gemini fallback · 10 articles per run · 4 languages</p>
          </div>
          <button onClick={runCron} disabled={running}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-50"
            style={{ background: running ? 'var(--muted)' : 'var(--accent)', color: 'white', borderRadius: '6px' }}>
            {running ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
            {running ? 'Running...' : 'Run AI now'}
          </button>
        </div>

        {(running || liveLog.length > 0) && (
          <div ref={terminalRef} className="px-6 py-4" style={{ background: '#0a0a0a', maxHeight: '350px', overflowY: 'auto' }}>
            {liveLog.map((line, i) => {
              const isError = line.includes('ERROR') || line.includes('FATAL');
              const isDone = line.includes('DONE');
              const tag = line.match(/$$([A-Z]+)$$/)?.[1] || '';
              const message = line.replace(/$$[A-Z]+$$\s*/, '');
              return (
                <div key={i} className="flex items-start gap-2 py-0.5" style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '12px' }}>
                  <span className="shrink-0" style={{
                    color: isError ? '#ef4444' : isDone ? '#22c55e' : '#3b82f6',
                    minWidth: '50px',
                  }}>
                    [{tag}]
                  </span>
                  <span style={{ color: isError ? '#fca5a5' : isDone ? '#86efac' : '#d1d5db' }}>{message}</span>
                </div>
              );
            })}
            {running && (
              <div className="flex items-center gap-2 py-1 mt-2">
                <div className="w-2 h-2 rounded-full" style={{ background: '#22c55e', animation: 'pulseDot 1s ease infinite' }} />
                <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '11px', color: '#6b7280' }}>Processing...</span>
              </div>
            )}
          </div>
        )}

        {result && !running && (
          <div className="px-6 py-4 flex items-center gap-8" style={{ borderTop: '1px solid var(--border)' }}>
            <div>
              <div className="text-2xl font-bold font-display" style={{ color: result.articlesCreated > 0 ? '#0F6E56' : 'var(--accent)' }}>{result.articlesCreated || 0}</div>
              <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Articles created</div>
            </div>
            {result.errors?.length > 0 && (
              <div>
                <div className="text-2xl font-bold font-display" style={{ color: 'var(--accent)' }}>{result.errors.length}</div>
                <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Errors</div>
              </div>
            )}
            <div className="flex-1" />
            <button onClick={() => { setLiveLog([]); setResult(null); }} className="text-[10px] uppercase font-bold hover:opacity-60" style={{ color: 'var(--muted)' }}>Clear</button>
          </div>
        )}
      </div>

      {/* Cron history */}
      <div className="admin-card">
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--muted)' }}>Run history</h3>
          <span className="text-[10px]" style={{ color: 'var(--muted)' }}>{logs.length} runs</span>
        </div>
        {loading ? (
          <div className="p-10 text-center"><Loader2 size={20} className="animate-spin mx-auto" /></div>
        ) : logs.length === 0 ? (
          <div className="p-10 text-center text-sm" style={{ color: 'var(--muted)' }}>No cron runs yet</div>
        ) : (
          logs.map((log: any) => {
            const s = statusStyle(log.status);
            const Icon = s.icon;
            const duration = log.finished_at ? Math.round((new Date(log.finished_at).getTime() - new Date(log.started_at).getTime()) / 1000) : null;
            return (
              <div key={log.id} className="flex items-center gap-4 px-6 py-3 hover:bg-[var(--paper-warm)] transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="w-9 h-9 flex items-center justify-center rounded-lg" style={{ background: s.bg }}>
                  <Icon size={15} style={{ color: s.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{log.articles_created} articles</span>
                    {log.details?.errors?.length > 0 && (
                      <span className="text-[10px] font-bold" style={{ color: 'var(--accent)' }}>{log.details.errors.length} errors</span>
                    )}
                  </div>
                  <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                    {new Date(log.started_at).toLocaleString()}
                    {duration !== null && ` · ${duration}s`}
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-1 rounded" style={{ background: s.bg, color: s.color }}>{log.status}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ============================================================
// TEAMS TAB — Enhanced
// ============================================================
function TeamsTab() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState<string[]>([]);
  const [searchTeam, setSearchTeam] = useState('');
  const [filterCountry, setFilterCountry] = useState('all');
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchTeams(); }, []);

  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [progress]);

  async function fetchTeams() {
    setLoading(true);
    try {
      const res = await fetch('/api/teams');
      const data = await res.json();
      setTeams(data.teams || []);
    } catch { }
    setLoading(false);
  }

  async function generateBatch(offset = 0) {
    setGenerating(true);
    setProgress(prev => [...prev, `[GEN] Starting batch at offset ${offset}...`]);

    try {
      const adminPwd = sessionStorage.getItem('fp_admin_pwd') || '';
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPassword: adminPwd, batchSize: 5, offset }),
      });
      const data = await res.json();
      setProgress(prev => [...prev, `[OK] Created ${data.created} teams. ${data.remaining > 0 ? `${data.remaining} remaining...` : 'All done!'}`]);

      if (data.errors?.length) {
        data.errors.forEach((e: string) => setProgress(prev => [...prev, `[ERROR] ${e}`]));
      }

      fetchTeams();

      if (data.remaining > 0) {
        setProgress(prev => [...prev, '[WAIT] Waiting 10s before next batch...']);
        setTimeout(() => generateBatch(data.nextOffset), 10000);
      } else {
        setProgress(prev => [...prev, '[DONE] ✓ All teams generated successfully!']);
        setGenerating(false);
      }
    } catch (e: any) {
      setProgress(prev => [...prev, `[FATAL] ✗ ${e.message}`]);
      setGenerating(false);
    }
  }

  // Get unique countries
  const countries = useMemo(() => {
    const set = new Set(teams.map(t => t.country).filter(Boolean));
    return ['all', ...Array.from(set).sort()];
  }, [teams]);

  // Filtered teams
  const filteredTeams = useMemo(() => {
    return teams.filter(t => {
      if (searchTeam && !t.name.toLowerCase().includes(searchTeam.toLowerCase())) return false;
      if (filterCountry !== 'all' && t.country !== filterCountry) return false;
      return true;
    });
  }, [teams, searchTeam, filterCountry]);

  // Country stats
  const countryStats = useMemo(() => {
    const map: Record<string, number> = {};
    teams.forEach(t => { if (t.country) map[t.country] = (map[t.country] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [teams]);

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total teams', value: teams.length, icon: Globe, color: '#185FA5' },
          { label: 'Countries', value: countryStats.length, icon: MapPin, color: '#0F6E56' },
          { label: 'With logos', value: teams.filter(t => t.logo).length, icon: Image, color: '#BA7517' },
          { label: 'Languages', value: '4', icon: Layers, color: '#534AB7' },
        ].map(s => (
          <div key={s.label} className="admin-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon size={13} style={{ color: s.color }} />
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{s.label}</span>
            </div>
            <div className="text-xl font-bold font-display" style={{ color: 'var(--ink)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Generate button */}
      <div className="admin-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>Team Profile Generator</h3>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>
              Gemini AI generates team bios in 4 languages (FR, EN, AR, ES). {teams.length} teams in database.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {progress.length > 0 && !generating && (
              <button onClick={() => setProgress([])} className="text-[10px] uppercase font-bold px-3 py-2 rounded hover:opacity-60"
                style={{ color: 'var(--muted)', background: 'var(--paper-warm)' }}>Clear log</button>
            )}
            <button onClick={() => generateBatch(0)} disabled={generating}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-50"
              style={{ background: generating ? 'var(--muted)' : 'var(--accent)', color: 'white', borderRadius: '6px' }}>
              {generating ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
              {generating ? 'Generating...' : teams.length > 0 ? 'Generate more' : 'Generate all teams'}
            </button>
          </div>
        </div>
      </div>

      {/* Terminal */}
      {progress.length > 0 && (
        <div className="admin-card overflow-hidden">
          <div ref={terminalRef} className="px-6 py-4" style={{ background: '#0a0a0a', maxHeight: '250px', overflowY: 'auto' }}>
            {progress.map((line, i) => {
              const isError = line.includes('ERROR') || line.includes('FATAL');
              const isDone = line.includes('DONE') || line.includes('Created');
              const tag = line.match(/$$([A-Z]+)$$/)?.[1] || '';
              const message = line.replace(/$$[A-Z]+$$\s*/, '');
              return (
                <div key={i} className="flex items-start gap-2 py-0.5" style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '12px' }}>
                  <span className="shrink-0" style={{
                    color: isError ? '#ef4444' : isDone ? '#22c55e' : '#3b82f6',
                    minWidth: '50px',
                  }}>
                    [{tag}]
                  </span>
                  <span style={{ color: isError ? '#fca5a5' : isDone ? '#86efac' : '#d1d5db' }}>{message}</span>
                </div>
              );
            })}
            {generating && (
              <div className="flex items-center gap-2 py-1 mt-1">
                <div className="w-2 h-2 rounded-full" style={{ background: '#22c55e', animation: 'pulseDot 1s ease infinite' }} />
                <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '11px', color: '#6b7280' }}>Processing...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters + Country distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        <div className="space-y-4">
          {/* Search and filter */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1 px-3 py-2" style={{ background: 'var(--paper-warm)', borderRadius: '6px', border: '1px solid var(--border)' }}>
              <Search size={14} style={{ color: 'var(--muted)' }} />
              <input value={searchTeam} onChange={e => setSearchTeam(e.target.value)} placeholder="Search teams..."
                className="flex-1 text-sm outline-none bg-transparent" style={{ color: 'var(--ink)' }} />
              {searchTeam && <button onClick={() => setSearchTeam('')}><X size={14} style={{ color: 'var(--muted)' }} /></button>}
            </div>
            <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)}
              className="text-xs px-3 py-2 outline-none" style={{ background: 'var(--paper-warm)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--ink)' }}>
              {countries.map(c => <option key={c} value={c}>{c === 'all' ? 'All countries' : c}</option>)}
            </select>
            <span className="text-[10px] font-bold" style={{ color: 'var(--muted)' }}>{filteredTeams.length} teams</span>
          </div>

          {/* Teams grid */}
          <div className="admin-card">
            <div className="px-6 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--muted)' }}>
                Teams ({filteredTeams.length})
              </h3>
            </div>
            {loading ? (
              <div className="p-10 text-center"><Loader2 size={20} className="animate-spin mx-auto" /></div>
            ) : filteredTeams.length === 0 ? (
              <p className="p-10 text-center text-sm" style={{ color: 'var(--muted)' }}>
                {teams.length === 0 ? 'No teams yet. Click "Generate all teams" to start.' : 'No teams match your filters.'}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2">
                {filteredTeams.map((team: any) => (
                  <a key={team.id} href={`/fr/team/${team.slug}`} target="_blank"
                    className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--paper-warm)] transition-colors group"
                    style={{ borderBottom: '1px solid var(--border)' }}>
                    {team.logo ? (
                      <img src={team.logo} alt="" className="w-9 h-9 object-contain shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0"
                        style={{ background: 'var(--paper-warm)', color: 'var(--muted)' }}>
                        {team.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:underline" style={{ color: 'var(--ink)' }}>{team.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {team.country && <span className="text-[10px]" style={{ color: 'var(--muted)' }}>{getFlagEmoji(getCountryCode(team.country))} {team.country}</span>}
                        {team.founded && <span className="text-[10px]" style={{ color: 'var(--muted)' }}>· Est. {team.founded}</span>}
                      </div>
                    </div>
                    <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--muted)' }} />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Country distribution sidebar */}
        <div className="space-y-4 self-start sticky top-20">
          <div className="admin-card">
            <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--muted)' }}>By country</h3>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {countryStats.length === 0 ? (
                <p className="p-5 text-center text-[11px]" style={{ color: 'var(--muted)' }}>No data yet</p>
              ) : (
                countryStats.map(([country, count]) => {
                  const maxCount = countryStats[0]?.[1] || 1;
                  const pct = Math.round((count / (maxCount as number)) * 100);
                  return (
                    <button key={country} onClick={() => setFilterCountry(filterCountry === country ? 'all' : country)}
                      className="w-full flex items-center gap-3 px-5 py-2 hover:bg-[var(--paper-warm)] transition-colors"
                      style={{
                        borderBottom: '1px solid var(--border)',
                        background: filterCountry === country ? 'var(--paper-warm)' : 'transparent',
                      }}>
                      <span className="text-sm">{getFlagEmoji(getCountryCode(country))}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="font-bold truncate" style={{ color: 'var(--ink)' }}>{country}</span>
                          <span style={{ color: 'var(--muted)' }}>{count}</span>
                        </div>
                        <div className="h-1 rounded-full" style={{ background: 'var(--border)' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: '#185FA5' }} />
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div className="admin-card p-5">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] mb-3" style={{ color: 'var(--muted)' }}>Coverage</h3>
            <div className="space-y-3">
              {[
                { label: 'Top 5 leagues', value: teams.filter(t => ['France', 'England', 'Spain', 'Germany', 'Italy'].includes(t.country)).length, total: teams.length },
                { label: 'With bios (FR)', value: teams.filter(t => t.bio_fr).length, total: teams.length },
                { label: 'With bios (EN)', value: teams.filter(t => t.bio_en).length, total: teams.length },
                { label: 'With bios (AR)', value: teams.filter(t => t.bio_ar).length, total: teams.length },
              ].map(s => {
                const pct = s.total > 0 ? Math.round((s.value / s.total) * 100) : 0;
                return (
                  <div key={s.label}>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span style={{ color: 'var(--ink)' }}>{s.label}</span>
                      <span className="font-bold" style={{ color: 'var(--muted)' }}>{s.value}/{s.total} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct === 100 ? '#0F6E56' : '#185FA5' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// HELPER: Country name → code (basic mapping)
// ============================================================
function getCountryCode(country: string): string {
  const map: Record<string, string> = {
    'France': 'FR', 'England': 'GB', 'Spain': 'ES', 'Germany': 'DE',
    'Italy': 'IT', 'Portugal': 'PT', 'Netherlands': 'NL', 'Belgium': 'BE',
    'Turkey': 'TR', 'Scotland': 'GB', 'Austria': 'AT', 'Switzerland': 'CH',
    'Greece': 'GR', 'Croatia': 'HR', 'Serbia': 'RS', 'Ukraine': 'UA',
    'Russia': 'RU', 'Czech Republic': 'CZ', 'Poland': 'PL', 'Denmark': 'DK',
    'Sweden': 'SE', 'Norway': 'NO', 'Romania': 'RO', 'Hungary': 'HU',
    'Morocco': 'MA', 'Algeria': 'DZ', 'Tunisia': 'TN', 'Egypt': 'EG',
    'Saudi Arabia': 'SA', 'Qatar': 'QA', 'UAE': 'AE', 'Japan': 'JP',
    'South Korea': 'KR', 'China': 'CN', 'Australia': 'AU',
    'Brazil': 'BR', 'Argentina': 'AR', 'Mexico': 'MX', 'USA': 'US',
    'Colombia': 'CO', 'Chile': 'CL', 'Uruguay': 'UY', 'Paraguay': 'PY',
    'Nigeria': 'NG', 'South Africa': 'ZA', 'Cameroon': 'CM',
    'Senegal': 'SN', 'Ghana': 'GH', 'Ivory Coast': 'CI',
    'Wales': 'GB', 'Ireland': 'IE', 'Northern Ireland': 'GB',
    'Finland': 'FI', 'Iceland': 'IS', 'Israel': 'IL',
    'Cyprus': 'CY', 'Bulgaria': 'BG', 'Slovakia': 'SK', 'Slovenia': 'SI',
    'Bosnia': 'BA', 'Montenegro': 'ME', 'Albania': 'AL', 'North Macedonia': 'MK',
    'Luxembourg': 'LU', 'Malta': 'MT', 'Estonia': 'EE', 'Latvia': 'LV', 'Lithuania': 'LT',
    'Georgia': 'GE', 'Armenia': 'AM', 'Azerbaijan': 'AZ', 'Kazakhstan': 'KZ',
    'India': 'IN', 'Indonesia': 'ID', 'Thailand': 'TH', 'Vietnam': 'VN',
    'Peru': 'PE', 'Ecuador': 'EC', 'Venezuela': 'VE', 'Bolivia': 'BO',
    'Canada': 'CA', 'Jamaica': 'JM', 'Costa Rica': 'CR', 'Honduras': 'HN',
    'Panama': 'PA', 'El Salvador': 'SV', 'Guatemala': 'GT',
    'Iran': 'IR', 'Iraq': 'IQ', 'Uzbekistan': 'UZ',
  };
  return map[country] || 'UN';
}
function PlayersTab() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState<string[]>([]);

  useEffect(() => { fetchPlayers(); }, []);

  async function fetchPlayers() {
    setLoading(true);
    try {
      const res = await fetch('/api/players');
      const data = await res.json();
      setPlayers(data.players || []);
    } catch {}
    setLoading(false);
  }

  async function generateBatch(offset = 0) {
    setGenerating(true);
    setProgress(prev => [...prev, `Starting batch at offset ${offset}...`]);

    try {
      const adminPwd = sessionStorage.getItem('fp_admin_pwd') || '';
      const res = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPassword: adminPwd, batchSize: 5, offset }),
      });
      const data = await res.json();
      setProgress(prev => [...prev, `Created ${data.created} players. ${data.remaining > 0 ? `${data.remaining} remaining...` : 'All done!'}`]);

      if (data.errors?.length) {
        data.errors.forEach((e: string) => setProgress(prev => [...prev, `Error: ${e}`]));
      }

      fetchPlayers();

      if (data.remaining > 0) {
        setProgress(prev => [...prev, 'Waiting 10s before next batch...']);
        setTimeout(() => generateBatch(data.nextOffset), 10000);
      } else {
        setProgress(prev => [...prev, 'All players generated!']);
        setGenerating(false);
      }
    } catch (e: any) {
      setProgress(prev => [...prev, `Fatal error: ${e.message}`]);
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>Player profiles</h3>
          <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>
            Photos from API-Football + AI bios in 4 languages. {players.length} players in database.
          </p>
        </div>
        <button onClick={() => generateBatch(0)} disabled={generating}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-50"
          style={{ background: generating ? 'var(--muted)' : 'var(--accent)', color: 'white', borderRadius: '6px' }}>
          {generating ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
          {generating ? 'Generating...' : players.length > 0 ? 'Generate more' : 'Generate all players'}
        </button>
      </div>

      {progress.length > 0 && (
        <div className="admin-card overflow-hidden">
          <div className="px-6 py-4" style={{ background: '#0a0a0a', maxHeight: '250px', overflowY: 'auto' }}>
            {progress.map((line, i) => (
              <div key={i} className="py-0.5" style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                <span style={{ color: line.includes('Error') ? '#fca5a5' : line.includes('done') || line.includes('Created') ? '#86efac' : '#d1d5db' }}>
                  {line.includes('Error') ? '✗ ' : line.includes('done') || line.includes('Created') ? '✓ ' : '› '}{line}
                </span>
              </div>
            ))}
            {generating && (
              <div className="flex items-center gap-2 py-1 mt-1">
                <div className="w-2 h-2 rounded-full" style={{ background: '#22c55e', animation: 'pulseDot 1s ease infinite' }} />
                <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6b7280' }}>Processing...</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="admin-card">
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--muted)' }}>
            Generated players ({players.length})
          </h3>
        </div>
        {loading ? (
          <div className="p-10 text-center"><Loader2 size={20} className="animate-spin mx-auto" /></div>
        ) : players.length === 0 ? (
          <p className="p-10 text-center text-sm" style={{ color: 'var(--muted)' }}>
            No players yet. Click "Generate all players" to start.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2">
            {players.map((p: any) => (
              <a key={p.id} href={`/fr/player/${p.slug}`} target="_blank"
                className="flex items-center gap-3 px-6 py-3 hover:bg-[var(--paper-warm)] transition-colors"
                style={{ borderBottom: '1px solid var(--border)' }}>
                {p.photo ? (
                  <img src={p.photo} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--paper-warm)', color: 'var(--muted)' }}>
                    {p.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--ink)' }}>{p.name}</p>
                  <p className="text-[10px] flex items-center gap-1" style={{ color: 'var(--muted)' }}>
                    {p.team_logo && <img src={p.team_logo} alt="" className="w-3 h-3" />}
                    {p.team_name || 'Unknown'} · {p.position || '?'} · {p.nationality || '?'}
                  </p>
                </div>
                <ExternalLink size={12} style={{ color: 'var(--muted)' }} />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
function PronosTab() {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState<string[]>([]);

  useEffect(() => { fetchPredictions(); }, []);

  async function fetchPredictions() {
    setLoading(true);
    try {
      const res = await fetch('/api/predictions?lang=fr&status=all&limit=20');
      const data = await res.json();
      setPredictions(data.predictions || []);
    } catch {}
    setLoading(false);
  }

  async function generate() {
    setGenerating(true);
    setProgress(['Fetching today\'s top matches...']);
    try {
      const adminPwd = sessionStorage.getItem('fp_admin_pwd') || '';
      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPassword: adminPwd, count: 5 }),
      });
      const data = await res.json();
      setProgress(prev => [...prev, `Created ${data.created} predictions (4 langs each)`]);
      if (data.errors?.length) {
        data.errors.forEach((e: string) => setProgress(prev => [...prev, `Error: ${e}`]));
      }
      setProgress(prev => [...prev, 'Done!']);
      fetchPredictions();
    } catch (e: any) {
      setProgress(prev => [...prev, `Fatal: ${e.message}`]);
    }
    setGenerating(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>Daily predictions</h3>
          <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>
            AI analyzes today's top matches and generates predictions with stats. {predictions.length} pronos in database.
          </p>
        </div>
        <button onClick={generate} disabled={generating}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-50"
          style={{ background: generating ? 'var(--muted)' : 'var(--accent)', color: 'white', borderRadius: '6px' }}>
          {generating ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
          {generating ? 'Generating...' : 'Generate today\'s pronos'}
        </button>
      </div>

      {progress.length > 0 && (
        <div className="admin-card overflow-hidden">
          <div className="px-6 py-4" style={{ background: '#0a0a0a', maxHeight: '200px', overflowY: 'auto' }}>
            {progress.map((line, i) => (
              <div key={i} className="py-0.5" style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                <span style={{ color: line.includes('Error') || line.includes('Fatal') ? '#fca5a5' : line.includes('Done') || line.includes('Created') ? '#86efac' : '#d1d5db' }}>
                  {line.includes('Error') ? '✗ ' : line.includes('Done') || line.includes('Created') ? '✓ ' : '› '}{line}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="admin-card">
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--muted)' }}>Predictions ({predictions.length})</h3>
        </div>
        {loading ? (
          <div className="p-10 text-center"><Loader2 size={20} className="animate-spin mx-auto" /></div>
        ) : predictions.length === 0 ? (
          <p className="p-10 text-center text-sm" style={{ color: 'var(--muted)' }}>No predictions yet. Click "Generate today's pronos" to start.</p>
        ) : (
          predictions.map((p: any) => (
            <a key={p.id} href={`/fr/prono/${p.slug}`} target="_blank"
              className="flex items-center gap-4 px-6 py-3 hover:bg-[var(--paper-warm)] transition-colors"
              style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="text-[10px] w-16 shrink-0" style={{ color: 'var(--muted)' }}>
                {new Date(p.match_date).toLocaleDateString([], { day: 'numeric', month: 'short' })}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--ink)' }}>{p.home_team} vs {p.away_team}</p>
                <p className="text-[10px]" style={{ color: 'var(--muted)' }}>{p.league_name}</p>
              </div>
              <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>{p.prediction}</span>
              <span className="text-[10px] font-bold" style={{ color: p.confidence >= 75 ? 'var(--green)' : 'var(--amber)' }}>{p.confidence}%</span>
              <ExternalLink size={12} style={{ color: 'var(--muted)' }} />
            </a>
          ))
        )}
      </div>
    </div>
  );
}