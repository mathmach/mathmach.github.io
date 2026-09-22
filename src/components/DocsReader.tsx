import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, BookOpen, Clock, Loader2, Menu, X } from 'lucide-react';
import { marked } from 'marked';
import hljs from 'highlight.js';
import katex from 'katex';
import { DOCS_INDEX } from '../docsData';

interface DocsReaderProps {
  lang: 'en' | 'pt' | 'es';
}

function parseMarkdownWithMath(markdown: string): string {
  const mathPlaceholders: string[] = [];

  let text = markdown.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    try {
      const rendered = katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
      mathPlaceholders.push(`<div class="my-4 overflow-x-auto text-center py-2 bg-black/20 rounded-lg">${rendered}</div>`);
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

  return html;
}

export const DocsReader: React.FC<DocsReaderProps> = ({ lang }) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(DOCS_INDEX[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cache, setCache] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);
  const articleRef = useRef<HTMLDivElement>(null);
  const readerTopRef = useRef<HTMLDivElement>(null);

  const selectedDoc = useMemo(() => {
    return DOCS_INDEX.find(d => d.id === selectedDocId) || DOCS_INDEX[0];
  }, [selectedDocId]);

  const filteredDocs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return DOCS_INDEX;
    return DOCS_INDEX.filter(d =>
      d.title.toLowerCase().includes(q) ||
      d.subtitle.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q) ||
      d.highlights.some(h => h.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const architectureDocs = useMemo(() => {
    return filteredDocs.filter(d => d.category === 'Architecture');
  }, [filteredDocs]);

  const foundationDocs = useMemo(() => {
    return filteredDocs.filter(d => d.category === 'Foundation');
  }, [filteredDocs]);

  useEffect(() => {
    const fetchDoc = async () => {
      if (cache[selectedDoc.file]) {
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/docs/${selectedDoc.file}`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const text = await res.text();
        setCache(prev => ({ ...prev, [selectedDoc.file]: text }));
      } catch (err: any) {
        setError(err.message || 'Failed to load document');
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [selectedDoc.file, cache]);

  const renderedHtml = useMemo(() => {
    const raw = cache[selectedDoc.file];
    if (!raw) return '';
    return parseMarkdownWithMath(raw);
  }, [cache, selectedDoc.file]);

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

  const uiText = {
    en: {
      searchPlaceholder: 'Search architecture topics...',
      archTitle: 'ARCHITECTURE',
      foundationTitle: 'FOUNDATION',
      standard: 'STANDARD',
      loading: 'Loading document...',
      topicsBtn: 'Browse Topics',
      academicTitle: 'Academic Background & Certifications'
    },
    pt: {
      searchPlaceholder: 'Buscar tópicos de arquitetura...',
      archTitle: 'ARQUITETURA',
      foundationTitle: 'FUNDAMENTOS',
      standard: 'PADRÃO',
      loading: 'Carregando documento...',
      topicsBtn: 'Navegar por Tópicos',
      academicTitle: 'Formação Acadêmica & Certificações'
    },
    es: {
      searchPlaceholder: 'Buscar temas de arquitectura...',
      archTitle: 'ARQUITECTURA',
      foundationTitle: 'FUNDAMENTOS',
      standard: 'ESTÁNDAR',
      loading: 'Cargando documento...',
      topicsBtn: 'Explorar Temas',
      academicTitle: 'Formación Académica & Certificaciones'
    }
  }[lang];

  return (
    <div ref={readerTopRef} className="w-full">
      {/* Mobile Topic Selector Bar */}
      <div className="md:hidden mb-4 flex items-center justify-between p-3 rounded-2xl glass-card border border-[var(--card-border)]">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen size={16} className="text-[#0369a1] dark:text-[#00f2fe] shrink-0" />
          <span className="text-xs font-semibold truncate">{selectedDoc.title}</span>
        </div>
        <button
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--text-color)] text-[var(--bg-color)] text-xs font-bold"
        >
          {mobileDrawerOpen ? <X size={14} /> : <Menu size={14} />}
          <span>{uiText.topicsBtn}</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="glass-card rounded-3xl border border-[var(--card-border)] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[680px] lg:min-h-[720px]">
        {/* Sidebar */}
        <aside
          className={`${
            mobileDrawerOpen ? 'flex' : 'hidden'
          } md:flex flex-col w-full md:w-72 lg:w-80 shrink-0 border-b md:border-b-0 md:border-r border-[var(--card-border)] bg-[var(--card-bg)]/40 p-4 sm:p-5`}
        >
          {/* Search Input */}
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={uiText.searchPlaceholder}
              className="w-full bg-[var(--bg-color)]/70 border border-[var(--card-border)] rounded-xl pl-9 pr-3 py-2 text-xs placeholder:text-muted focus:outline-none focus:border-[#0369a1] dark:focus:border-[#00f2fe] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-[var(--text-color)] text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* Navigation Groups List */}
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
                        onClick={() => handleSelectDoc(doc.id)}
                        className={`w-full flex items-center justify-between gap-2 text-left px-3 py-2.5 rounded-xl transition-all ${
                          isActive
                            ? 'bg-[#0369a1]/15 dark:bg-[#00f2fe]/15 border border-[#0369a1]/40 dark:border-[#00f2fe]/40 text-[#0369a1] dark:text-[#00f2fe] font-semibold'
                            : 'hover:bg-[var(--card-bg)] text-[var(--text-color)]/80 hover:text-[var(--text-color)]'
                        }`}
                      >
                        <span className="text-xs line-clamp-1 leading-snug">{doc.title}</span>
                        <span
                          className={`text-[10px] font-mono shrink-0 px-1.5 py-0.5 rounded border ${
                            isActive
                              ? 'border-[#0369a1]/40 dark:border-[#00f2fe]/40 text-[#0369a1] dark:text-[#00f2fe]'
                              : 'border-[var(--card-border)] text-muted'
                          }`}
                        >
                          {doc.readTime}
                        </span>
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
                        onClick={() => handleSelectDoc(doc.id)}
                        className={`w-full flex items-center justify-between gap-2 text-left px-3 py-2.5 rounded-xl transition-all ${
                          isActive
                            ? 'bg-[#0369a1]/15 dark:bg-[#00f2fe]/15 border border-[#0369a1]/40 dark:border-[#00f2fe]/40 text-[#0369a1] dark:text-[#00f2fe] font-semibold'
                            : 'hover:bg-[var(--card-bg)] text-[var(--text-color)]/80 hover:text-[var(--text-color)]'
                        }`}
                      >
                        <span className="text-xs line-clamp-1 leading-snug">{doc.title}</span>
                        <span
                          className={`text-[10px] font-mono shrink-0 px-1.5 py-0.5 rounded border ${
                            isActive
                              ? 'border-[#0369a1]/40 dark:border-[#00f2fe]/40 text-[#0369a1] dark:text-[#00f2fe]'
                              : 'border-[var(--card-border)] text-muted'
                          }`}
                        >
                          {doc.readTime}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Content Viewer Panel */}
        <main className="flex-1 flex flex-col min-w-0 bg-[var(--bg-color)]/30 p-5 sm:p-8 lg:p-10">
          {/* Header */}
          <div className="border-b border-[var(--card-border)] pb-5 mb-6">
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-[#0369a1] dark:text-[#00f2fe] mb-2">
              <span>{selectedDoc.category} {uiText.standard}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                <span>{selectedDoc.readTime}</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-['Syne'] tracking-tight mb-2">
              {selectedDoc.title}
            </h1>
            <p className="text-xs sm:text-sm text-muted">
              {selectedDoc.subtitle}
            </p>
          </div>

          {/* Body Viewer */}
          <div className="flex-1 overflow-y-auto max-h-[550px] lg:max-h-[620px] pr-2 custom-scrollbar">
            {loading && (
              <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted">
                <Loader2 size={24} className="animate-spin text-[#0369a1] dark:text-[#00f2fe]" />
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
                className="docs-markdown"
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
