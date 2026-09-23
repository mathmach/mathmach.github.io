import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, BookOpen, Clock, Loader2, Menu, X } from 'lucide-react';
import { marked } from 'marked';
import hljs from 'highlight.js';
import katex from 'katex';
import { translations } from '../../i18n';
import { getDocsIndex } from '../../docsData';
import { GlassSurface } from '../../components/ui/GlassSurface';
import { LiquidButton } from '../../components/ui/LiquidButton';
import { LiquidPill } from '../../components/ui/LiquidPill';

interface DocsReaderProps {
  lang: 'en' | 'pt' | 'es';
}

function parseMarkdownWithMath(markdown: string): string {
  const mathPlaceholders: string[] = [];

  let text = markdown.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    try {
      const rendered = katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
      mathPlaceholders.push(`<div class="my-4 overflow-x-auto text-center py-2.5 px-3 rounded-xl border border-[var(--card-border)] bg-[var(--glass-tint)]">${rendered}</div>`);
      return `%%MATH_BLOCK_${mathPlaceholders.length - 1}%%`;
    } catch {
      return `$$${math}$$`;
    }
  });

  text = text.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
    try {
      const rendered = katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
      mathPlaceholders.push(`<span class="inline-math">${rendered}</span>`);
      return `%%MATH_INLINE_${mathPlaceholders.length - 1}%%`;
    } catch {
      return `$${math}$`;
    }
  });

  let html = marked.parse(text, { async: false, breaks: true, gfm: true }) as string;

  html = html.replace(/%%MATH_BLOCK_(\d+)%%/g, (_, id) => mathPlaceholders[Number(id)] || '');
  html = html.replace(/%%MATH_INLINE_(\d+)%%/g, (_, id) => mathPlaceholders[Number(id)] || '');
  html = html.replace(/<table(?:\s+[^>]*)?>[\s\S]*?<\/table>/gi, (match) => {
    return `<div class="docs-table-wrapper custom-scrollbar">${match}</div>`;
  });

  return html;
}

