# CLAUDE.md

This file provides guidance for AI assistants working on the **catcatbuilder** (lilhwang.com) repository.

## Project Overview

A Korean-language utility portal and personality test platform deployed as a static site on GitHub Pages with a Cloudflare Worker backend for admin operations. The site includes personality tests (Pokemon, MBTI, One Piece, etc.), practical tools (BMI calculator, currency converter, to-do list), interactive widgets (weather, crypto prices), mini-games, and a blog system with an admin panel.

**Domain:** lilhwang.com
**Primary language:** Korean (UI text, blog content, documentation)

## Tech Stack

- **Frontend:** Vanilla HTML/CSS/JavaScript (ES6+) — no frameworks, no bundler, no TypeScript
- **Backend:** Cloudflare Worker (`worker/src/worker.js`) for admin API and GitHub integration
- **Deployment:** GitHub Pages (static site, auto-deploys on push to `main`)
- **Data storage:** `posts.json` committed to the repo, updated via Cloudflare Worker
- **Fonts:** Google Fonts (Noto Sans KR, Space Grotesk)
- **Monetization:** Google AdSense

## Repository Structure

```
catcatbuilder/
├── index.html              # Main dashboard / SPA entry point (~1,948 lines)
├── tests.html              # Personality test hub page
├── test.html               # Individual test runner page
├── blog.html               # Blog listing page
├── mbti.html               # MBTI animal test page
├── admin.html              # Admin panel (blog management)
├── about.html, contact.html, privacy.html, terms.html  # Static pages
├── base64.html, hash.html, json-formatter.html          # Developer tools
├── image-tool.html, cheatsheet.html, developer-tools.html
├── timezone.html, writing-helper.html, diary.html
│
├── app.js                  # Main application logic (utilities, APIs, tabs)
├── admin.js                # Admin panel functionality (editor, GitHub sync)
├── blog.js                 # Blog system (custom markdown renderer, pagination)
├── mbti.js                 # MBTI personality test logic (20 questions, 48 animals)
├── tests-data.js           # Personality test question database (~110KB)
│
├── styles.css              # Main stylesheet (theming, responsive, dark mode)
├── blog.css                # Blog-specific styles
│
├── posts.json              # Blog post data (~494KB, 56+ posts)
├── images/posts/           # Blog post images
│
├── worker/                 # Cloudflare Worker backend
│   ├── src/worker.js       # Worker code (auth, GitHub API, CORS)
│   └── wrangler.toml       # Worker configuration
│
├── CNAME                   # GitHub Pages custom domain
├── robots.txt              # SEO config
├── sitemap.xml             # Sitemap
├── README.md               # Project documentation (Korean)
└── CLOUDFLARE.md           # Cloudflare Worker setup guide (Korean)
```

## Development Setup

There is **no build step**. This is a static site served directly.

```bash
# Local development — use any static file server:
python -m http.server 8000
# or
npx http-server
# Then open http://localhost:8000
```

### Cloudflare Worker (admin backend)

```bash
cd worker
wrangler login
wrangler secret put ADMIN_PASSWORD
wrangler secret put GITHUB_APP_ID
wrangler secret put GITHUB_INSTALLATION_ID
wrangler secret put GITHUB_APP_PRIVATE_KEY
wrangler deploy
```

Worker config in `worker/wrangler.toml`:
- GitHub owner: `catcatdo`, repo: `catcatbuilder`, branch: `main`
- Allowed origins: `https://lilhwang.com`, `http://localhost:8787`

## Testing

There is **no automated test suite** (no Jest, Vitest, or similar). Testing is manual via the browser. The `tests.html` and `test.html` files are user-facing personality quiz pages, not developer test infrastructure.

## Linting & Formatting

There are **no linting or formatting tools** configured (no ESLint, Prettier, or .editorconfig). Follow the existing code style:

- ES6+ JavaScript (arrow functions, async/await, template literals, const/let)
- No module system in frontend files — all scripts are global scope via `<script>` tags
- Cloudflare Worker uses `export default` (required by Cloudflare runtime)
- Code sections separated by comment headers: `// ========== SECTION NAME ==========`
- Mixed Korean/English comments; prefer Korean for user-facing strings
- CSS custom properties for theming; dark mode via `[data-theme="dark"]`
- 4-space indentation in HTML/CSS, mixed in JS (follow surrounding code)

## Architecture Patterns

### Navigation & State
- Tab-based SPA navigation in `index.html` via `data-tab` attributes and `window.location.hash`
- State stored in global variables and `localStorage` (drafts, preferences)
- Admin session tracked via `sessionStorage`

### API Integrations
All external APIs are called via `fetch()` directly from the browser:
- **ExchangeRate-API** — currency conversion
- **CoinGecko API** — cryptocurrency prices
- **Quotable API** — random quotes
- **wttr.in** — weather data
- **NewsData.io** — financial news
- **Yahoo Finance** — stock quotes

### Blog System
- Posts stored in `posts.json` (array of post objects)
- Custom markdown renderer in `blog.js` (regex-based, no external library)
- Admin panel writes posts via Cloudflare Worker which commits to GitHub
- Pagination at 6 posts per page

### Admin Panel
- Password authentication (checked against Cloudflare Worker secret)
- Rich text editor with toolbar, inline images, markdown output
- Draft auto-save to `localStorage`
- JSON editor for bulk data management

## Key Conventions for Changes

1. **No build system** — all files are served as-is. Do not add bundlers, transpilers, or package.json unless explicitly requested.
2. **No npm dependencies** — frontend uses only vanilla JS and CDN-loaded resources. Keep it that way.
3. **Keep files self-contained** — each HTML page includes its own `<script>` and `<style>` blocks or references shared `.js`/`.css` files.
4. **Korean UI text** — all user-facing text should be in Korean. Code comments can be English or Korean.
5. **Responsive design** — three breakpoints: mobile (360-768px), tablet (768-1024px), desktop (1200px+). Use CSS Grid/Flexbox.
6. **Dark mode support** — use CSS custom properties and `[data-theme="dark"]` selectors for all new styles.
7. **SEO matters** — maintain Open Graph tags, Twitter Cards, Schema.org JSON-LD, and sitemap entries for new pages.
8. **AdSense integration** — ad slots exist throughout; do not remove them. New content pages should include appropriate ad placements.
9. **posts.json is large** (~494KB) — avoid reading/writing it unnecessarily. Changes to blog content go through the admin panel / Cloudflare Worker.
10. **Security** — the admin password is stored as a Cloudflare Worker secret. The hardcoded password in `admin.js` is used for client-side gating only; server-side validation happens in the Worker.

## Deployment

- **Static site:** Push to `main` branch triggers GitHub Pages deployment automatically.
- **Worker:** Deploy manually with `cd worker && wrangler deploy`.
- **CNAME:** The `CNAME` file maps to `lilhwang.com` — do not remove or modify it.

## Browser Support

Chrome (recommended), Firefox, Safari, Edge — all modern browsers with ES6+ support.
