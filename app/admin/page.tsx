'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { BarChart3, FileText, DollarSign, Eye, TrendingUp, Send, RefreshCw, Loader2, Check, AlertCircle, Zap, Lock, Image, Bold, Italic, Heading, Quote, List, Link2, LogOut, Twitter, Facebook, Instagram, Trash2, Edit3, Search, Filter, ChevronLeft, ChevronRight, X, ExternalLink, Clock, Globe, Archive, CheckCircle, XCircle } from 'lucide-react';

// ============================================================
// AUTH WRAPPER
// ============================================================
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/admin-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwd }),
    });
    if (res.ok) {
      setAuthed(true);
      sessionStorage.setItem('fp_admin', '1');
      sessionStorage.setItem('fp_admin_pwd', pwd);
    } else {
      setError('Wrong password');
    }
  }

  useEffect(() => {
    if (sessionStorage.getItem('fp_admin') === '1') setAuthed(true);
  }, []);

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--paper)' }}>
        <div className="w-full max-w-sm anim-scale">
          <div className="text-center mb-8">
            <div className="font-display text-4xl mb-2" style={{ color: 'var(--ink)' }}>Football<span style={{ color: 'var(--accent)' }}>Pulse</span></div>
            <div className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--muted)' }}>Admin panel</div>
          </div>
          <div className="p-8" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}>
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-6" style={{ background: 'var(--paper-warm)', borderRadius: '12px' }}>
              <Lock size={20} style={{ color: 'var(--ink)' }} />
            </div>
            <form onSubmit={login}>
              <label className="block text-[10px] font-bold uppercase tracking-[0.12em] mb-2" style={{ color: 'var(--muted)' }}>Password</label>
              <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} autoFocus
                className="w-full px-4 py-3 text-sm outline-none"
                style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--ink)' }}
                placeholder="Enter admin password" />
              {error && <p className="text-xs mt-2" style={{ color: 'var(--accent)' }}>{error}</p>}
              <button type="submit" className="w-full mt-4 py-3 text-sm font-bold uppercase tracking-wider hover:opacity-90"
                style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: '6px' }}>Sign in</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return <Dashboard onLogout={() => { setAuthed(false); sessionStorage.removeItem('fp_admin'); sessionStorage.removeItem('fp_admin_pwd'); }} />;
}

