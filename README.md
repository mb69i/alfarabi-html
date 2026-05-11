# Al-Farabi University Platform

A premium, full-featured university website with a built-in admin CMS. Zero npm dependencies — runs on pure Node.js.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![License](https://img.shields.io/badge/License-Commercial-blue)
![Dependencies](https://img.shields.io/badge/Dependencies-0-brightgreen)

---

## Features

- **10 Pages** — Home, About, Programs, Classes, Calendar, News, Portfolio, Sign-In, Admin Dashboard, Owner Dashboard
- **Admin CMS** — Full CRUD for articles, events, cohorts, student projects, faculty, timeline, mission values, programs, and site settings
- **Owner Dashboard** — Separate elevated panel for managing admin/owner passwords
- **Bilingual (EN/AR)** — Complete English and Arabic translation with RTL support
- **Dark / Light Mode** — Toggle with smooth transitions, respects user preference
- **3D Hero Canvas** — Neural network animation using Three.js
- **Image Uploads** — Drag-and-drop upload for articles, faculty photos, and site logo
- **Global Search** — Ctrl+K search across articles, programs, and faculty (supports Arabic)
- **Contact Form** — Public contact form with server-side storage
- **Mobile Responsive** — Hamburger menu, stacked layouts, optimized for all screen sizes
- **SEO Optimized** — Open Graph, Twitter Cards, JSON-LD schema, sitemap, robots.txt
- **Security Hardened** — Rate limiting, input sanitization, CSP headers, `.env` file blocking
- **Print Stylesheet** — Clean print layout for all pages
- **Skeleton Loaders** — Shimmer loading states for all dynamic content
- **Back-to-Top Button** — Smooth scroll with animated visibility

---

## Quick Start

### 1. Prerequisites

- [Node.js](https://nodejs.org/) v18 or later

### 2. Setup

```bash
# Clone or extract the project
cd alfarabi-html

# Create your environment file
# Edit .env and set your own passwords
```

The `.env` file must contain:

```env
ADMIN_PASSWORD=your_admin_password
OWNER_PASSWORD=your_owner_password
PORT=3000
```

> **⚠️ Both passwords are required.** The server will refuse to start without them.

### 3. Run

```bash
node server.js
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
alfarabi-html/
├── server.js              # Node.js server (all API routes, auth, security)
├── .env                   # Passwords & port (NEVER commit this)
├── .gitignore             # Git ignore rules
│
├── data/                  # JSON CMS data (file-based database)
│   ├── site-settings.json # Site name, contact info, hero text, social links
│   ├── articles.json      # News articles & events
│   ├── cohorts.json       # Class cohorts & student counts
│   ├── faculty.json       # Faculty members & expertise
│   ├── programs.json      # Academic programs, flagship, admissions
│   ├── projects.json      # Student portfolio projects
│   ├── values.json        # Mission & values section
│   ├── timeline.json      # History milestones
│   └── contacts.json      # Contact form submissions
│
└── public/                # Static frontend
    ├── index.html          # Homepage
    ├── about.html          # About page (mission, faculty, contact form)
    ├── programs.html       # Programs & curriculum
    ├── classes.html        # Cohorts & class management
    ├── calendar.html       # Academic calendar
    ├── news.html           # News & announcements
    ├── portfolio.html      # Student project showcase
    ├── article.html        # Individual article/event page
    ├── sign-in.html        # Admin login
    ├── admin.html          # Admin dashboard
    ├── owner.html          # Owner dashboard (elevated access)
    ├── 404.html            # Custom 404 error page
    ├── favicon.png         # Site favicon
    ├── og-image.png        # Social share image (1200×630)
    ├── robots.txt          # Search engine crawl rules
    ├── sitemap.xml         # XML sitemap
    │
    ├── css/                # Stylesheets (one per component)
    │   ├── globals.css     # Design tokens, theme, animations, utilities
    │   ├── navbar.css      # Navigation bar
    │   ├── hero.css        # Hero section & 3D canvas
    │   ├── footer.css      # Footer
    │   ├── about.css       # About page
    │   ├── programs.css    # Programs page
    │   ├── classes.css     # Classes page
    │   ├── calendar.css    # Calendar page
    │   ├── news.css        # News page
    │   ├── portfolio.css   # Portfolio page
    │   ├── article.css     # Article page
    │   └── admin.css       # Admin & owner dashboards
    │
    ├── js/                 # JavaScript modules
    │   ├── main.js         # Core: navbar, theme, locale, search, animations
    │   ├── data.js         # API fetch/save layer with caching
    │   ├── translations.js # EN/AR translation dictionary
    │   ├── hero-canvas.js  # Three.js neural network animation
    │   ├── admin.js        # Admin dashboard (monolith — full CRUD + rendering)
    │   ├── admin-core.js   # Admin shared state & utilities
    │   ├── admin-views.js  # Admin section renderers
    │   ├── admin-modals.js # Admin modal forms
    │   ├── admin-content.js# Admin content list helpers
    │   ├── admin-about.js  # Admin about page sections
    │   └── admin-programs.js # Admin programs sections
    │
    └── uploads/            # User-uploaded images (created at runtime)
```

---

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/cms?file=<name>` | Read any JSON data file |
| `POST` | `/api/cms?file=<name>` | Write/update a JSON data file |
| `POST` | `/api/admin-auth` | Admin/Owner login |
| `DELETE` | `/api/admin-auth` | Logout |
| `GET` | `/api/admin-auth/check` | Check if current session is admin |
| `POST` | `/api/upload` | Upload an image (base64) |
| `POST` | `/api/contact` | Submit a contact form message |
| `GET` | `/api/contacts` | Retrieve all contact messages (admin only) |
| `POST` | `/api/change-password` | Change admin/owner password (owner only) |

---

## Customization Guide

### Change Branding

1. **Site name, contact info, hero text** → Edit via Admin Dashboard → Site Settings, or directly in `data/site-settings.json`
2. **Logo** → Upload via Admin Dashboard → Site Settings → Site Logo
3. **Favicon** → Replace `public/favicon.png`
4. **Social share image** → Replace `public/og-image.png` (1200×630px recommended)
5. **Colors** → Edit CSS variables in `public/css/globals.css` under `:root`

### Change Theme Colors

The design system uses CSS custom properties. Edit these in `globals.css`:

```css
:root {
  --crimson: #A51C30;       /* Primary brand color */
  --gold: #D4AF37;          /* Accent color */
  --navy-900: #0B132B;      /* Dark background */
  --font-serif: 'Playfair Display', Georgia, serif;
  --font-sans: 'Inter', system-ui, sans-serif;
}
```

### Add/Edit Translations

All UI text lives in `public/js/translations.js`:

```js
'nav.home': { en: 'Home', ar: 'الرئيسية' },
```

### Change Developer Credits

Footer credits are in the `buildFooter()` function inside `public/js/main.js` (search for `footer-credits`).

---

## Authentication

- **Admin** — Access to CMS dashboard (create/edit/delete content)
- **Owner** — Everything Admin has + ability to change both passwords

Passwords are stored in `.env`. Login sessions use secure, httpOnly cookies with random session tokens.

---

## Security

| Feature | Implementation |
|---------|---------------|
| Rate Limiting | 5 login attempts per 15 minutes per IP |
| Input Sanitization | All user input is stripped of HTML/script tags |
| Security Headers | CSP, X-Frame-Options, X-Content-Type-Options |
| File Access | `.env` and sensitive files return 403 Forbidden |
| Session Tokens | Cryptographically random, stored server-side |
| No Hardcoded Secrets | Server exits if `.env` passwords are missing |

---

## Production Deployment

For production, use a process manager:

```bash
# Using PM2
npm install -g pm2
pm2 start server.js --name alfarabi
pm2 save
pm2 startup

# Or using systemd (Linux)
# Create a service file pointing to: node /path/to/server.js
```

Set `PORT` in `.env` to your desired port, then reverse-proxy with Nginx or Caddy.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js (zero dependencies, built-in `http`, `fs`, `crypto`) |
| Frontend | Vanilla HTML, CSS, JavaScript |
| 3D Graphics | Three.js (CDN) |
| Fonts | Google Fonts (Playfair Display, Inter, Cairo) |
| Database | File-based JSON (`/data/` directory) |
| Auth | Session cookies + `.env` passwords |

---

## Browser Support

- Chrome 90+
- Firefox 90+
- Safari 15+
- Edge 90+
- Mobile Safari & Chrome (responsive)

---

## License

Commercial license. All rights reserved.
