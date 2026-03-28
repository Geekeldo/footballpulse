import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const LANGS = ['fr', 'en', 'ar', 'es'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api') || pathname.startsWith('/admin') ||
      pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  const pathLang = pathname.split('/')[1];
  if (LANGS.includes(pathLang)) return NextResponse.next();

  const accept = request.headers.get('accept-language') || '';
  let detected = 'fr';
  for (const l of LANGS) {
    if (accept.toLowerCase().includes(l)) { detected = l; break; }
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${detected}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!api|admin|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|rss|.*\\..*).*)'],
};
