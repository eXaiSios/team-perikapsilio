/* =============================================
   TEAM PERIKAPSILIO — GIT-BASED CMS DATA CLIENT
   ============================================= */

const API = (() => {

  // Detect site root relative to api.js script tag so it works on / and /subpage/
  const DATA_BASE = (() => {
    const scripts = document.getElementsByTagName('script');
    for (const s of scripts) {
      const src = s.getAttribute('src') || '';
      if (src.endsWith('api.js')) {
        return src.slice(0, -'api.js'.length) + 'data/';
      }
    }
    return 'data/';
  })();

  const cache = {};

  // Load a collection from data/<name>.json
  async function loadCollection(name) {
    if (cache[name]) return cache[name];
    try {
      const res = await fetch(`${DATA_BASE}${name}.json`, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const rawItems = Array.isArray(json) ? json : ((json && (json.items || json.data)) || []);
      const normalized = rawItems.map((item, idx) => {
        if (item && item.attributes) return item;
        const { id, ...attrs } = item;
        return { id: id || idx + 1, attributes: attrs };
      });
      cache[name] = normalized;
      return normalized;
    } catch (err) {
      console.error(`[Perikapsilio Git CMS] Failed to load ${name}.json:`, err);
      return [];
    }
  }

  function sortItems(items, sortSpec) {
    if (!sortSpec) return items;
    const [field, dir = 'asc'] = sortSpec.split(':');
    const mult = dir.toLowerCase() === 'desc' ? -1 : 1;
    return [...items].sort((a, b) => {
      const va = a.attributes[field];
      const vb = b.attributes[field];
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * mult;
      return String(va).localeCompare(String(vb)) * mult;
    });
  }

  function queryCollection(items, { page = 1, pageSize = 25, sort = '', filterFn = null, search = '' } = {}) {
    let result = items;
    if (filterFn) result = result.filter(filterFn);
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(item => JSON.stringify(item.attributes).toLowerCase().includes(s));
    }
    if (sort) result = sortItems(result, sort);

    const total = result.length;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, page), pageCount);
    const start = (safePage - 1) * pageSize;
    const paged = result.slice(start, start + pageSize);

    return {
      data: paged,
      meta: { pagination: { page: safePage, pageSize, pageCount, total } }
    };
  }

  // ── EVENTS ──
  async function getEvents({ page = 1, pageSize = 9, sort = 'date:asc', type = '', search = '' } = {}) {
    const items = await loadCollection('events');
    return queryCollection(items, {
      page,
      pageSize,
      sort,
      search,
      filterFn: type ? (i => (i.attributes.type || '').toUpperCase() === type.toUpperCase()) : null
    });
  }

  async function getEvent(idOrSlug) {
    const items = await loadCollection('events');
    return items.find(i => String(i.id) === String(idOrSlug) || i.attributes.slug === idOrSlug) || null;
  }

  // ── TOURNAMENTS ──
  async function getTournaments({ page = 1, pageSize = 50, sort = 'startDate:asc', status = '', search = '' } = {}) {
    const items = await loadCollection('tournaments');
    return queryCollection(items, {
      page,
      pageSize,
      sort,
      search,
      filterFn: status ? (i => (i.attributes.status || '').toUpperCase() === status.toUpperCase()) : null
    });
  }

  async function getTournament(idOrSlug) {
    const items = await loadCollection('tournaments');
    return items.find(i => String(i.id) === String(idOrSlug) || i.attributes.slug === idOrSlug) || null;
  }

  // ── NEWS ──
  async function getNews({ page = 1, pageSize = 9, sort = 'publishedAt:desc', category = '', search = '' } = {}) {
    const items = await loadCollection('news');
    return queryCollection(items, {
      page,
      pageSize,
      sort,
      search,
      filterFn: category ? (i => (i.attributes.category || '').toUpperCase() === category.toUpperCase()) : null
    });
  }

  async function getNewsArticle(idOrSlug) {
    const items = await loadCollection('news');
    return items.find(i => String(i.id) === String(idOrSlug) || i.attributes.slug === idOrSlug) || null;
  }

  // ── MEMBERS ──
  async function getMembers({ sort = 'order:asc', game = '', search = '' } = {}) {
    const items = await loadCollection('members');
    return queryCollection(items, {
      page: 1,
      pageSize: 200,
      sort,
      search,
      filterFn: game ? (i => (i.attributes.game || '').toUpperCase() === game.toUpperCase()) : null
    });
  }

  // ── BOARD OF DIRECTORS ──
  async function getBoard({ sort = 'order:asc' } = {}) {
    const items = await loadCollection('board');
    return queryCollection(items, { page: 1, pageSize: 100, sort });
  }

  // ── CONTACT (optional endpoint or mailto fallback) ──
  async function submitContact(data) {
    const endpoint = window.CONTACT_ENDPOINT || '';
    if (endpoint) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json().catch(() => ({ ok: true }));
      } catch (err) {
        console.error('[Perikapsilio Contact]', err);
        return null;
      }
    }

    // Static Git-based fallback: open pre-filled email client
    const subjectLabel = data.subject ? `[${data.subject.toUpperCase()}] ` : '';
    const subject = encodeURIComponent(`${subjectLabel}Contact from ${data.name}`);
    const body = encodeURIComponent(`Name: ${data.name}\nEmail: ${data.email}\n\n${data.message}`);
    window.location.href = `mailto:hello@perikapsilio.gr?subject=${subject}&body=${body}`;
    return { fallback: true };
  }

  return {
    getEvents,
    getEvent,
    getTournaments,
    getTournament,
    getNews,
    getNewsArticle,
    getMembers,
    getBoard,
    submitContact,
    DATA_BASE
  };

})();
