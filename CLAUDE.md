# CLAUDE.md

Guide for AI assistants working on the **catcatbuilder** repository.

## Project Overview

A Korean-language multi-purpose utility portal hosted at **https://lilhwang.com**. It provides personality tests, developer tools, practical utilities, mini-games, and a blog platform. Built entirely with vanilla JavaScript (ES6+), HTML5, and CSS3 — no frameworks, no bundler, no build step.

## Repository Structure

```
catcatbuilder/
├── index.html              # Main portal homepage (tabs: Tools / Widgets / Games)
├── about.html              # About page
├── blog.html               # Blog listing & detail view
├── test.html               # Personality test hub
├── tests.html              # Tests navigation
├── mbti.html               # MBTI animal personality test
├── admin.html              # Admin dashboard (blog management)
├── contact.html            # Contact form
├── privacy.html            # Privacy policy
├── terms.html              # Terms of service
├── developer-tools.html    # Developer tools hub
├── diary.html              # Diary/journal feature
├── cheatsheet.html         # Code cheatsheet reference
├── app.js                  # Main application logic (~2000 lines)
├── admin.js                # Admin panel functionality (~700 lines)
├── blog.js                 # Blog rendering with custom markdown parser (~600 lines)
├── mbti.js                 # MBTI test logic & 48 animal results (~1700 lines)
├── tests-data.js           # Preloaded test questions & answers (~108 KB)
├── styles.css              # Main stylesheet with CSS variables (~31 KB)
├── blog.css                # Blog-specific styles
├── posts.json              # Blog posts database (JSON array, ~55 posts)
├── CNAME                   # Custom domain: lilhwang.com
├── robots.txt              # SEO crawler directives
├── sitemap.xml             # XML sitemap for all pages
├── worker/                 # Cloudflare Worker backend
│   ├── wrangler.toml       # Worker configuration & env vars
│   └── src/
│       └── worker.js       # Edge worker (auth, GitHub API, stock data)
└── images/
    └── posts/              # Blog post images
```

## Tech Stack

- **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3
- **Backend:** Cloudflare Workers (edge serverless)
- **Hosting:** GitHub Pages (static site on `main` branch)
- **Domain:** lilhwang.com
- **Data storage:** `posts.json` (file-based), LocalStorage/SessionStorage (client-side)
- **No build tools:** No webpack, vite, npm, package.json, or bundler

## Local Development

Start a local server (no install/build step needed):

```bash
# Python
python -m http.server 8000

# Node.js
npx http-server
```

Then open `http://localhost:8000` in a browser.

### Cloudflare Worker (local)

```bash
cd worker
wrangler login
wrangler dev   # local dev server at localhost:8787
```

## Deployment

- **Frontend:** Push to `main` branch — GitHub Pages auto-deploys.
- **Worker:** Run `wrangler deploy` from the `worker/` directory. Secrets are configured via `wrangler secret put <NAME>`.

## Architecture & Patterns

### Frontend (Vanilla JS Module Pattern)

Each major feature lives in its own file. Files are loaded via `<script>` tags in the corresponding HTML page. There is no module bundler or ES module import/export — all code attaches to the global scope or uses IIFEs.

| File | Responsibilities |
|------|-----------------|
| `app.js` | Tab navigation, BMI calculator, currency converter, to-do list, weather widget, crypto prices, quotes, games |
| `admin.js` | Login, rich text editor, image insertion modal, JSON import/export, GitHub save via Worker |
| `blog.js` | Custom markdown-to-HTML renderer, post listing, category filtering, date formatting |
| `mbti.js` | 20-question personality test, 4-dimension scoring (E/I, S/N, T/F, J/P), 48 result animals |
| `tests-data.js` | Static data: test questions, answers, character matching datasets |

### Backend (Cloudflare Worker)

