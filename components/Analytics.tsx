// components/Analytics.tsx
'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// ❌ On supprime useSearchParams — c'est lui qui cause souvent des crashes silencieux

function generateSessionId() {
  return 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function getDeviceType(): string {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'tablet';
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated/.test(ua)) return 'mobile';
  return 'desktop';
}

function getBrowser(): string {
  if (typeof window === 'undefined') return 'Unknown';
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('SamsungBrowser')) return 'Samsung';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  return 'Other';
}

function getOS(): string {
  if (typeof window === 'undefined') return 'Unknown';
  const ua = navigator.userAgent;
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac OS')) return 'macOS';
  if (ua.includes('Linux') && !ua.includes('Android')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
  return 'Other';
}

export default function Analytics() {
  const pathname = usePathname();
  const lastPathRef = useRef('');
  const sessionIdRef = useRef('');
  const mountedRef = useRef(false);

  // Init session — une seule fois
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    try {
      let sid = sessionStorage.getItem('fp_sid');
      if (!sid) {
        sid = generateSessionId();
        sessionStorage.setItem('fp_sid', sid);
      }
      sessionIdRef.current = sid;
    } catch {
      sessionIdRef.current = generateSessionId();
    }

    // Log pour debug — à retirer plus tard
    console.log('[FP] Analytics init, session:', sessionIdRef.current);
  }, []);

  // Track page views
  useEffect(() => {
    if (!pathname) return;

    // Petit délai pour s'assurer que la session est prête
    const timer = setTimeout(() => {
      const sid = sessionIdRef.current;
      if (!sid) {
        console.warn('[FP] No session, skip track');
        return;
      }

      // Anti-doublon
      if (pathname === lastPathRef.current) return;
      lastPathRef.current = pathname;

      const payload = {
        type: 'pageview',
        session_id: sid,
        page_url: pathname,
        page_title: document.title || '',
        referrer: document.referrer || '',
        device_type: getDeviceType(),
        browser: getBrowser(),
        os: getOS(),
        screen_width: window.screen?.width,
        screen_height: window.screen?.height,
        language: navigator.language || 'unknown',
      };

      console.log('[FP] Tracking:', pathname);

      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(res => {
          if (!res.ok) {
            res.text().then(t => console.error('[FP] Track error:', res.status, t));
          } else {
            console.log('[FP] Tracked OK:', pathname);
          }
        })
        .catch(err => console.error('[FP] Track fetch error:', err));
    }, 200);

    return () => clearTimeout(timer);
  }, [pathname]);

  // Heartbeat — toutes les 25 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      const sid = sessionIdRef.current;
      if (!sid) return;

      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'heartbeat', session_id: sid }),
      }).catch(() => {});
    }, 25000);

    return () => clearInterval(interval);
  }, []);

  // Beacon on leave
  useEffect(() => {
    function onLeave() {
      const sid = sessionIdRef.current;
      if (!sid) return;
      try {
        navigator.sendBeacon(
          '/api/track',
          JSON.stringify({ type: 'heartbeat', session_id: sid })
        );
      } catch {}
    }
    window.addEventListener('beforeunload', onLeave);
    return () => window.removeEventListener('beforeunload', onLeave);
  }, []);

  return null;
}