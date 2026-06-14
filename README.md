# Team Perikapsilio — Setup Guide

## File Structure

```
perikapsilio/
├── index.html          ← Homepage (hero + 3 preview sections)
├── events.html         ← Events page (filterable, paginated)
├── tournaments.html    ← Tournaments page (split by status)
├── news.html           ← News page (featured article + grid)
├── about.html          ← About page (stats, values, timeline)
├── members.html        ← Members page (pixel avatars, filter by game)
├── contact.html        ← Contact page (info + form → Strapi)
├── style.css           ← Full 8-bit stylesheet (CRT, scanlines, fonts)
├── api.js              ← Strapi API client with mock data fallback
└── main.js             ← Shared JS (stars, hamburger, card renders)
```

---

## Strapi Backend Setup

### 1. Install Strapi

```bash
npx create-strapi-app@latest perikapsilio-backend --quickstart
```

### 2. Required Content Types

Create these collection types in the Strapi admin (`/admin`):

#### Events
| Field        | Type     | Notes                          |
|-------------|----------|-------------------------------|
| title        | Text     | Required                      |
| date         | DateTime |                               |
| location     | Text     |                               |
| type         | Enum     | LAN, WORKSHOP, SOCIAL, TOURNAMENT |
| description  | Rich Text|                               |
| slug         | UID      | from `title`                  |

#### Tournaments
| Field       | Type     | Notes                         |
|-------------|----------|-------------------------------|
| name        | Text     | Required                      |
| game        | Text     | CS2, VALORANT, FIFA 25, etc.  |
| startDate   | DateTime |                               |
| endDate     | DateTime |                               |
| status      | Enum     | ACTIVE, UPCOMING, COMPLETED   |
| prize       | Text     | e.g. €2,000                   |
| platform    | Text     | PC, PS5, etc.                 |
| slug        | UID      | from `name`                   |

#### News Posts
| Field       | Type     | Notes                         |
|-------------|----------|-------------------------------|
| title       | Text     | Required                      |
| summary     | Text     |                               |
| body        | Rich Text|                               |
| category    | Enum     | ACHIEVEMENT, TEAM, EVENT, ANNOUNCEMENT |
| slug        | UID      | from `title`                  |

#### Members
| Field    | Type    | Notes                          |
|----------|---------|-------------------------------|
| username | Text    | Required — in-game alias       |
| realName | Text    | Optional                      |
| role     | Enum    | IGL, AWP, RIFLER, SUPPORT, DUELIST, COACH |
| game     | Enum    | CS2, VALORANT, FIFA            |
| order    | Integer | Display order                 |

#### Directors
| Field    | Type    | Notes                          |
|----------|---------|-------------------------------|
| name     | Text    | Required        |
| title    | Text    | Required                      |
| bio      | Text    |                               |
| order    | Integer | Display order                 |

#### Contact Messages
| Field   | Type | Notes     |
|---------|------|-----------|
| name    | Text | Required  |
| email   | Email| Required  |
| subject | Text |           |
| message | Text | Required  |

### 3. Set Permissions

In `Settings → Roles → Public`, enable `find` and `findOne` for:
- Events
- Tournaments
- News Posts
- Members

Enable `create` for:
- Contact Messages

### 4. Connect the Frontend

Edit `api.js`, line 9:

```js
const BASE_URL = window.STRAPI_URL || 'http://localhost:1337';
```

For production, set `window.STRAPI_URL` before loading `api.js`:

```html
<script>window.STRAPI_URL = 'https://api.perikapsilio.gr';</script>
<script src="api.js"></script>
```

Or if you use an API token (Settings → API Tokens → Create):

```html
<script>
  window.STRAPI_URL   = 'https://api.perikapsilio.gr';
  window.STRAPI_TOKEN = 'your-token-here';
</script>
```

---

## Mock Data Fallback

When Strapi is unreachable, `api.js` automatically serves built-in mock data so the site always shows content during development. The fallback covers all 4 content types.

---

## Deployment

The frontend is **100% static** — just serve the HTML/CSS/JS files from any host (Nginx, Apache, Netlify, Vercel, GitHub Pages).

Strapi can run on any Node.js host (Railway, Render, DigitalOcean, VPS).

---

## Fonts Used

- **Press Start 2P** — headings, labels, badges (via Google Fonts)
- **VT323** — body text, descriptions (via Google Fonts)

Both load from `fonts.googleapis.com`. For offline use, download and host locally.