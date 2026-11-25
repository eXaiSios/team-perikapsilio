# Team Perikapsilio

Static retro 8-bit website for **Team Perikapsilio**, powered by a **Git-based CMS** (Sveltia CMS + JSON data files in `data/`).

## File Structure

```
perikapsilio/
├── index.html             ← Homepage (hero + 3 preview sections)
├── events/index.html      ← Events page (filterable, paginated, detail modal)
├── tournaments/index.html ← Tournaments page (split by status, detail modal)
├── news/index.html        ← News page (featured article + grid, detail modal)
├── about/index.html       ← About page (stats, values, timeline)
├── members/index.html     ← Members page (board of directors + player roster)
├── contact/index.html     ← Contact page (info + form)
├── admin/
│   ├── index.html         ← Sveltia CMS admin interface (/admin/)
│   └── config.yml         ← Git-based CMS schema & GitHub backend config
├── data/
│   ├── events.json        ← Events collection
│   ├── tournaments.json   ← Tournaments collection
│   ├── news.json          ← News posts collection
│   ├── members.json       ← Players & staff collection
│   └── board.json         ← Board of directors collection
├── style.css              ← Full 8-bit stylesheet (CRT, scanlines, fonts, modal)
├── api.js                 ← Git-based CMS client reading data/*.json
└── main.js                ← Shared JS (stars, hamburger, card renders, modal)
```

---

## Managing Content (Git-based CMS)

All site content lives in `data/*.json` right in this repository. You can update content in two ways:

### Option 1: Visual Admin UI (`/admin/`)

1. Visit `/admin/` on your deployed site (e.g. `https://team.perikapsilio.gr/admin/`).
2. Sign in with GitHub (using a GitHub Personal Access Token with `repo` scope, or your configured OAuth app).
3. Edit **Events**, **Tournaments**, **News Posts**, **Players & Staff**, or **Board of Directors**.
4. Saving publishes a commit directly to `main` in `eXaiSios/team-perikapsilio`, and the live site updates automatically.

> **Local editing:** Sveltia CMS also supports opening the local repository folder directly in Chromium-based browsers when running on `localhost`.

### Option 2: Edit JSON Files Directly

Edit any file in `data/` (`events.json`, `tournaments.json`, `news.json`, `members.json`, `board.json`) and push to `main`.

---

## Contact Form

By default (with no backend server required), submitting the contact form opens the visitor's email client pre-filled to `hello@perikapsilio.gr`.

If you want silent form submissions (e.g. via Formspree or Web3Forms), set `window.CONTACT_ENDPOINT` before loading `api.js` in `contact/index.html`:

```html
<script>window.CONTACT_ENDPOINT = 'https://formspree.io/f/your-form-id';</script>
<script src="../api.js"></script>
```

---

## Deployment

The entire site + CMS is **100% static** — deploy directly to GitHub Pages, Cloudflare Pages, Netlify, Vercel, or any static web server with zero build step.

---

## Fonts Used

- **Press Start 2P** — headings, labels, badges (via Google Fonts)
- **VT323** — body text, descriptions (via Google Fonts)
