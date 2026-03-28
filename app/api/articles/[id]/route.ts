import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET — fetch single article (public)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get('lang') || 'fr';
  const slug = params.id;

  const { data, error } = await supabaseAdmin
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('lang', lang)
    .eq('status', 'published')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  supabaseAdmin.rpc('increment_views', {
    article_slug: slug,
    article_lang: lang,
  }).then(({ error }) => {
    if (error) console.error('[Views]', error.message);
  });

  const { data: related } = await supabaseAdmin
    .from('articles')
    .select('slug, title, excerpt, cover_image, published_at, category')
    .eq('lang', lang)
    .eq('status', 'published')
    .eq('category', data.category)
    .neq('id', data.id)
    .order('published_at', { ascending: false })
    .limit(4);

  return NextResponse.json({ article: data, related: related || [] });
}

// PUT — edit article (admin)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { title, excerpt, content, meta_description, category, cover_image, tags, status } = body;

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (title !== undefined) updates.title = title;
    if (excerpt !== undefined) updates.excerpt = excerpt;
    if (content !== undefined) updates.content = content;
    if (meta_description !== undefined) updates.meta_description = meta_description;
    if (category !== undefined) updates.category = category;
    if (cover_image !== undefined) updates.cover_image = cover_image;
    if (tags !== undefined) updates.tags = tags;
    if (status !== undefined) updates.status = status;

    const { data, error } = await supabaseAdmin
      .from('articles')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, article: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE — delete article (admin)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await supabaseAdmin
    .from('articles')
    .delete()
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}