/* =============================================
   TEAM PERIKAPSILIO — MAIN JS
   ============================================= */

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
  const cards = document.querySelectorAll('.card, .member-card, .stat-box, .value-item, .contact-item');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = e.target.style.transform.replace('translateY(20px)', 'translateY(0)');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  cards.forEach(c => {
    c.style.opacity = '0';
    c.style.transform = (c.style.transform || '') + ' translateY(20px)';
    c.style.transition = 'opacity 0.4s ease, transform 0.4s ease, border-color 0.2s';
    io.observe(c);
  });
}

// ── FORMAT DATE ──
function formatDate(dateStr) {
  if (!dateStr) return '???';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
}

// ── RENDER HELPERS ──
function renderEventCard(item) {
  const a = item.attributes;
  return `
    <article class="card card-event" onclick="window.location='events.html#${a.slug || item.id}'">
      <span class="card-badge">${a.type || 'EVENT'}</span>
      <h3 class="card-title">${a.title}</h3>
      <p class="card-meta"><span class="icon">📅</span> ${formatDate(a.date)}</p>
      <p class="card-meta"><span class="icon">📍</span> ${a.location || 'TBA'}</p>
      <p class="card-desc vt">${a.description || ''}</p>
      <span class="card-link press">DETAILS →</span>
    </article>`;
}

function renderTournamentCard(item) {
  const a = item.attributes;
  const statusColor = a.status === 'ACTIVE' ? 'var(--accent3)' : a.status === 'COMPLETED' ? 'var(--text-dim)' : 'var(--accent2)';
  return `
    <article class="card card-tourney" onclick="window.location='tournaments.html#${a.slug || item.id}'">
      <span class="card-badge" style="background:${statusColor}">${a.status || 'UPCOMING'}</span>
      <h3 class="card-title">${a.name}</h3>
      <p class="card-meta"><span class="icon">🎮</span> ${a.game || 'TBA'}</p>
      <p class="card-meta"><span class="icon">🏆</span> ${a.prize || 'TBA'}</p>
      <p class="card-meta"><span class="icon">📅</span> ${formatDate(a.startDate)} – ${formatDate(a.endDate)}</p>
      <span class="card-link press">VIEW →</span>
    </article>`;
}

function renderNewsCard(item) {
  const a = item.attributes;
  return `
    <article class="card card-news" onclick="window.location='news.html#${a.slug || item.id}'">
      <span class="card-badge">${a.category || 'NEWS'}</span>
      <h3 class="card-title">${a.title}</h3>
      <p class="card-meta"><span class="icon">📰</span> ${formatDate(a.publishedAt)}</p>
      <p class="card-desc vt">${a.summary || ''}</p>
      <span class="card-link press">READ →</span>
    </article>`;
}

function renderEmpty(msg = 'NO DATA YET') {
  return `<div class="empty-state"><span class="press">${msg}</span><p class="vt">Check back soon for updates.</p></div>`;
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

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  initStars();
  initHamburger();
  initBackTop();

  // Home page sections
  loadHomeEvents();
  loadHomeTournaments();
  loadHomeNews();

  // Highlight current nav link
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    link.classList.toggle('active', href === currentPage || (currentPage === '' && href === 'index.html'));
  });
});

// Expose for inner pages
window.PERI = {
  formatDate,
  renderEventCard,
  renderTournamentCard,
  renderNewsCard,
  renderEmpty,
  initScrollReveal,
  initHamburger,
  initBackTop,
};