'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Search, Moon, Sun, Globe } from 'lucide-react';
import { type Lang, t, SUPPORTED_LANGS, getLangName, isRTL } from '@/lib/i18n';

export default function Header({ lang }: { lang: Lang }) {
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const tr = t(lang);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleDark = () => {
    setDark(!dark);
    document.documentElement.classList.toggle('dark');
  };

  const nav = [
    { label: tr.latest, href: `/${lang}` },
    { label: tr.transfers, href: `/${lang}?cat=transfers` },
    { label: tr.leagues, href: `/${lang}?cat=leagues` },
    { label: tr.analysis, href: `/${lang}?cat=analysis` },
  ];

  return (
    <>
      {/* Breaking news ticker */}
      <div className="bg-ink text-paper text-xs py-1.5" style={{ background: 'var(--ink)', color: 'var(--paper)' }}>
        <div className="ticker-wrap">
          <div className="ticker-content">
            <span className="inline-flex items-center gap-2 mx-8">
              <span className="w-2 h-2 rounded-full bg-red-500" style={{ animation: 'pulseDot 1.5s ease infinite' }} />
              <span className="font-bold uppercase tracking-widest text-[10px]" style={{ color: 'var(--accent)' }}>Live</span>
              <span className="opacity-70">FootballPulse — {tr.siteDescription}</span>
            </span>
            <span className="inline-flex items-center gap-2 mx-8">
              <span className="opacity-70">Breaking news, transfers & analysis in 4 languages</span>
            </span>
            <span className="inline-flex items-center gap-2 mx-8">
              <span className="w-2 h-2 rounded-full bg-red-500" style={{ animation: 'pulseDot 1.5s ease infinite' }} />
              <span className="font-bold uppercase tracking-widest text-[10px]" style={{ color: 'var(--accent)' }}>Live</span>
              <span className="opacity-70">FootballPulse — {tr.siteDescription}</span>
            </span>
            <span className="inline-flex items-center gap-2 mx-8">
              <span className="opacity-70">Breaking news, transfers & analysis in 4 languages</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-sm' : ''}`}
        style={{ background: 'var(--paper)', borderBottom: '1px solid var(--border)' }}
        dir={isRTL(lang) ? 'rtl' : 'ltr'}
      >
        {/* Top bar — logo centered, editorial style */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left actions */}
            <div className="flex items-center gap-2 w-32">
              <button onClick={() => setOpen(!open)} className="md:hidden p-2 hover:opacity-60 transition-opacity">
                {open ? <X size={20} /> : <Menu size={20} />}
              </button>
              <button onClick={toggleDark} className="p-2 hover:opacity-60 transition-opacity">
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>

            {/* Center logo */}
            <Link href={`/${lang}`} className="text-center group">
              <div className="font-display text-4xl md:text-5xl tracking-tight leading-none" style={{ color: 'var(--ink)' }}>
                Football<span style={{ color: 'var(--accent)' }}>Pulse</span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.3em] mt-1" style={{ color: 'var(--muted)' }}>
                The pulse of world football
              </div>
            </Link>

            {/* Right actions */}
            <div className="flex items-center gap-2 w-32 justify-end">
              <button className="p-2 hover:opacity-60 transition-opacity">
                <Search size={18} />
              </button>
              <div className="relative">
                <button onClick={() => setLangOpen(!langOpen)} className="flex items-center gap-1 px-2 py-1.5 text-xs font-bold uppercase tracking-wider hover:opacity-60 transition-opacity">
                  <Globe size={14} /> {lang}
                </button>
                {langOpen && (
                  <div className="absolute right-0 top-full mt-2 py-1 min-w-[140px] z-50 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '8px', boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }}>
                    {SUPPORTED_LANGS.map(l => (
                      <Link key={l} href={`/${l}`} onClick={() => setLangOpen(false)}
                        className="block px-4 py-2 text-sm transition-colors"
                        style={{ color: l === lang ? 'var(--accent)' : 'var(--ink)', fontWeight: l === lang ? 700 : 400 }}>
                        {getLangName(l)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation bar */}
        <nav className="border-t hidden md:block" style={{ borderColor: 'var(--border)' }}>
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-8 py-3">
            {nav.map((item, i) => (
              <Link key={i} href={item.href}
                className="text-sm font-bold uppercase tracking-wider hover-underline transition-opacity hover:opacity-70"
                style={{ color: 'var(--ink)', letterSpacing: '0.08em' }}>
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Mobile nav */}
        {open && (
          <nav className="md:hidden border-t" style={{ borderColor: 'var(--border)', background: 'var(--paper)' }}>
            <div className="px-4 py-4 space-y-1">
              {nav.map((item, i) => (
                <Link key={i} href={item.href} onClick={() => setOpen(false)}
                  className="block py-3 text-sm font-bold uppercase tracking-wider"
                  style={{ color: 'var(--ink)', borderBottom: '1px solid var(--border)' }}>
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
