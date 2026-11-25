/* =============================================
   TEAM PERIKAPSILIO — MAIN JS
   ============================================= */

// ── BASE PATH DETECTION (works at root / and subpages /events/ etc.) ──
const SITE_BASE = (() => {
  const scripts = document.getElementsByTagName('script');
  for (const s of scripts) {
    const src = s.getAttribute('src') || '';
    if (src.endsWith('main.js')) {
      return src.slice(0, -'main.js'.length);
    }
  }
  return '';
})();

// ── HTML ESCAPE ──
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function resolveMediaUrl(url) {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:')) return trimmed;
  return SITE_BASE + trimmed.replace(/^\/+/, '');
}

function getYouTubeEmbedUrl(url) {
  const m = String(url).match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

function renderMediaItem(item) {
  if (!item) return '';
  const rawSrc = (item.file || item.url || '').trim();
  if (!rawSrc) return '';
  const kind = (item.kind || '').toLowerCase();
  const caption = item.caption ? `<figcaption class="article-media-cap vt">${escapeHtml(item.caption)}</figcaption>` : '';

  const yt = getYouTubeEmbedUrl(rawSrc);
  if (yt || kind.includes('youtube') || kind.includes('embed')) {
    const embedSrc = yt || (/^https?:\/\//i.test(rawSrc) ? rawSrc : '');
    if (!embedSrc) return '';
    return `
      <figure class="article-media-item">
        <div class="article-video-wrap">
          <iframe src="${escapeHtml(embedSrc)}" title="${escapeHtml(item.caption || 'Video')}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
        ${caption}
      </figure>`;
  }

  const src = escapeHtml(resolveMediaUrl(rawSrc));
  if (kind.includes('video') || /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(rawSrc)) {
    return `
      <figure class="article-media-item">
        <video class="article-video" controls playsinline preload="metadata" src="${src}"></video>
        ${caption}
      </figure>`;
  }

  return `
    <figure class="article-media-item">
      <img class="article-img" src="${src}" alt="${escapeHtml(item.caption || 'Article media')}" loading="lazy">
      ${caption}
    </figure>`;
}

function formatRichText(str) {
  if (!str) return '';
  const lines = String(str).replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let inList = false;

  const inlineMd = (text) => {
    let s = escapeHtml(text);
    s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, src) => `<img class="article-inline-img" src="${escapeHtml(resolveMediaUrl(src))}" alt="${alt}" loading="lazy">`);
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="article-inline-link">$1</a>');
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    return s;
  };

  for (const line of lines) {
    const t = line.trim();
    if (!t) {
      if (inList) { out.push('</ul>'); inList = false; }
      continue;
    }
    if (t.startsWith('### ')) {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push(`<h3>${inlineMd(t.slice(4))}</h3>`);
    } else if (t.startsWith('## ')) {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push(`<h2>${inlineMd(t.slice(3))}</h2>`);
    } else if (t.startsWith('# ')) {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push(`<h2>${inlineMd(t.slice(2))}</h2>`);
    } else if (/^[-*]\s+/.test(t)) {
      if (!inList) { out.push('<ul class="article-list">'); inList = true; }
      out.push(`<li>${inlineMd(t.replace(/^[-*]\s+/, ''))}</li>`);
    } else {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push(`<p>${inlineMd(t)}</p>`);
    }
  }
  if (inList) out.push('</ul>');
  return out.join('');
}

// ── STARS ──
function initStars() {
  const container = document.getElementById('hero-stars');
  if (!container) return;
  for (let i = 0; i < 80; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() < 0.7 ? 2 : 3;
    s.style.cssText = `
      width:${size}px;height:${size}px;
      top:${Math.random()*100}%;left:${Math.random()*100}%;
      --dur:${1.5+Math.random()*3}s;
      --delay:${Math.random()*3}s;
    `;
    container.appendChild(s);
  }
}