export const DocsReader: React.FC<DocsReaderProps> = ({ lang }) => {
  const docsList = useMemo(() => getDocsIndex(lang), [lang]);
  const [selectedDocId, setSelectedDocId] = useState<string>(docsList[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cache, setCache] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);
  const articleRef = useRef<HTMLDivElement>(null);
  const readerTopRef = useRef<HTMLDivElement>(null);

  const selectedDoc = useMemo(() => {
    return docsList.find(d => d.id === selectedDocId) || docsList[0];
  }, [docsList, selectedDocId]);

  const filteredDocs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return docsList;
    return docsList.filter(d =>
      d.title.toLowerCase().includes(q) ||
      d.subtitle.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q) ||
      d.highlights.some(h => h.toLowerCase().includes(q))
    );
  }, [docsList, searchQuery]);

  const architectureDocs = useMemo(() => {
    return filteredDocs.filter(d => d.category === 'Architecture');
  }, [filteredDocs]);

  const foundationDocs = useMemo(() => {
    return filteredDocs.filter(d => d.category === 'Foundation');
  }, [filteredDocs]);

  const cacheKey = `${lang}:${selectedDoc.file}`;

  useEffect(() => {
    const fetchDoc = async () => {
      if (cache[cacheKey]) {
        return;
      }
      setLoading(true);
      setError(null);
      try {
        let res = await fetch(`/docs/${lang}/${selectedDoc.file}`);
        if (!res.ok) {
          res = await fetch(`/docs/en/${selectedDoc.file}`);
          if (!res.ok) {
            res = await fetch(`/docs/${selectedDoc.file}`);
          }
        }
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const text = await res.text();
        setCache(prev => ({ ...prev, [cacheKey]: text }));
      } catch (err: any) {
        setError(err.message || 'Failed to load document');
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [cacheKey, cache, lang, selectedDoc.file]);

  const renderedHtml = useMemo(() => {
    const raw = cache[cacheKey];
    if (!raw) return '';
    return parseMarkdownWithMath(raw);
  }, [cache, cacheKey]);

  useEffect(() => {
    if (articleRef.current && renderedHtml) {
      articleRef.current.querySelectorAll('pre code').forEach(block => {
        hljs.highlightElement(block as HTMLElement);
      });
    }
  }, [renderedHtml]);

  const handleSelectDoc = (docId: string) => {
    setSelectedDocId(docId);
    setMobileDrawerOpen(false);
    if (readerTopRef.current) {
      readerTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const uiText = translations[lang].docsReader;

  return (
    <div ref={readerTopRef} className="w-full">

      <GlassSurface
        borderRadius={16}
        backgroundOpacity={0.55}
        blur={16}
        className="md:hidden w-full mb-4 p-3 border border-[var(--card-border)]"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <BookOpen size={16} className="text-[var(--accent)] shrink-0" />
            <span className="text-xs font-semibold line-clamp-2 leading-snug">{selectedDoc.title}</span>
          </div>
          <LiquidButton
            variant="glass"
            size="sm"
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="shrink-0 gap-1.5 whitespace-nowrap"
          >
            {mobileDrawerOpen ? <X size={14} /> : <Menu size={14} />}
            <span>{uiText.topicsBtn}</span>
          </LiquidButton>
        </div>
      </GlassSurface>

      <GlassSurface
        borderRadius={24}
        backgroundOpacity={0.45}
        blur={24}
        saturation={1.8}
        brightness={1.04}
        borderWidth={1}
        className="w-full shadow-2xl"
      >
        <div className="flex flex-col md:flex-row min-h-[680px] lg:min-h-[720px]">
          <aside
            className={`${
              mobileDrawerOpen ? 'flex' : 'hidden'
            } md:flex flex-col w-full md:w-72 lg:w-80 shrink-0 border-b md:border-b-0 md:border-r border-[var(--card-border)] bg-[var(--glass-tint)] p-4 sm:p-5`}
          >
          
          <div className="relative mb-4 rounded-xl liquid-input">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={uiText.searchPlaceholder}
              className="w-full bg-transparent pl-9 pr-8 py-2 text-xs placeholder:text-muted focus:outline-none text-[var(--text-color)]"
            />
            {searchQuery && (
              <LiquidButton
                variant="clearGlass"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 p-0 text-muted hover:text-[var(--text-color)] text-xs"
                aria-label="Clear search"
              >
                ×
              </LiquidButton>
            )}
          </div>

          
          <div className="flex-1 overflow-y-auto space-y-5 pr-1 max-h-[420px] md:max-h-[600px] custom-scrollbar">
            {architectureDocs.length > 0 && (
              <div>
                <div className="text-[10px] font-bold tracking-widest text-muted uppercase px-2 mb-2">
                  {uiText.archTitle}
                </div>
                <div className="space-y-1">
                  {architectureDocs.map(doc => {
                    const isActive = doc.id === selectedDocId;
                    return (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => handleSelectDoc(doc.id)}
                        className={`w-full flex items-center justify-between gap-2 text-left px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                          isActive
                            ? 'liquid-pill-accent font-semibold shadow-sm'
                            : 'hover:bg-[var(--glass-tint-hover)] text-secondary hover:text-[var(--text-color)]'
                        }`}
                      >
                        <span className="text-xs line-clamp-1 leading-snug">{doc.title}</span>
                        <LiquidPill
                          variant={isActive ? 'accent' : 'outline'}
                          size="sm"
                          className="shrink-0"
                        >
                          {doc.readTime}
                        </LiquidPill>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {foundationDocs.length > 0 && (
              <div>
                <div className="text-[10px] font-bold tracking-widest text-muted uppercase px-2 mb-2">
                  {uiText.foundationTitle}
                </div>
                <div className="space-y-1">
                  {foundationDocs.map(doc => {
                    const isActive = doc.id === selectedDocId;
                    return (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => handleSelectDoc(doc.id)}
                        className={`w-full flex items-center justify-between gap-2 text-left px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                          isActive
                            ? 'liquid-pill-accent font-semibold shadow-sm'
                            : 'hover:bg-[var(--glass-tint-hover)] text-secondary hover:text-[var(--text-color)]'
                        }`}
                      >
                        <span className="text-xs line-clamp-1 leading-snug">{doc.title}</span>
                        <LiquidPill
                          variant={isActive ? 'accent' : 'outline'}
                          size="sm"
                          className="shrink-0"
                        >
                          {doc.readTime}
                        </LiquidPill>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </aside>

        
        <main className="flex-1 flex flex-col min-w-0 p-5 sm:p-8 lg:p-10">
          
          <div className="border-b border-[var(--card-border)] pb-5 mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <LiquidPill variant="accent" size="sm" className="font-mono uppercase tracking-wider">
                {selectedDoc.category} {uiText.standard}
              </LiquidPill>
              <LiquidPill variant="outline" size="sm" className="font-mono flex items-center gap-1.5">
                <Clock size={12} />
                <span>{selectedDoc.readTime}</span>
              </LiquidPill>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-['Syne'] tracking-tight mb-2">
              {selectedDoc.title}
            </h1>
            <p className="text-xs sm:text-sm text-muted">
              {selectedDoc.subtitle}
            </p>
          </div>

          
          <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 max-w-full max-h-[550px] lg:max-h-[620px] pr-2 custom-scrollbar">
            {loading && (
              <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted">
                <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
                <span className="text-xs">{uiText.loading}</span>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5 text-red-500 text-xs">
                <p className="font-bold mb-1">Error loading document</p>
                <p>{error}</p>
              </div>
            )}

            {!loading && !error && renderedHtml && (
              <article
                ref={articleRef}
                className="docs-markdown min-w-0 max-w-full"
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />
            )}
          </div>
        </main>
      </div>
    </GlassSurface>
  </div>
);
};
