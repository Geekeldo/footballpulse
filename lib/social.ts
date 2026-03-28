import type { Article, SocialPost } from './supabase';
import { supabaseAdmin } from './supabase';

// ============================================
// TWITTER / X API v2
// ============================================
export async function postToTwitter(
  article: Article,
  caption: { text: string; hashtags: string[] }
): Promise<{ postId: string; postUrl: string }> {
  const text = `${caption.text}\n\n${caption.hashtags.map(h => `#${h}`).join(' ')}\n\n${process.env.NEXT_PUBLIC_SITE_URL}/${article.lang}/${article.slug}`;

  // OAuth 1.0a signature
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = Math.random().toString(36).substring(2);

  const params: Record<string, string> = {
    oauth_consumer_key: process.env.TWITTER_API_KEY!,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_token: process.env.TWITTER_ACCESS_TOKEN!,
    oauth_version: '1.0',
  };

  // For production, use a proper OAuth library
  // This is a simplified version - install 'oauth-1.0a' package for real signing
  const res = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `OAuth oauth_consumer_key="${params.oauth_consumer_key}", oauth_nonce="${nonce}", oauth_signature="SIGN_WITH_OAUTH_LIB", oauth_signature_method="HMAC-SHA1", oauth_timestamp="${timestamp}", oauth_token="${params.oauth_token}", oauth_version="1.0"`,
    },
    body: JSON.stringify({ text: text.slice(0, 280) }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Twitter API error: ${res.status} - ${err}`);
  }

  const data = await res.json();
  return {
    postId: data.data.id,
    postUrl: `https://x.com/i/web/status/${data.data.id}`,
  };
}

// ============================================
// META API - Facebook Pages
// ============================================
export async function postToFacebook(
  article: Article,
  caption: { text: string; hashtags: string[] }
): Promise<{ postId: string; postUrl: string }> {
  const pageToken = process.env.META_PAGE_ACCESS_TOKEN!;
  const pageId = 'me'; // Uses page token to identify page

  const message = `${caption.text}\n\n${caption.hashtags.map(h => `#${h}`).join(' ')}`;
  const link = `${process.env.NEXT_PUBLIC_SITE_URL}/${article.lang}/${article.slug}`;

  const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      link,
      access_token: pageToken,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Facebook API error: ${res.status} - ${err}`);
  }

  const data = await res.json();
  return {
    postId: data.id,
    postUrl: `https://facebook.com/${data.id}`,
  };
}

// ============================================
// META API - Instagram (Business Account)
// ============================================
export async function postToInstagram(
  article: Article,
  caption: { text: string; hashtags: string[] }
): Promise<{ postId: string; postUrl: string }> {
  const accessToken = process.env.META_PAGE_ACCESS_TOKEN!;
  const igAccountId = process.env.META_INSTAGRAM_ACCOUNT_ID!;

  const fullCaption = `${caption.text}\n\n${caption.hashtags.map(h => `#${h}`).join(' ')}\n\nLink in bio`;
  const imageUrl = article.cover_image || `${process.env.NEXT_PUBLIC_SITE_URL}/og-default.png`;

  // Step 1: Create media container
  const containerRes = await fetch(
    `https://graph.facebook.com/v19.0/${igAccountId}/media`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: imageUrl,
        caption: fullCaption.slice(0, 2200),
        access_token: accessToken,
      }),
    }
  );

  if (!containerRes.ok) {
    const err = await containerRes.text();
    throw new Error(`Instagram container error: ${containerRes.status} - ${err}`);
  }

  const container = await containerRes.json();

  // Step 2: Publish container
  const publishRes = await fetch(
    `https://graph.facebook.com/v19.0/${igAccountId}/media_publish`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: container.id,
        access_token: accessToken,
      }),
    }
  );

  if (!publishRes.ok) {
    const err = await publishRes.text();
    throw new Error(`Instagram publish error: ${publishRes.status} - ${err}`);
  }

  const data = await publishRes.json();
  return {
    postId: data.id,
    postUrl: `https://instagram.com/p/${data.id}`,
  };
}

// ============================================
// Unified social posting with tracking
// ============================================
export async function publishToSocial(
  article: Article,
  platforms: ('twitter' | 'facebook' | 'instagram')[],
  caption: { text: string; hashtags: string[] }
): Promise<SocialPost[]> {
  const results: SocialPost[] = [];

  for (const platform of platforms) {
    try {
      let postResult: { postId: string; postUrl: string };

      switch (platform) {
        case 'twitter':
          postResult = await postToTwitter(article, caption);
          break;
        case 'facebook':
          postResult = await postToFacebook(article, caption);
          break;
        case 'instagram':
          postResult = await postToInstagram(article, caption);
          break;
      }

      // Track in DB
      const { data } = await supabaseAdmin
        .from('social_posts')
        .insert({
          article_id: article.id,
          platform,
          post_id: postResult.postId,
          post_url: postResult.postUrl,
          status: 'posted',
          posted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (data) results.push(data as SocialPost);
    } catch (error: any) {
      // Track failure
      const { data } = await supabaseAdmin
        .from('social_posts')
        .insert({
          article_id: article.id,
          platform,
          status: 'failed',
          error_message: error.message?.slice(0, 500),
        })
        .select()
        .single();

      if (data) results.push(data as SocialPost);
      console.error(`[Social] ${platform} failed for ${article.slug}:`, error.message);
    }
  }

  return results;
}