// ── HAMBURGER ──
function initHamburger() {
  const btn = document.getElementById('hamburger');
  const nav = document.getElementById('nav-links');
  if (!btn || !nav) return;

  function closeMenu() {
    nav.classList.remove('open');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function openMenu() {
    nav.classList.add('open');
    btn.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden'; // prevent scroll behind overlay
  }

  btn.addEventListener('click', () => {
    const isOpen = nav.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  // Close when a nav link is tapped
  nav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });
}

// ── BACK TO TOP ──
function initBackTop() {
  const btn = document.createElement('button');
  btn.className = 'back-top press';
  btn.textContent = '▲ TOP';
  btn.setAttribute('aria-label', 'Back to top');
  document.body.appendChild(btn);
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ── INTERSECTION OBSERVER ANIMATIONS ──
function initScrollReveal() {
  if (!('IntersectionObserver' in window)) return;
  const cards = document.querySelectorAll('.card, .member-card, .board-card, .stat-box, .value-item, .contact-item');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = '';
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  cards.forEach((c, idx) => {
    if (c.dataset.revealInit) return;
    c.dataset.revealInit = '1';
    c.style.opacity = '0';
    c.style.transform = 'translateY(20px)';
    c.style.transition = `opacity 0.4s ease ${(idx % 6) * 60}ms, transform 0.4s ease ${(idx % 6) * 60}ms, border-color 0.2s, box-shadow 0.2s, background 0.2s`;
    io.observe(c);
  });
}

// ── FORMAT DATE ──
function formatDate(dateStr) {
  if (!dateStr) return 'TBA';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return escapeHtml(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
}

// ── RENDER HELPERS ──
function renderEventCard(item) {
  const a = item.attributes;
  const slug = encodeURIComponent(a.slug || item.id);
  return `
    <article class="card card-event" onclick="window.location='${SITE_BASE}events/?slug=${slug}'">
      <span class="card-badge">${escapeHtml(a.type || 'EVENT')}</span>
      <h3 class="card-title">${escapeHtml(a.title)}</h3>
      <p class="card-meta"><span class="icon">📅</span> ${formatDate(a.date)}</p>
      <p class="card-meta"><span class="icon">📍</span> ${escapeHtml(a.location || 'TBA')}</p>
      <p class="card-desc vt">${escapeHtml(a.description || '')}</p>
      <span class="card-link press">DETAILS →</span>
    </article>`;
}

function renderTournamentCard(item) {
  const a = item.attributes;
  const status = (a.status || 'UPCOMING').toUpperCase();
  const statusColor = status === 'ACTIVE' ? 'var(--accent3)' : status === 'COMPLETED' ? 'var(--text-dim)' : 'var(--accent2)';
  const slug = encodeURIComponent(a.slug || item.id);
  return `
    <article class="card card-tourney" onclick="window.location='${SITE_BASE}tournaments/?slug=${slug}'">
      <span class="card-badge" style="background:${statusColor}">${escapeHtml(status)}</span>
      <h3 class="card-title">${escapeHtml(a.name)}</h3>
      <p class="card-meta"><span class="icon">🎮</span> ${escapeHtml(a.game || 'TBA')}</p>
      <p class="card-meta"><span class="icon">🏆</span> ${escapeHtml(a.prize || 'TBA')}</p>
      <p class="card-meta"><span class="icon">📅</span> ${formatDate(a.startDate)} – ${formatDate(a.endDate)}</p>
      <span class="card-link press">VIEW →</span>
    </article>`;
}

function renderNewsCard(item) {
  const a = item.attributes;
  const slug = encodeURIComponent(a.slug || item.id);
  const authorMeta = a.author ? `<p class="card-meta"><span class="icon">✍️</span> ${escapeHtml(a.author)}</p>` : '';
  return `
    <article class="card card-news" onclick="window.location='${SITE_BASE}news/?slug=${slug}'">
      <span class="card-badge">${escapeHtml(a.category || 'NEWS')}</span>
      <h3 class="card-title">${escapeHtml(a.title)}</h3>
      <p class="card-meta"><span class="icon">📰</span> ${formatDate(a.publishedAt)}</p>
      ${authorMeta}
      <p class="card-desc vt">${escapeHtml(a.summary || '')}</p>
      <span class="card-link press">READ →</span>
    </article>`;
}

function renderEmpty(msg = 'NO DATA YET') {
  return `<div class="empty-state"><span class="press">${escapeHtml(msg)}</span><p class="vt">Check back soon for updates.</p></div>`;
}

// ── HOME PAGE LOADERS ──
async function loadHomeEvents() {
  const container = document.getElementById('home-events');
  if (!container) return;
  const data = await API.getEvents({ pageSize: 3, sort: 'date:asc' });
  if (!data || !data.data || !data.data.length) {
    container.innerHTML = renderEmpty('NO EVENTS YET');
    return;
  }
  container.innerHTML = data.data.map(renderEventCard).join('');
  initScrollReveal();
}

async function loadHomeTournaments() {
  const container = document.getElementById('home-tournaments');
  if (!container) return;
  const data = await API.getTournaments({ pageSize: 3 });
  if (!data || !data.data || !data.data.length) {
    container.innerHTML = renderEmpty('NO TOURNAMENTS YET');
    return;
  }
  container.innerHTML = data.data.map(renderTournamentCard).join('');
  initScrollReveal();
}

async function loadHomeNews() {
  const container = document.getElementById('home-news');
  if (!container) return;
  const data = await API.getNews({ pageSize: 3 });
  if (!data || !data.data || !data.data.length) {
    container.innerHTML = renderEmpty('NO NEWS YET');
    return;
  }
  container.innerHTML = data.data.map(renderNewsCard).join('');
  initScrollReveal();
}

// ── ACTIVE NAV LINK ──
function initActiveNav() {
  const segments = location.pathname.replace(/\/index\.html$/, '/').split('/').filter(Boolean);
  const currentSection = segments.length ? segments[segments.length - 1] : '';
  const knownSections = ['events', 'tournaments', 'news', 'about', 'members', 'contact'];
  const activeKey = knownSections.includes(currentSection) ? currentSection : 'home';

  document.querySelectorAll('.nav-link').forEach(link => {
    const label = link.textContent.trim().toLowerCase();
    link.classList.toggle('active', label === activeKey);
  });
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  initStars();
  initHamburger();
  initBackTop();
  initActiveNav();

  // Home page sections
  loadHomeEvents();
  loadHomeTournaments();
  loadHomeNews();
});

// Expose for inner pages
window.PERI = {
  SITE_BASE,
  escapeHtml,
  resolveMediaUrl,
  renderMediaItem,
  formatRichText,
  formatDate,
  renderEventCard,
  renderTournamentCard,
  renderNewsCard,
  renderEmpty,
  initScrollReveal,
  initHamburger,
  initBackTop,
};
