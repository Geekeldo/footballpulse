import Link from 'next/link';
import { type Lang, t, SUPPORTED_LANGS, getLangName, isRTL } from '@/lib/i18n';

export default function Footer({ lang }: { lang: Lang }) {
  const tr = t(lang);
  return (
    <footer dir={isRTL(lang) ? 'rtl' : 'ltr'} style={{ borderTop: '3px solid var(--ink)', marginTop: '4rem' }}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-1">
            <div className="font-display text-3xl mb-3" style={{ color: 'var(--ink)' }}>
              Football<span style={{ color: 'var(--accent)' }}>Pulse</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{tr.siteDescription}</p>
          </div>
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] mb-4" style={{ color: 'var(--muted)' }}>{tr.categories}</h4>
            <ul className="space-y-2">
              {['transfers', 'premier-league', 'la-liga', 'champions-league', 'serie-a', 'bundesliga'].map(cat => (
                <li key={cat}>
                  <Link href={`/${lang}?cat=${cat}`} className="text-sm capitalize hover-underline" style={{ color: 'var(--ink)' }}>
                    {cat.replace('-', ' ')}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] mb-4" style={{ color: 'var(--muted)' }}>Languages</h4>
            <ul className="space-y-2">
              {SUPPORTED_LANGS.map(l => (
                <li key={l}>
                  <Link href={`/${l}`} className="text-sm hover-underline"
                    style={{ color: l === lang ? 'var(--accent)' : 'var(--ink)', fontWeight: l === lang ? 700 : 400 }}>
                    {getLangName(l)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* ✅ LIENS LÉGAUX FONCTIONNELS */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] mb-4" style={{ color: 'var(--muted)' }}>Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href={`/${lang}/about`} className="text-sm hover-underline" style={{ color: 'var(--ink)' }}>
                  {tr.footer.about}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/contact`} className="text-sm hover-underline" style={{ color: 'var(--ink)' }}>
                  {tr.footer.contact}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/privacy`} className="text-sm hover-underline" style={{ color: 'var(--ink)' }}>
                  {tr.footer.privacy}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/terms`} className="text-sm hover-underline" style={{ color: 'var(--ink)' }}>
                  {tr.footer.terms}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 flex items-center justify-between text-xs" style={{ borderTop: '1px solid var(--border)', color: 'var(--muted)' }}>
          <span>{tr.footer.copyright}</span>
          <span className="uppercase tracking-wider">RSS · Twitter · Instagram</span>
        </div>
      </div>
    </footer>
  );
}