import Link from 'next/link';
import { type Lang, t } from '@/lib/i18n';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS, ar, es } from 'date-fns/locale';

const localeMap = { fr, en: enUS, ar, es };

type Props = {
  slug: string; title: string; excerpt: string; cover_image: string | null;
  category: string; views: number; published_at: string; lang: Lang;
  featured?: boolean; variant?: 'default' | 'horizontal' | 'minimal';
};

export default function ArticleCard({
  slug, title, excerpt, cover_image, category, views, published_at, lang,
  featured = false, variant = 'default',
}: Props) {
  const tr = t(lang);
  const locale = localeMap[lang] || enUS;
  const timeAgo = formatDistanceToNow(new Date(published_at), { addSuffix: true, locale });

  // FEATURED — full-width hero
  if (featured) {
    return (
      <Link href={`/${lang}/${slug}`} className="group block anim-up">
        <article className="relative overflow-hidden" style={{ borderRadius: '16px' }}>
          <div className="aspect-[2/1] md:aspect-[21/9] img-zoom bg-neutral-200">
            {cover_image ? (
              <img src={cover_image} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full" style={{ background: 'var(--paper-warm)' }} />
            )}
          </div>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 40%, transparent 70%)' }} />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white mb-3"
              style={{ background: 'var(--accent)', borderRadius: '2px' }}>
              {category.replace('-', ' ')}
            </span>
            <h2 className="font-display text-2xl md:text-4xl lg:text-5xl text-white leading-[1.1] mb-3 group-hover:opacity-80 transition-opacity">
              {title}
            </h2>
            <p className="text-white/60 text-sm md:text-base mb-3 line-clamp-2 max-w-2xl">{excerpt}</p>
            <div className="flex items-center gap-4 text-white/40 text-xs uppercase tracking-wider">
              <span>{timeAgo}</span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span>{views.toLocaleString()} {tr.views}</span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  // HORIZONTAL — sidebar/related style
  if (variant === 'horizontal') {
    return (
      <Link href={`/${lang}/${slug}`} className="group flex gap-4 py-4 hover-lift" style={{ borderBottom: '1px solid var(--border)' }}>
        {cover_image && (
          <div className="w-24 h-24 shrink-0 img-zoom" style={{ borderRadius: '8px' }}>
            <img src={cover_image} alt={title} className="w-full h-full object-cover" style={{ borderRadius: '8px' }} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--accent)' }}>
            {category.replace('-', ' ')}
          </span>
          <h3 className="font-display text-lg leading-snug mt-1 line-clamp-2 group-hover:opacity-70 transition-opacity" style={{ color: 'var(--ink)' }}>
            {title}
          </h3>
          <span className="text-xs mt-2 block" style={{ color: 'var(--muted)' }}>{timeAgo}</span>
        </div>
      </Link>
    );
  }

  // MINIMAL — text only, list style
  if (variant === 'minimal') {
    return (
      <Link href={`/${lang}/${slug}`} className="group block py-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--accent)' }}>
              {category.replace('-', ' ')}
            </span>
            <h3 className="font-display text-lg leading-snug mt-0.5 group-hover:opacity-70 transition-opacity" style={{ color: 'var(--ink)' }}>
              {title}
            </h3>
          </div>
          <span className="text-xs shrink-0 mt-1" style={{ color: 'var(--muted)' }}>{timeAgo}</span>
        </div>
      </Link>
    );
  }

  // DEFAULT — magazine card
  return (
    <Link href={`/${lang}/${slug}`} className="group block hover-lift">
      <article>
        <div className="aspect-[3/2] img-zoom mb-4" style={{ borderRadius: '8px' }}>
          {cover_image ? (
            <img src={cover_image} alt={title} className="w-full h-full object-cover" style={{ borderRadius: '8px' }} loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-display text-4xl" style={{ background: 'var(--paper-warm)', borderRadius: '8px', color: 'var(--border-strong)' }}>
              FP
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--accent)' }}>
              {category.replace('-', ' ')}
            </span>
            <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{timeAgo}</span>
          </div>
          <h3 className="font-display text-xl md:text-2xl leading-tight mb-2 line-clamp-2 group-hover:opacity-70 transition-opacity" style={{ color: 'var(--ink)' }}>
            {title}
          </h3>
          <p className="text-sm line-clamp-2" style={{ color: 'var(--muted)', lineHeight: 1.7 }}>{excerpt}</p>
        </div>
      </article>
    </Link>
  );
}