// ============================================================
// MAIN DASHBOARD
// ============================================================
function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<'overview' | 'articles' | 'editor' | 'social' | 'cron'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/stats?period=${period}`);
      setStats(await res.json());
    } catch {}
    setLoading(false);
  }, [period]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
    { id: 'articles' as const, label: 'Articles', icon: FileText },
    { id: 'editor' as const, label: 'New article', icon: Edit3 },
    { id: 'social' as const, label: 'Social', icon: Send },
    { id: 'cron' as const, label: 'AI Cron', icon: Zap },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--paper)' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <span className="font-display text-2xl" style={{ color: 'var(--ink)' }}>Football<span style={{ color: 'var(--accent)' }}>Pulse</span></span>
          <span className="text-[10px] uppercase tracking-[0.15em] px-2 py-1" style={{ color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: '2px' }}>Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <select value={period} onChange={e => setPeriod(e.target.value)}
            className="text-xs px-3 py-2 outline-none" style={{ background: 'var(--paper-warm)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--ink)' }}>
            <option value="1d">Today</option><option value="7d">7 days</option><option value="30d">30 days</option><option value="90d">90 days</option>
          </select>
          <button onClick={fetchStats} className="p-2 hover:opacity-60" style={{ background: 'var(--paper-warm)', borderRadius: '6px' }}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={onLogout} className="p-2 hover:opacity-60" title="Logout"><LogOut size={18} style={{ color: 'var(--muted)' }} /></button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-0 mb-8 overflow-x-auto" style={{ borderBottom: '1px solid var(--border)' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider shrink-0"
              style={{ color: tab === t.id ? 'var(--ink)' : 'var(--muted)', borderBottom: tab === t.id ? '2px solid var(--ink)' : '2px solid transparent', marginBottom: '-1px' }}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {loading && !stats ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin" style={{ color: 'var(--muted)' }} /></div>
        ) : (
          <>
            {tab === 'overview' && stats && <OverviewTab stats={stats} />}
            {tab === 'articles' && <ArticlesTab />}
            {tab === 'editor' && <EditorTab onSaved={() => setTab('articles')} />}
            {tab === 'social' && stats && <SocialTab articles={stats.topArticles || []} />}
            {tab === 'cron' && <CronTab />}
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
// OVERVIEW TAB
// ============================================================
function OverviewTab({ stats }: { stats: any }) {
  const cards = [
    { label: 'Total articles', value: stats.overview.totalArticles, icon: FileText, color: '#185FA5' },
    { label: 'Total views', value: stats.overview.totalViews.toLocaleString(), icon: Eye, color: '#0F6E56' },
    { label: 'Revenue', value: `$${stats.overview.totalRevenue.toFixed(2)}`, icon: DollarSign, color: '#BA7517' },
    { label: 'Recent', value: stats.overview.recentArticles, icon: TrendingUp, color: '#534AB7' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <div key={c.label} className={`admin-card p-5 anim-up d${i + 1}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--muted)' }}>{c.label}</span>
              <c.icon size={16} style={{ color: c.color }} />
            </div>
            <div className="text-2xl font-bold font-display" style={{ color: 'var(--ink)' }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="admin-card p-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] mb-6" style={{ color: 'var(--muted)' }}>Views over time</h3>
          <div className="h-40 flex items-end gap-1">
            {(stats.chartData || []).slice(-14).map((d: any, i: number) => {
              const max = Math.max(...(stats.chartData || []).map((x: any) => x.views), 1);
              const h = Math.max((d.views / max) * 100, 3);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px]" style={{ color: 'var(--muted)' }}>{d.views}</span>
                  <div className="w-full" style={{ height: `${h}%`, background: 'var(--ink)', borderRadius: '2px 2px 0 0' }} />
                  <span className="text-[9px]" style={{ color: 'var(--muted)' }}>{d.date?.slice(5)}</span>
                </div>
              );
            })}
            {(!stats.chartData || stats.chartData.length === 0) && (
              <div className="w-full text-center text-sm py-10" style={{ color: 'var(--muted)' }}>No data yet</div>
            )}
          </div>
        </div>

        <div className="admin-card p-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] mb-6" style={{ color: 'var(--muted)' }}>Articles by language</h3>
          {Object.entries(stats.overview.articlesByLang || {}).map(([lang, count]: any) => {
            const total = stats.overview.totalArticles || 1;
            const pct = Math.round((count / total) * 100);
            return (
              <div key={lang} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="uppercase font-bold" style={{ color: 'var(--ink)' }}>{lang}</span>
                  <span style={{ color: 'var(--muted)' }}>{count} ({pct}%)</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--ink)' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top articles */}
      <div className="admin-card">
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--muted)' }}>Top articles</h3>
        </div>
        {(stats.topArticles || []).slice(0, 8).map((a: any, i: number) => (
          <div key={a.id} className="flex items-center gap-4 px-6 py-3 hover:bg-[var(--paper-warm)]" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="text-sm font-bold w-6" style={{ color: 'var(--muted)' }}>{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--ink)' }}>{a.title}</p>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{a.lang} · {a.category}</p>
            </div>
            <span className="text-sm font-bold" style={{ color: 'var(--ink)' }}>{(a.views || 0).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// ARTICLES TAB — List, filter, edit, delete, status change
// ============================================================
function ArticlesTab() {
  const [articles, setArticles] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterLang, setFilterLang] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCat, setFilterCat] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ admin: '1', page: String(page), limit: '20' });
    if (filterLang !== 'all') params.set('lang', filterLang);
    if (filterStatus !== 'all') params.set('status', filterStatus);
    if (filterCat !== 'all') params.set('category', filterCat);
    if (search) params.set('search', search);

    const res = await fetch(`/api/articles?${params}`);
    const data = await res.json();
    setArticles(data.articles || []);
    setTotal(data.total || 0);
    setTotalPages(data.totalPages || 1);
    setLoading(false);
  }, [page, filterLang, filterStatus, filterCat, search]);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  async function deleteArticle(id: string) {
    if (!confirm('Delete this article? This cannot be undone.')) return;
    setDeleting(id);
    await fetch(`/api/articles/${id}`, { method: 'DELETE' });
    setDeleting(null);
    fetchArticles();
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/articles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchArticles();
  }

  async function saveEdit() {
    if (!editing) return;
    await fetch(`/api/articles/${editing.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: editing.title,
        excerpt: editing.excerpt,
        category: editing.category,
        cover_image: editing.cover_image,
        status: editing.status,
      }),
    });
    setEditing(null);
    fetchArticles();
  }

  const statusIcon = (s: string) => {
    if (s === 'published') return <CheckCircle size={12} style={{ color: '#0F6E56' }} />;
    if (s === 'draft') return <Clock size={12} style={{ color: '#BA7517' }} />;
    return <Archive size={12} style={{ color: 'var(--muted)' }} />;
  };

  const statusColor = (s: string) => {
    if (s === 'published') return { bg: '#E1F5EE', color: '#085041' };
    if (s === 'draft') return { bg: '#FAEEDA', color: '#633806' };
    return { bg: 'var(--paper-warm)', color: 'var(--muted)' };
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] px-3 py-2" style={{ background: 'var(--paper-warm)', borderRadius: '6px', border: '1px solid var(--border)' }}>
          <Search size={14} style={{ color: 'var(--muted)' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search articles..."
            className="flex-1 text-sm outline-none bg-transparent" style={{ color: 'var(--ink)' }} />
          {search && <button onClick={() => setSearch('')}><X size={14} style={{ color: 'var(--muted)' }} /></button>}
        </div>
        {[
          { val: filterLang, set: setFilterLang, opts: ['all', 'fr', 'en', 'ar', 'es'], label: 'Lang' },
          { val: filterStatus, set: setFilterStatus, opts: ['all', 'published', 'draft', 'archived'], label: 'Status' },
          { val: filterCat, set: setFilterCat, opts: ['all', 'transfers', 'leagues', 'analysis', 'champions-league', 'premier-league', 'la-liga', 'serie-a', 'general'], label: 'Category' },
        ].map(f => (
          <select key={f.label} value={f.val} onChange={e => { f.set(e.target.value); setPage(1); }}
            className="text-xs px-3 py-2 outline-none capitalize" style={{ background: 'var(--paper-warm)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--ink)' }}>
            {f.opts.map(o => <option key={o} value={o}>{o === 'all' ? `All ${f.label}` : o}</option>)}
          </select>
        ))}
        <span className="text-xs" style={{ color: 'var(--muted)' }}>{total} articles</span>
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="admin-card p-6 space-y-4" style={{ border: '2px solid var(--ink)' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>Editing article</h3>
            <button onClick={() => setEditing(null)}><X size={18} /></button>
          </div>
          <input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })}
            className="w-full px-3 py-2 text-sm outline-none" style={{ background: 'var(--paper-warm)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--ink)' }} />
          <input value={editing.excerpt || ''} onChange={e => setEditing({ ...editing, excerpt: e.target.value })} placeholder="Excerpt"
            className="w-full px-3 py-2 text-sm outline-none" style={{ background: 'var(--paper-warm)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--ink)' }} />
          <div className="flex gap-3">
            <select value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })}
              className="flex-1 text-xs px-3 py-2 outline-none" style={{ background: 'var(--paper-warm)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--ink)' }}>
              {['general', 'transfers', 'leagues', 'analysis', 'champions-league', 'premier-league', 'la-liga', 'serie-a', 'bundesliga'].map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value })}
              className="flex-1 text-xs px-3 py-2 outline-none" style={{ background: 'var(--paper-warm)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--ink)' }}>
              <option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option>
            </select>
          </div>
          <input value={editing.cover_image || ''} onChange={e => setEditing({ ...editing, cover_image: e.target.value })} placeholder="Cover image URL"
            className="w-full px-3 py-2 text-sm outline-none" style={{ background: 'var(--paper-warm)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--ink)' }} />
          <button onClick={saveEdit} className="px-6 py-2 text-sm font-bold uppercase tracking-wider hover:opacity-90"
            style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: '6px' }}>Save changes</button>
        </div>
      )}

      {/* Article list */}
      <div className="admin-card">
        {loading ? (
          <div className="p-10 text-center"><Loader2 size={20} className="animate-spin mx-auto" style={{ color: 'var(--muted)' }} /></div>
        ) : articles.length === 0 ? (
          <div className="p-10 text-center text-sm" style={{ color: 'var(--muted)' }}>No articles found</div>
        ) : (
          articles.map(a => {
            const sc = statusColor(a.status);
            return (
              <div key={a.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--paper-warm)] transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                {/* Cover thumbnail */}
                <div className="w-12 h-12 shrink-0 rounded overflow-hidden" style={{ background: 'var(--paper-warm)' }}>
                  {a.cover_image ? <img src={a.cover_image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] font-bold" style={{ color: 'var(--muted)' }}>FP</div>}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--ink)' }}>{a.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded" style={{ background: sc.bg, color: sc.color }}>{a.status}</span>
                    <span className="text-[10px] uppercase font-bold" style={{ color: 'var(--muted)' }}>{a.lang}</span>
                    <span className="text-[10px] capitalize" style={{ color: 'var(--muted)' }}>{a.category}</span>
                    <span className="text-[10px]" style={{ color: 'var(--muted)' }}>{(a.views || 0).toLocaleString()} views</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {a.status === 'published' && (
                    <a href={`/${a.lang}/${a.slug}`} target="_blank" className="p-2 hover:opacity-60 rounded" title="View"><ExternalLink size={14} style={{ color: 'var(--muted)' }} /></a>
                  )}
                  <button onClick={() => setEditing(a)} className="p-2 hover:opacity-60 rounded" title="Edit"><Edit3 size={14} style={{ color: 'var(--ink)' }} /></button>
                  {a.status === 'published' ? (
                    <button onClick={() => updateStatus(a.id, 'archived')} className="p-2 hover:opacity-60 rounded" title="Archive"><Archive size={14} style={{ color: 'var(--muted)' }} /></button>
                  ) : a.status !== 'published' ? (
                    <button onClick={() => updateStatus(a.id, 'published')} className="p-2 hover:opacity-60 rounded" title="Publish"><CheckCircle size={14} style={{ color: '#0F6E56' }} /></button>
                  ) : null}
                  <button onClick={() => deleteArticle(a.id)} disabled={deleting === a.id}
                    className="p-2 hover:opacity-60 rounded" title="Delete">
                    {deleting === a.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} style={{ color: 'var(--accent)' }} />}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-2 hover:opacity-60 disabled:opacity-30"><ChevronLeft size={16} /></button>
          <span className="text-xs" style={{ color: 'var(--muted)' }}>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="p-2 hover:opacity-60 disabled:opacity-30"><ChevronRight size={16} /></button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// EDITOR TAB — WYSIWYG
// ============================================================
function EditorTab({ onSaved }: { onSaved: () => void }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('general');
  const [lang, setLang] = useState('fr');
  const [coverUrl, setCoverUrl] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  function exec(cmd: string, val?: string) {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
  }

  async function publish() {
    if (!title || !editorRef.current?.innerHTML) return alert('Title and content required');
    setPublishing(true);
    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, excerpt, category, lang, content: editorRef.current.innerHTML, cover_image: coverUrl || null }),
      });
      if (res.ok) {
        setPublished(true);
        setTitle(''); setExcerpt(''); setCoverUrl('');
        if (editorRef.current) editorRef.current.innerHTML = '';
        setTimeout(() => { setPublished(false); onSaved(); }, 1500);
      }
    } catch {}
    setPublishing(false);
  }

  const tools = [
    { icon: Bold, cmd: 'bold' }, { icon: Italic, cmd: 'italic' },
    { icon: Heading, cmd: 'formatBlock', val: 'h2' }, { icon: Quote, cmd: 'formatBlock', val: 'blockquote' },
    { icon: List, cmd: 'insertUnorderedList' }, { icon: Link2, cmd: 'createLink' },
  ];

  return (
    <div className="max-w-3xl anim-up">
      <div className="space-y-4 mb-6">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Article title..."
          className="w-full font-display text-3xl outline-none py-2" style={{ background: 'transparent', color: 'var(--ink)', borderBottom: '2px solid var(--border)' }} />
        <input value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="Short excerpt..."
          className="w-full text-sm outline-none py-2" style={{ background: 'transparent', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }} />
        <div className="flex gap-3">
          <select value={category} onChange={e => setCategory(e.target.value)} className="flex-1 text-xs px-3 py-2 outline-none" style={{ background: 'var(--paper-warm)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--ink)' }}>
            {['general', 'transfers', 'leagues', 'analysis', 'champions-league', 'premier-league', 'la-liga', 'serie-a', 'bundesliga'].map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={lang} onChange={e => setLang(e.target.value)} className="flex-1 text-xs px-3 py-2 outline-none" style={{ background: 'var(--paper-warm)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--ink)' }}>
            {['fr', 'en', 'ar', 'es'].map(l => <option key={l}>{l.toUpperCase()}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[0.12em] mb-1" style={{ color: 'var(--muted)' }}><Image size={12} className="inline mr-1" />Cover image URL</label>
          <input value={coverUrl} onChange={e => setCoverUrl(e.target.value)} placeholder="https://..."
            className="w-full px-3 py-2 text-sm outline-none" style={{ background: 'var(--paper-warm)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--ink)' }} />
          {coverUrl && <img src={coverUrl} alt="" className="mt-2 h-32 object-cover rounded" onError={e => (e.currentTarget.style.display = 'none')} />}
        </div>
      </div>

      <div className="flex items-center gap-1 px-2 py-2" style={{ background: 'var(--paper-warm)', borderRadius: '8px 8px 0 0', border: '1px solid var(--border)', borderBottom: 'none' }}>
        {tools.map(t => (
          <button key={t.cmd + (t.val || '')} onClick={() => t.cmd === 'createLink' ? (() => { const u = prompt('URL:'); if (u) exec(t.cmd, u); })() : exec(t.cmd, t.val)} className="tb-btn"><t.icon size={16} /></button>
        ))}
      </div>
      <div ref={editorRef} contentEditable className="wysiwyg" suppressContentEditableWarning />

      <div className="flex items-center gap-3 mt-4">
        <button onClick={publish} disabled={publishing}
          className="flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-50"
          style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: '6px' }}>
          {publishing ? <Loader2 size={16} className="animate-spin" /> : published ? <Check size={16} /> : <Send size={16} />}
          {published ? 'Published!' : 'Publish article'}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// SOCIAL TAB
// ============================================================
function SocialTab({ articles }: { articles: any[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [posting, setPosting] = useState<Record<string, boolean>>({});
  const [done, setDone] = useState<Record<string, boolean>>({});

  async function postTo(platform: string) {
    if (!selected) return;
    setPosting(p => ({ ...p, [platform]: true }));
    try {
      await fetch('/api/social', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ articleId: selected, platforms: [platform] }) });
      setDone(d => ({ ...d, [platform]: true }));
      setTimeout(() => setDone(d => ({ ...d, [platform]: false })), 3000);
    } catch {}
    setPosting(p => ({ ...p, [platform]: false }));
  }

  const platforms = [
    { key: 'twitter', label: 'X / Twitter', icon: Twitter },
    { key: 'facebook', label: 'Facebook', icon: Facebook },
    { key: 'instagram', label: 'Instagram', icon: Instagram },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
      <div className="admin-card">
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--muted)' }}>Select article to share</h3>
        </div>
        {articles.slice(0, 10).map((a: any) => (
          <button key={a.id} onClick={() => setSelected(a.id)} className="w-full text-left flex items-center gap-4 px-6 py-3"
            style={{ borderBottom: '1px solid var(--border)', background: a.id === selected ? 'var(--paper-warm)' : 'transparent' }}>
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: a.id === selected ? 'var(--accent)' : 'var(--border)' }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate" style={{ color: 'var(--ink)', fontWeight: a.id === selected ? 700 : 400 }}>{a.title}</p>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{a.lang} · {a.category}</p>
            </div>
          </button>
        ))}
      </div>
      <div className="admin-card p-6 self-start sticky top-28">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] mb-6" style={{ color: 'var(--muted)' }}>Publish to social</h3>
        {!selected ? <p className="text-sm" style={{ color: 'var(--muted)' }}>Select an article first</p> : (
          <div className="space-y-3">
            {platforms.map(p => (
              <button key={p.key} onClick={() => postTo(p.key)} disabled={posting[p.key]}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:opacity-80 disabled:opacity-50"
                style={{ border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--ink)' }}>
                <span className="flex items-center gap-2"><p.icon size={16} /> {p.label}</span>
                {posting[p.key] ? <Loader2 size={14} className="animate-spin" /> : done[p.key] ? <Check size={14} style={{ color: '#0F6E56' }} /> : <Send size={14} style={{ color: 'var(--muted)' }} />}
              </button>
            ))}
            <button onClick={() => platforms.forEach(p => postTo(p.key))}
              className="w-full py-3 text-sm font-bold uppercase tracking-wider hover:opacity-90"
              style={{ background: 'var(--accent)', color: 'white', borderRadius: '6px' }}>Publish everywhere</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// CRON TAB — Live visual, run button, detailed logs
// ============================================================
function CronTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [running, setRunning] = useState(false);
  const [liveLog, setLiveLog] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setLoading(true);
    try {
      const res = await fetch('/api/stats?period=30d');
      const data = await res.json();
      setLogs(data.cronLogs || []);
    } catch {}
    setLoading(false);
  }

  async function runCron() {
    setRunning(true);
    setResult(null);
    setLiveLog(['Starting AI cron...', 'Fetching trending football news...']);

    try {
      const adminPwd = sessionStorage.getItem('fp_admin_pwd') || '';

      // Simulate live updates
      const interval = setInterval(() => {
        setLiveLog(prev => {
          const messages = [
            'Connecting to Groq AI...',
            'Generating article in 4 languages...',
            'Processing news item...',
            'Saving to database...',
            'Checking for duplicates...',
            'Translating content...',
            'Building SEO metadata...',
            'Almost there...',
          ];
          const next = messages[Math.floor(Math.random() * messages.length)];
          if (prev.length < 15 && !prev.includes(next)) return [...prev, next];
          return prev;
        });
      }, 3000);

      const res = await fetch('/api/cron', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPassword: adminPwd }),
      });

      clearInterval(interval);
      const data = await res.json();
      setResult(data);
      setLiveLog(prev => [
        ...prev,
        `Done! ${data.articlesCreated || 0} articles created.`,
        ...(data.errors || []).map((e: string) => `Error: ${e}`),
      ]);
      fetchLogs();
    } catch (e: any) {
      setLiveLog(prev => [...prev, `Fatal error: ${e.message}`]);
      setResult({ error: e.message });
    }
    setRunning(false);
  }

  const statusStyle = (s: string) => {
    if (s === 'success') return { bg: '#E1F5EE', color: '#085041', icon: CheckCircle };
    if (s === 'failed') return { bg: '#FCEBEB', color: '#791F1F', icon: XCircle };
    if (s === 'partial') return { bg: '#FAEEDA', color: '#633806', icon: AlertCircle };
    return { bg: 'var(--paper-warm)', color: 'var(--muted)', icon: Clock };
  };

  return (
    <div className="space-y-6">
      {/* Run button + live terminal */}
      <div className="admin-card overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>AI Article Generator</h3>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>Groq + Gemini fallback · 10 articles per run · 4 languages</p>
          </div>
          <button onClick={runCron} disabled={running}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-50"
            style={{ background: running ? 'var(--muted)' : 'var(--accent)', color: 'white', borderRadius: '6px' }}>
            {running ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
            {running ? 'Running...' : 'Run AI now'}
          </button>
        </div>

        {/* Live terminal */}
        {(running || liveLog.length > 0) && (
          <div className="px-6 py-4" style={{ background: '#0a0a0a', maxHeight: '300px', overflowY: 'auto' }}>
            {liveLog.map((line, i) => (
              <div key={i} className="flex items-start gap-2 py-0.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                <span style={{ color: line.includes('Error') ? '#ef4444' : line.includes('Done') ? '#22c55e' : '#6b7280' }}>
                  {line.includes('Error') ? '✗' : line.includes('Done') ? '✓' : '›'}
                </span>
                <span style={{ color: line.includes('Error') ? '#fca5a5' : line.includes('Done') ? '#86efac' : '#d1d5db' }}>{line}</span>
              </div>
            ))}
            {running && (
              <div className="flex items-center gap-2 py-1 mt-1">
                <div className="w-2 h-2 rounded-full" style={{ background: '#22c55e', animation: 'pulseDot 1s ease infinite' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#6b7280' }}>Processing...</span>
              </div>
            )}
          </div>
        )}

        {/* Result summary */}
        {result && !running && (
          <div className="px-6 py-4" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="flex items-center gap-6">
              <div>
                <div className="text-2xl font-bold font-display" style={{ color: result.articlesCreated > 0 ? '#0F6E56' : 'var(--accent)' }}>{result.articlesCreated || 0}</div>
                <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Articles created</div>
              </div>
              {result.errors?.length > 0 && (
                <div>
                  <div className="text-2xl font-bold font-display" style={{ color: 'var(--accent)' }}>{result.errors.length}</div>
                  <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Errors</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Cron history */}
      <div className="admin-card">
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--muted)' }}>Cron history</h3>
        </div>
        {loading ? (
          <div className="p-10 text-center"><Loader2 size={20} className="animate-spin mx-auto" /></div>
        ) : logs.length === 0 ? (
          <div className="p-10 text-center text-sm" style={{ color: 'var(--muted)' }}>No cron runs yet</div>
        ) : (
          logs.map((log: any) => {
            const s = statusStyle(log.status);
            const Icon = s.icon;
            const duration = log.finished_at ? Math.round((new Date(log.finished_at).getTime() - new Date(log.started_at).getTime()) / 1000) : null;
            return (
              <div key={log.id} className="flex items-center gap-4 px-6 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ background: s.bg }}>
                  <Icon size={14} style={{ color: s.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{log.articles_created} articles</span>
                    {log.details?.errors?.length > 0 && (
                      <span className="text-[10px]" style={{ color: 'var(--accent)' }}>{log.details.errors.length} errors</span>
                    )}
                  </div>
                  <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                    {new Date(log.started_at).toLocaleString()}
                    {duration !== null && ` · ${duration}s`}
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-1 rounded" style={{ background: s.bg, color: s.color }}>{log.status}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}