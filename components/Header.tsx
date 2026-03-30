'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Moon, Sun, Globe, ChevronDown, Zap } from 'lucide-react';
import { type Lang, t, SUPPORTED_LANGS, getLangName, isRTL } from '@/lib/i18n';

export default function Header({ lang }: { lang: Lang }) {
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const tr = t(lang);

  const toggleDark = () => {
    setDark(!dark);
    document.documentElement.classList.toggle('dark');
  };

  const mainNav = [
    { label: tr.home, href: `/${lang}` },
    { label: lang === 'fr' ? 'Scores' : lang === 'ar' ? 'النتائج' : lang === 'es' ? 'Marcadores' : 'Scores', href: `/${lang}/livescore` },
    { label: lang === 'fr' ? 'Classements' : lang === 'ar' ? 'الترتيب' : lang === 'es' ? 'Clasificaciones' : 'Standings', href: `/${lang}/standings` },
    { label: lang === 'fr' ? 'Calendrier' : lang === 'ar' ? 'الجدول' : lang === 'es' ? 'Calendario' : 'Fixtures', href: `/${lang}/fixtures/premier-league` },
    { label: lang === 'fr' ? 'Pronos' : lang === 'ar' ? 'التوقعات' : lang === 'es' ? 'Pronósticos' : 'Tips', href: `/${lang}/prono` },
    { label: tr.transfers, href: `/${lang}?cat=transfers` },
    { label: tr.analysis, href: `/${lang}?cat=analysis` },
  ];

  const leagues = [
    { label: 'Premier League', href: `/${lang}/standings/premier-league` },
    { label: 'La Liga', href: `/${lang}/standings/la-liga` },
    { label: 'Serie A', href: `/${lang}/standings/serie-a` },
    { label: 'Bundesliga', href: `/${lang}/standings/bundesliga` },
    { label: 'Ligue 1', href: `/${lang}/standings/ligue-1` },
    { label: 'Champions League', href: `/${lang}/standings/champions-league` },
  ];

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50 }}>
      {/* Top bar — dark */}
      <div style={{ background: 'var(--nav-bg)', color: 'var(--nav-text)' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-12">
            <Link href={`/${lang}`} className="flex items-center gap-2 group" dir="ltr">
              <div className="w-7 h-7 rounded flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                <Zap size={14} color="white" />
              </div>
              <span className="text-base font-extrabold tracking-tight text-white">
                Football<span style={{ color: 'var(--accent)' }}>Pulse</span>
              </span>
            </Link>

            <div className="flex items-center gap-1">
              <button onClick={toggleDark} className="p-2 rounded hover:bg-white/10 transition-colors" style={{ color: 'var(--nav-text)' }}>
                {dark ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              <div className="relative">
                <button onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-white/10 transition-colors text-xs font-semibold uppercase"
                  style={{ color: 'var(--nav-text)' }}>
                  <Globe size={13} /> {lang} <ChevronDown size={11} />
                </button>
                {langOpen && (
                  <div className="absolute right-0 top-full mt-1 py-1 min-w-[130px] z-50 rounded-lg overflow-hidden"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', animation: 'slideDown 0.15s ease' }}>
                    {SUPPORTED_LANGS.map(l => (
                      <Link key={l} href={`/${l}`} onClick={() => setLangOpen(false)}
                        className="block px-4 py-2 text-sm hover:bg-[var(--paper-warm)] transition-colors"
                        style={{ color: l === lang ? 'var(--accent)' : 'var(--ink)', fontWeight: l === lang ? 700 : 400 }}>
                        {getLangName(l)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded hover:bg-white/10 transition-colors" style={{ color: 'var(--nav-text)' }}>
                {open ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Nav bar */}
        <nav className="border-t border-white/10" dir={isRTL(lang) ? 'rtl' : 'ltr'}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="hidden md:flex items-center gap-0 h-10">
              {mainNav.map((item, i) => (
                <Link key={i} href={item.href}
                  className="px-3 h-full flex items-center text-[13px] font-semibold hover:bg-white/10 transition-colors"
                  style={{ color: 'var(--nav-text)' }}>
                  {item.label}
                </Link>
              ))}
              <div className="w-px h-5 mx-1" style={{ background: 'rgba(255,255,255,0.15)' }} />
              {leagues.map((item, i) => (
                <Link key={i} href={item.href}
                  className="px-3 h-full flex items-center text-[12px] font-medium hover:bg-white/10 transition-colors"
                  style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="md:hidden flex items-center gap-0 h-10 overflow-x-auto scrollbar-hide">
              {mainNav.map((item, i) => (
                <Link key={i} href={item.href}
                  className="px-3 h-full flex items-center text-[12px] font-semibold whitespace-nowrap"
                  style={{ color: 'var(--nav-text)' }}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile expanded menu */}
      {open && (
        <div className="md:hidden" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', animation: 'slideDown 0.2s ease' }}
          dir={isRTL(lang) ? 'rtl' : 'ltr'}>
          <div className="px-4 py-3 space-y-0.5">
            {mainNav.map((item, i) => (
              <Link key={i} href={item.href} onClick={() => setOpen(false)}
                className="block py-2.5 text-sm font-semibold"
                style={{ color: 'var(--ink)', borderBottom: '1px solid var(--border)' }}>
                {item.label}
              </Link>
            ))}
            <div className="pt-2 pb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Leagues</span>
            </div>
            {leagues.map((item, i) => (
              <Link key={i} href={item.href} onClick={() => setOpen(false)}
                className="block py-2 text-sm"
                style={{ color: 'var(--ink-secondary)', borderBottom: '1px solid var(--border)' }}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Ticker — rouge accent */}
      <div className="h-7 flex items-center overflow-hidden" style={{ background: 'var(--accent)', color: 'white' }}>
        <div className="ticker-wrap flex-1">
          <div className="ticker-content text-[11px] font-medium">
            <span className="inline-flex items-center gap-2 mx-8">
              <span className="w-1.5 h-1.5 rounded-full bg-white" style={{ animation: 'pulseDot 1.5s ease infinite' }} />
              LIVE — FootballPulse
            </span>
            <span className="mx-8 opacity-80">{tr.siteDescription}</span>
            <span className="inline-flex items-center gap-2 mx-8">
              <span className="w-1.5 h-1.5 rounded-full bg-white" style={{ animation: 'pulseDot 1.5s ease infinite' }} />
              LIVE — FootballPulse
            </span>
            <span className="mx-8 opacity-80">{tr.siteDescription}</span>
          </div>
        </div>
      </div>
    </header>
  );
}