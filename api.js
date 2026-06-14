/* =============================================
   TEAM PERIKAPSILIO — STRAPI API CLIENT
   ============================================= */

const API = (() => {

  // ── CONFIGURATION ──
  // Update BASE_URL to point to your Strapi instance
  const BASE_URL = window.STRAPI_URL || 'http://localhost:1337';
  const API_BASE  = `${BASE_URL}/api`;

  // Optional: API token for protected endpoints
  const TOKEN = window.STRAPI_TOKEN || '';

  const headers = TOKEN
    ? { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };

  // ── GENERIC FETCH ──
  async function request(path, options = {}) {
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        headers,
        ...options
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('[Perikapsilio API]', err);
      return null;
    }
  }

  // ── HELPER: build Strapi query string ──
  function buildQuery(params = {}) {
    const parts = [];
    if (params.page)     parts.push(`pagination[page]=${params.page}`);
    if (params.pageSize) parts.push(`pagination[pageSize]=${params.pageSize}`);
    if (params.sort)     parts.push(`sort=${params.sort}`);
    if (params.filters)  parts.push(params.filters);
    if (params.populate) parts.push(`populate=${params.populate}`);
    return parts.length ? '?' + parts.join('&') : '';
  }

  // ── EVENTS ──
  async function getEvents({ page = 1, pageSize = 9, sort = 'date:asc', filters = '' } = {}) {
    const q = buildQuery({ page, pageSize, sort, filters, populate: '*' });
    return request(`/events${q}`);
  }

  async function getEvent(id) {
    return request(`/events/${id}?populate=*`);
  }

  // ── TOURNAMENTS ──
  async function getTournaments({ page = 1, pageSize = 9, sort = 'startDate:asc', filters = '' } = {}) {
    const q = buildQuery({ page, pageSize, sort, filters, populate: '*' });
    return request(`/tournaments${q}`);
  }

  async function getTournament(id) {
    return request(`/tournaments/${id}?populate=*`);
  }

  // ── NEWS ──
  async function getNews({ page = 1, pageSize = 9, sort = 'publishedAt:desc', filters = '' } = {}) {
    const q = buildQuery({ page, pageSize, sort, filters, populate: '*' });
    return request(`/news-posts${q}`);
  }

  async function getNewsArticle(id) {
    return request(`/news-posts/${id}?populate=*`);
  }

  // ── MEMBERS ──
  async function getMembers({ sort = 'order:asc' } = {}) {
    const q = buildQuery({ sort, populate: '*' });
    return request(`/members${q}`);
  }

  // ── CONTACT (POST) ──
  async function submitContact(data) {
    return request('/contact-messages', {
      method: 'POST',
      body: JSON.stringify({ data })
    });
  }

  // ── MOCK DATA (fallback when Strapi is not connected) ──
  const MOCK = {
    events: [
      { id: 1, attributes: { title: 'LAN PARTY VOL.3', date: '2025-09-14', location: 'Thessaloniki', type: 'LAN', description: 'Annual LAN gathering for all skill levels. Bring your setup!', slug: 'lan-party-vol-3' } },
      { id: 2, attributes: { title: 'CS2 WORKSHOP', date: '2025-08-22', location: 'Online', type: 'WORKSHOP', description: 'Pro tips and tactics for Counter-Strike 2 from our top players.', slug: 'cs2-workshop' } },
      { id: 3, attributes: { title: 'GAMING NIGHT', date: '2025-10-05', location: 'Athens', type: 'SOCIAL', description: 'Casual gaming night open to all members and friends.', slug: 'gaming-night' } }
    ],
    tournaments: [
      { id: 1, attributes: { name: 'GR ESPORTS CUP 2025', game: 'CS2', startDate: '2025-09-01', endDate: '2025-09-30', status: 'UPCOMING', prize: '€2,000', platform: 'PC', slug: 'gr-esports-cup-2025' } },
      { id: 2, attributes: { name: 'BALKAN LEAGUE S4', game: 'VALORANT', startDate: '2025-08-10', endDate: '2025-10-20', status: 'ACTIVE', prize: '€5,000', platform: 'PC', slug: 'balkan-league-s4' } },
      { id: 3, attributes: { name: 'UNIVERSITY CUP', game: 'FIFA 25', startDate: '2025-11-01', endDate: '2025-11-30', status: 'UPCOMING', prize: '€500', platform: 'PS5', slug: 'university-cup' } }
    ],
    news: [
      { id: 1, attributes: { title: 'WE QUALIFIED FOR THE BALKAN FINALS', publishedAt: '2025-07-01', category: 'ACHIEVEMENT', summary: 'After six weeks of intense play, Team Perikapsilio has secured a spot in the Balkan Valorant Finals.', slug: 'qualified-balkan-finals' } },
      { id: 2, attributes: { title: 'NEW ROSTER ANNOUNCEMENT', publishedAt: '2025-06-15', category: 'TEAM', summary: 'We are proud to welcome two new members to the Perikapsilio family for the upcoming season.', slug: 'new-roster' } },
      { id: 3, attributes: { title: 'LAN PARTY VOL.3 ANNOUNCED', publishedAt: '2025-06-01', category: 'EVENT', summary: 'Save the date — our biggest LAN event yet is coming to Thessaloniki this September.', slug: 'lan-party-announced' } }
    ],
    members: [
      { id: 1, attributes: { username: 'ZEUS_GR', realName: 'Alexandros P.', role: 'IGL', game: 'CS2', order: 1 } },
      { id: 2, attributes: { username: 'ARTEMIS', realName: 'Sofia K.', role: 'RIFLER', game: 'CS2', order: 2 } },
      { id: 3, attributes: { username: 'HERMES', realName: 'Nikos D.', role: 'AWP', game: 'CS2', order: 3 } },
      { id: 4, attributes: { username: 'ATHENA', realName: 'Maria L.', role: 'SUPPORT', game: 'VALORANT', order: 4 } },
      { id: 5, attributes: { username: 'ARES99', realName: 'Petros M.', role: 'DUELIST', game: 'VALORANT', order: 5 } },
      { id: 6, attributes: { username: 'POSEIDON', realName: 'Giannis T.', role: 'COACH', game: 'CS2', order: 6 } }
    ]
  };

  // Wrap mock data in Strapi-like structure
  function mockResponse(key, filters = {}) {
    let data = MOCK[key] || [];
    // basic text filter
    if (filters.search) {
      const s = filters.search.toLowerCase();
      data = data.filter(d => JSON.stringify(d).toLowerCase().includes(s));
    }
    return { data, meta: { pagination: { page: 1, pageSize: 25, pageCount: 1, total: data.length } } };
  }

  // Use mock data if Strapi returns null
  async function getEventsWithFallback(opts) {
    const res = await getEvents(opts);
    return res || mockResponse('events');
  }
  async function getTournamentsWithFallback(opts) {
    const res = await getTournaments(opts);
    return res || mockResponse('tournaments');
  }
  async function getNewsWithFallback(opts) {
    const res = await getNews(opts);
    return res || mockResponse('news');
  }
  async function getMembersWithFallback(opts) {
    const res = await getMembers(opts);
    return res || mockResponse('members');
  }

  return {
    getEvents: getEventsWithFallback,
    getEvent,
    getTournaments: getTournamentsWithFallback,
    getTournament,
    getNews: getNewsWithFallback,
    getNewsArticle,
    getMembers: getMembersWithFallback,
    submitContact,
    BASE_URL
  };

})();