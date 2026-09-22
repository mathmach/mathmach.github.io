import { REFERENCES } from './references-data.js';
import { DOCS_INDEX } from './docs-index.js';

class App {
  constructor() {
    this.currentDocId = DOCS_INDEX[0].id;
    this.isAuditing = false;
    this.init();
  }

  init() {
    this.initNav();
    this.initDocsPortal();
    this.initMetrics();
  }

  initNav() {
    const navLinks = document.querySelectorAll('.nav-item a');
    const sections = document.querySelectorAll('section[id]');

    const onScroll = () => {
      const scrollPos = window.scrollY + 200;
      sections.forEach(sec => {
        const top = sec.offsetTop;
        const height = sec.offsetHeight;
        const id = sec.getAttribute('id');
        if (scrollPos >= top && scrollPos < top + height) {
          navLinks.forEach(link => {
            link.parentElement.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  initMetrics() {
    const statCounter = document.getElementById('metric-ref-count');
    if (statCounter) {
      statCounter.textContent = REFERENCES.length;
    }
  }

  initDocsPortal() {
    const listEl = document.getElementById('docs-nav-list');
    const searchInput = document.getElementById('docs-search');
    if (!listEl) return;

    const renderList = (items) => {
      listEl.innerHTML = '';
      const groups = {
        Architecture: items.filter(d => d.category === 'Architecture'),
        Foundation: items.filter(d => d.category === 'Foundation')
      };

      for (const [groupName, groupItems] of Object.entries(groups)) {
        if (groupItems.length === 0) continue;

        const groupHeader = document.createElement('div');
        groupHeader.className = 'docs-nav-group-title';
        groupHeader.textContent = groupName;
        listEl.appendChild(groupHeader);

        groupItems.forEach(doc => {
          const btn = document.createElement('button');
          btn.className = `docs-nav-btn ${doc.id === this.currentDocId ? 'active' : ''}`;
          btn.dataset.id = doc.id;
          btn.innerHTML = `
            <span>${doc.title}</span>
            <span style="font-size: 10px; opacity: 0.6; font-family: monospace;">${doc.readTime}</span>
          `;
          btn.addEventListener('click', () => this.loadDocument(doc.id));
          listEl.appendChild(btn);
        });
      }
    };

    renderList(DOCS_INDEX);

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const filtered = DOCS_INDEX.filter(d => 
          d.title.toLowerCase().includes(query) || 
          d.subtitle.toLowerCase().includes(query) ||
          d.highlights.some(h => h.toLowerCase().includes(query))
        );
        renderList(filtered);
      });
    }

    
    this.loadDocument(this.currentDocId);
  }

  async loadDocument(docId) {
    this.currentDocId = docId;
    const doc = DOCS_INDEX.find(d => d.id === docId);
    if (!doc) return;

    
    document.querySelectorAll('.docs-nav-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.id === docId);
    });

    const viewer = document.getElementById('docs-viewer');
    if (!viewer) return;

    viewer.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 300px; color: var(--text-muted);">
        <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
          <div class="badge-dot" style="width: 12px; height: 12px;"></div>
          <span>Loading ${doc.title}...</span>
        </div>
      </div>
    `;

    try {
      const resp = await fetch(doc.file);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const md = await resp.text();

      
      let html = typeof window.marked !== 'undefined' ? window.marked.parse(md) : `<pre>${md}</pre>`;
      
      viewer.innerHTML = `
        <article class="docs-article">
          <div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--border-hairline);">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-accent); text-transform: uppercase; margin-bottom: 6px;">${doc.category} Standard • ${doc.readTime}</div>
            <p style="color: var(--text-secondary); margin: 0;">${doc.subtitle}</p>
          </div>
          ${html}
        </article>
      `;

      
      if (window.hljs) {
        viewer.querySelectorAll('pre code').forEach((block) => {
          window.hljs.highlightElement(block);
        });
      }

      
      if (window.renderMathInElement) {
        window.renderMathInElement(viewer, {
          delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false},
            {left: '\\[', right: '\\]', display: true},
            {left: '\\(', right: '\\)', display: false}
          ],
          throwOnError: false
        });
      }
    } catch (err) {
      viewer.innerHTML = `
        <div style="padding: 24px; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; background: rgba(239, 68, 68, 0.05);">
          <h3 style="color: #f87171; margin-bottom: 8px;">Document Load Error</h3>
          <p style="color: var(--text-secondary); font-size: 13px;">Failed to fetch <code>${doc.file}</code>: ${err.message}</p>
        </div>
      `;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new App();
});

