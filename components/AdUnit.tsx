'use client';
import { useEffect } from 'react';

declare global { interface Window { adsbygoogle: any[] } }

export function AdUnit({ className = '' }: { className?: string }) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  useEffect(() => {
    if (!clientId) return;
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch {}
  }, [clientId]);

  if (!clientId) {
    return (
      <div className={`ad-unit ${className}`}>
        <div className="py-8 text-center text-xs" style={{ color: 'var(--muted)' }}>Ad Placement</div>
      </div>
    );
  }

  return (
    <div className={`ad-unit ${className}`}>
      <ins className="adsbygoogle" style={{ display: 'block' }}
        data-ad-client={clientId} data-ad-slot="XXXXXXXXXX"
        data-ad-format="auto" data-full-width-responsive="true" />
    </div>
  );
}

export function ArticleWithAds({ content, lang }: { content: string; lang: string }) {
  const parts = content.split('</p>');
  const adAfter = [2, 6];
  const result: string[] = [];
  parts.forEach((p, i) => {
    if (p.trim()) result.push(p + '</p>');
    if (adAfter.includes(i)) result.push('__AD__');
  });

  return (
    <div className="prose-editorial">
      {result.map((part, i) =>
        part === '__AD__'
          ? <AdUnit key={`ad-${i}`} className="my-8" />
          : <div key={i} dangerouslySetInnerHTML={{ __html: part }} />
      )}
    </div>
  );
}

export function ShareButtons({ title, url, lang }: { title: string; url: string; lang: string }) {
  const eu = encodeURIComponent(url);
  const et = encodeURIComponent(title);
  const links = [
    { label: 'X', href: `https://twitter.com/intent/tweet?text=${et}&url=${eu}` },
    { label: 'FB', href: `https://facebook.com/sharer/sharer.php?u=${eu}` },
    { label: 'WA', href: `https://wa.me/?text=${et}%20${eu}` },
  ];

  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--muted)' }}>Share</span>
      {links.map(l => (
        <a key={l.label} href={l.href} target="_blank" rel="noopener"
          className="w-8 h-8 flex items-center justify-center text-xs font-bold transition-all hover:opacity-60"
          style={{ border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--ink)' }}>
          {l.label}
        </a>
      ))}
    </div>
  );
}
