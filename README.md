# ⚡ FootballPulse.site

AI-powered multilingual football news platform with automated content generation, SEO optimization, and social media publishing.

## 🏗 Architecture

```
FootballPulse
├── AI Editorial Engine (Gemini 2.0 Flash)
│   ├── NewsAPI → Trending football news
│   ├── Article generation (800-1200 words, SEO-optimized)
│   └── Auto-translation (FR/EN/AR/ES)
├── Frontend (Next.js 14 + Tailwind)
│   ├── SSG + ISR (revalidate every 5-10 min)
│   ├── Full SEO (Schema.org, hreflang, sitemap, RSS)
│   └── Smart ad placements (AdSense/Ezoic ready)
├── Backend
│   ├── Supabase (Postgres + Auth + Realtime)
│   ├── Vercel Cron (every 3 hours)
│   └── Social APIs (Twitter, Facebook, Instagram)
└── Admin Dashboard
    ├── Stats & Analytics
    ├── Revenue tracking
    ├── One-click social publishing
    └── Cron management
```

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd footballpulse
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `lib/supabase.ts` (the SQL in comments)
3. Copy your project URL and keys

### 3. Get API Keys

| Service | URL | Free Tier |
|---------|-----|-----------|
| **Gemini AI** | [ai.google.dev](https://ai.google.dev) | 15 req/min, 1M tokens/day |
| **NewsAPI** | [newsapi.org](https://newsapi.org) | 100 req/day |
| **Twitter/X** | [developer.x.com](https://developer.x.com) | 1500 tweets/month |
| **Meta (FB+IG)** | [developers.facebook.com](https://developers.facebook.com) | Free with app |

### 4. Configure Environment

```bash
cp .env.local.example .env.local
# Fill in all API keys
```

### 5. Run Locally

```bash
npm run dev
```

- Frontend: http://localhost:3000/fr
- Admin: http://localhost:3000/admin
- Trigger cron manually: `curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron`

### 6. Deploy to Vercel

```bash
npx vercel
# Set all env variables in Vercel dashboard
```

The cron job will automatically run every 3 hours once deployed.

## 📁 Project Structure

```
app/
├── layout.tsx              # Root layout (AdSense, schema, analytics)
├── page.tsx                # Redirect to /fr
├── [lang]/
│   ├── page.tsx            # Homepage (articles grid, categories, ads)
│   └── [slug]/page.tsx     # Article page (SEO, ads, related, share)
├── admin/page.tsx          # Admin dashboard
├── api/
│   ├── cron/route.ts       # AI editorial engine (main cron)
│   ├── articles/route.ts   # Articles listing API
│   ├── articles/[id]/      # Single article + view tracking
│   ├── social/route.ts     # Social media publishing
│   ├── stats/route.ts      # Dashboard analytics
│   └── rss/route.ts        # RSS feeds per language
├── middleware.ts            # Language detection & routing
components/
├── Header.tsx              # Navbar + language switcher + dark mode
├── Footer.tsx              # Footer with links
├── ArticleCard.tsx         # Article preview card
├── AdUnit.tsx              # AdSense + smart in-article ads
└── SocialShare.tsx         # Share buttons + admin social publisher
lib/
├── supabase.ts             # DB client + schema + types
├── gemini.ts               # AI article generation + translation
├── newsapi.ts              # Trending news fetching
├── social.ts               # Twitter/Facebook/Instagram APIs
├── seo.ts                  # Meta tags, Schema.org, helpers
└── i18n.ts                 # Translations (FR/EN/AR/ES)
```

## 💰 Monetization Strategy

### Phase 1: Launch (0-10k visits/month)
- **Google AdSense** — Easy approval, automatic ads
- Placements: in-article (every 3rd paragraph), horizontal banners, sticky sidebar
- Non-intrusive: no popups, no interstitials, no autoplay video ads

### Phase 2: Growth (10k-50k visits/month)
- Migrate to **Ezoic** — Higher RPM via AI ad optimization
- Add affiliate links (betting sites, football gear)
- Consider sponsored content section

### Phase 3: Scale (50k+ visits/month)
- Apply to **Mediavine** (requires 50k sessions/month) — Premium RPM
- Launch newsletter with sponsored slots
- Partner with football brands

### Ad Placement Rules
- Max 3 ads per article page
- No ads above the fold on mobile
- 300px minimum between ads
- Sticky sidebar only on desktop
- All ads labeled "Advertisement"

## 🔧 SEO Features

- ✅ Schema.org NewsArticle on every page
- ✅ WebSite schema with SearchAction
- ✅ BreadcrumbList schema
- ✅ Dynamic XML sitemap
- ✅ RSS feeds per language
- ✅ hreflang tags for all 4 languages
- ✅ Canonical URLs
- ✅ OpenGraph + Twitter Cards
- ✅ SSG + ISR for performance
- ✅ Image optimization (AVIF/WebP)
- ✅ Core Web Vitals optimized
- ✅ robots.txt with crawl rules
- ✅ Semantic HTML structure
- ✅ Mobile-first responsive design

## 📱 Social Media Features

- One-click publish to Twitter, Facebook, and Instagram
- AI-generated captions per platform (different tone/length)
- Auto-hashtag generation
- Post tracking with success/failure logging
- Bulk publish from admin dashboard

## 🤖 AI Editorial Flow

Every 3 hours, the cron job:
1. Fetches 3 trending football news from NewsAPI
2. Checks for duplicates (by source URL)
3. Generates SEO-optimized article in French via Gemini
4. Translates to English, Arabic, Spanish
5. Saves all 4 versions with Schema.org JSON-LD
6. Logs results for monitoring

**Daily output**: ~16-24 articles (4 languages × 2 news × 4 cron runs)

## 📄 License

Private project. All rights reserved.