`worker/src/worker.js` exposes two endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/save-posts` | POST | Authenticated admin endpoint to save `posts.json` to GitHub via GitHub App API |
| `/most-active-stocks` | GET | Returns hot stock data via NewsData.io and Yahoo Finance APIs |

Authentication uses `X-Admin-Password` header checked against the `ADMIN_PASSWORD` secret.

### Theming

CSS custom properties in `styles.css` control light/dark mode. The active theme is set via `data-theme` attribute on `<html>`. Key variables:

- `--bg-body`, `--text-primary`, `--primary` (orange accent), `--accent` (blue accent)
- Dark mode is the default
- Transition: `0.35s ease`

### Data Flow

- Blog posts: `posts.json` -> fetched by `blog.js` -> rendered as HTML
- Admin saves: `admin.js` -> POST to Cloudflare Worker -> Worker commits to GitHub via GitHub App -> GitHub Pages redeploys
- Client state: LocalStorage (to-do items, theme pref), SessionStorage (admin login, drafts)

## Conventions & Guidelines

### Language
- All UI text is in **Korean**. Maintain Korean for user-facing strings.
- Code comments, variable names, and technical identifiers are in English.

### Code Style
- No linter or formatter configured. Follow existing patterns:
  - `camelCase` for variables and functions
  - Single-responsibility functions
  - `try/catch` around all `fetch()` calls with user-facing error messages
  - DOM manipulation via `document.getElementById()`, `innerHTML`, `classList`
  - Event listeners attached in initialization functions (e.g., `initTabs()`, `checkLogin()`)
- No TypeScript, no JSDoc annotations. Keep it vanilla JS.

### File Organization
- One JS file per major feature area
- HTML pages are self-contained; each includes only the scripts it needs
- No shared utility module — helper functions are defined within each file

### CSS
- Use CSS custom properties for all colors/spacing that vary by theme
- Mobile-first responsive design with breakpoints at 768px and 1200px
- Google Fonts: **Noto Sans KR** (Korean) + **Space Grotesk** (Latin)

### Blog Posts (`posts.json`)
Each post follows this schema:
```json
{
  "id": 55,
  "title": "Post title in Korean",
  "category": "tech",
  "date": "2026-02-10",
  "image": "images/posts/filename.jpg",
  "excerpt": "Short description",
  "content": "Markdown content...",
  "tags": ["tag1", "tag2"]
}
```
- IDs are sequential integers
- Content uses markdown rendered by the custom parser in `blog.js`
- Supported markdown: headings (`##`), lists, tables, code blocks, bold/italic, links, images

## External APIs

All frontend APIs are free and require no API key:

| API | Usage |
|-----|-------|
| ExchangeRate-API | Currency conversion |
| CoinGecko | Cryptocurrency prices |
| Quotable | Random quotes |
| wttr.in | Weather data |

Worker-side APIs (require secrets):
| API | Usage |
|-----|-------|
| GitHub API (App) | Committing posts.json updates |
| NewsData.io | News-based stock monitoring |
| Yahoo Finance | Stock price quotes |

## Worker Secrets (Cloudflare)

These are set via `wrangler secret put` and must never be committed to the repo:

- `ADMIN_PASSWORD` — Admin authentication
- `GITHUB_APP_ID` — GitHub App ID
- `GITHUB_INSTALLATION_ID` — GitHub App installation ID
- `GITHUB_APP_PRIVATE_KEY` — GitHub App private key (PEM)
- `NEWSDATA_API_KEY` — NewsData.io API key

## Git Workflow

- **Production branch:** `main` (auto-deploys to GitHub Pages)
- **Feature branches:** `claude/<description>` pattern for AI-assisted work
- **Merge strategy:** PRs merged into `main`
- **No CI/CD pipeline, no automated tests, no pre-commit hooks**

## Testing

No automated test framework. Testing is done manually in the browser. When making changes:

1. Open the relevant HTML page in a browser with a local server
2. Verify the feature works across the tab/section it belongs to
3. Check responsive layout at mobile (360px), tablet (768px), and desktop (1200px+) widths
4. Test both light and dark themes if UI changes are involved

## Common Tasks

### Adding a new blog post
1. Add a new object to the `posts.json` array with an incremented `id`
2. Write content in markdown (supported by the custom renderer in `blog.js`)
3. Save via admin panel or commit directly

### Adding a new tool/widget
1. Add HTML markup in the appropriate page (or `index.html` for the main portal)
2. Add the JS logic in `app.js` (or create a new file for large features)
3. Style with CSS custom properties in `styles.css`
4. Register any new tab/section in the tab navigation system in `app.js`

### Modifying the Cloudflare Worker
1. Edit `worker/src/worker.js`
2. Test locally with `wrangler dev`
3. Deploy with `wrangler deploy` from the `worker/` directory

## Security Notes

- Never commit API keys, passwords, or PEM files to the repository
- The admin password in `admin.js` is client-side only; the real auth check happens in the Cloudflare Worker
- Worker CORS is restricted to origins listed in `wrangler.toml` (`ALLOWED_ORIGINS`)
