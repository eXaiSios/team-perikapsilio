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

function formatRichText(str) {
  if (!str) return '';
  return escapeHtml(str)
    .split(/\n{2,}/)
    .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('');
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
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
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

// ── DETAIL MODAL ──
function closeModal() {
  const existing = document.getElementById('peri-modal-backdrop');
  if (existing) existing.remove();
  if (location.hash) {
    history.replaceState(null, '', location.pathname + location.search);
  }
}

function openModal({ badge = '', badgeColor = 'var(--accent)', title = '', meta = [], body = '' }) {
  closeModal();
  const backdrop = document.createElement('div');
  backdrop.id = 'peri-modal-backdrop';
  backdrop.className = 'peri-modal-backdrop';
  backdrop.innerHTML = `
    <div class="peri-modal" role="dialog" aria-modal="true">
      <button class="peri-modal-close" aria-label="Close modal">✕</button>
      ${badge ? `<span class="card-badge" style="background:${badgeColor}">${escapeHtml(badge)}</span>` : ''}
      <h2 class="peri-modal-title">${escapeHtml(title)}</h2>
      ${meta.length ? `<div class="peri-modal-meta">${meta.map(m => `<span>${m}</span>`).join('')}</div>` : ''}
      <div class="peri-modal-body vt">${formatRichText(body) || '<p>No additional details available.</p>'}</div>
    </div>
  `;
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });
  backdrop.querySelector('.peri-modal-close').addEventListener('click', closeModal);
  document.body.appendChild(backdrop);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ── RENDER HELPERS ──
function renderEventCard(item) {
  const a = item.attributes;
  const slug = encodeURIComponent(a.slug || item.id);
  return `
    <article class="card card-event" onclick="window.location='${SITE_BASE}events/#${slug}'">
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
    <article class="card card-tourney" onclick="window.location='${SITE_BASE}tournaments/#${slug}'">
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
  return `
    <article class="card card-news" onclick="window.location='${SITE_BASE}news/#${slug}'">
      <span class="card-badge">${escapeHtml(a.category || 'NEWS')}</span>
      <h3 class="card-title">${escapeHtml(a.title)}</h3>
      <p class="card-meta"><span class="icon">📰</span> ${formatDate(a.publishedAt)}</p>
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
  formatDate,
  openModal,
  closeModal,
  renderEventCard,
  renderTournamentCard,
  renderNewsCard,
  renderEmpty,
  initScrollReveal,
  initHamburger,
  initBackTop,
};
