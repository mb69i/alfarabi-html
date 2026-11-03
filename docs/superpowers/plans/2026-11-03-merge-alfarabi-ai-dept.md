# Unified Al-Farabi AI Engineering Department Platform Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

---

## 1. Overview & Architectural Goal

Combine **`alfarabi-ai-dept`** (the luxury visual AI department landing page) and **`alfarabi-html`** (the full-featured Node.js university platform with dynamic JSON CMS and multi-page portal) into a **single, unified, independent portal** for the **AI Engineering Department** at Al-Farabi University.

The unified project will live in `d:\antigravity\scratch\alfarabi-html` (remote `https://github.com/mb69i/alfarabi-html.git`).

### What We Combine:
1. **From `alfarabi-html` (The Engine):**
   - Pure Node.js zero-dependency HTTP server (`server.js`) with security, rate limiting, and API routes.
   - Dynamic file-based JSON CMS (`data/`) and Admin/Owner dashboards (`admin.html`, `owner.html`).
   - Multi-page academic infrastructure: News (`news.html`, `article.html`), Calendar (`calendar.html`), Programs (`programs.html`), Classes & Cohorts (`classes.html`), Student Portfolio (`portfolio.html`), About & Contact (`about.html`).
   - Seamless Arabic (RTL) / English bilingual toggle (`lang-switch`).
   - Dark/Light theme switching and global search (Ctrl+K).
2. **From `alfarabi-ai-dept` (The Experience & AI Identity):**
   - Three.js interactive 3D Neural Lattice background.
   - Custom glowing trailing cursor and cinematic loading screen.
   - Six specialized **AI Research Labs** (Neural Architecture, Autonomous Systems, NLP Center, Computer Vision, AI Ethics, Quantum ML).
   - **Smart Admissions 5-step roadmap** (Online App → Verification → Aptitude → Interview → Enrollment).
   - Upgraded **AIZA AI Academic Advisor** with suggestion chips, waveform visualization, and expanded knowledge base.
   - GSAP magnetic buttons and micro-animations.

---

## 2. File & Component Structure

### New or Modified Files:
- `data/labs.json`: Store the 6 AI Research Labs with bilingual titles, descriptions, focus areas, and leads.
- `server.js`: Add API routes `/api/labs` (GET, POST, PUT, DELETE) and admin authentication handlers.
- `public/css/hero-3d.css`: Luxury 3D Hero canvas, typography, loader emblem, and custom cursor styling.
- `public/css/labs.css`: Research labs 6-grid styling, badges, and glow effects.
- `public/css/admissions.css`: 5-step interactive Admissions roadmap styling.
- `public/js/hero-canvas.js`: Enhanced Three.js neural particle lattice with mouse interaction and resize throttling.
- `public/js/aiza.js`: Enhanced AIZA assistant with suggestion chips, conversation history, and quick prompts.
- `public/index.html`: Merged homepage featuring 3D Hero, Stats, Research Labs, Flagship Program, AIZA Assistant, Admissions Roadmap, News & Events, and Cohorts.
- `public/admin.html`: Admin panel extension for managing Research Labs and admissions settings.

---

## 3. Tasks Breakdown

### Task 1: Data Assets & Backend Labs API
- [ ] Create `data/labs.json` pre-seeded with the 6 specialized AI Research Labs in English and Arabic.
- [ ] Update `server.js` with `/api/labs` endpoints:
  - `GET /api/labs`: return list of labs.
  - `POST /api/admin/labs`: create/update lab with admin authentication.
  - `DELETE /api/admin/labs/:id`: delete lab.
- [ ] Test API endpoints using curl/node.
- [ ] Commit changes: `feat: add labs data store and backend API routes in server.js`.

### Task 2: CSS Stylesheets & Design System Integration
- [ ] Create `public/css/hero-3d.css` combining the luxury dark palette (`#02040f`), gold accents (`#c9a84c`), custom cursor dot, loader, and typography.
- [ ] Create `public/css/labs.css` for the 6-grid research labs cards with hover states, tags, and icons.
- [ ] Create `public/css/admissions.css` for the 5-step visual roadmap with step cards, icons, and timeline connectors.
- [ ] Ensure full RTL support (`html[dir="rtl"]`) for all new styles.
- [ ] Commit changes: `feat: integrate luxury 3D hero, labs, and admissions stylesheets`.

### Task 3: Three.js Neural Lattice & Custom Cursor Engine
- [ ] Implement `public/js/hero-canvas.js`:
  - Three.js particle lattice with dynamic connection lines based on proximity.
  - Mouse interaction (subtle camera tilt / particle repulsion).
  - Performance optimization (runs at target 60fps, low-overhead fallback for low-end devices).
- [ ] Implement custom cursor logic and cinematic loader in `public/js/main.js`.
- [ ] Test rendering in browser.
- [ ] Commit changes: `feat: integrate Three.js neural lattice canvas and custom cursor`.

### Task 4: Unified Homepage (`public/index.html`) Assembly
- [ ] Assemble the unified `public/index.html`:
  - 3D Hero with dynamic site title and badge.
  - Stats counter strip connected to `data/site-settings.json`.
  - Research Labs section dynamically fetching from `/api/labs`.
  - Academic Programs & Curriculum breakdown from `data/programs.json`.
  - Smart Admissions 5-step roadmap.
  - Faculty highlight grid from `data/faculty.json`.
  - Upcoming Events & News from `data/articles.json`.
  - Cohorts & Class status from `data/cohorts.json`.
- [ ] Ensure all text dynamically switches between Arabic and English via `setLanguage()`.
- [ ] Test all links and navigation to sub-pages (`programs.html`, `news.html`, `calendar.html`, `portfolio.html`, `classes.html`, `about.html`).
- [ ] Commit changes: `feat: assemble unified AI Engineering Department homepage`.

### Task 5: AIZA Academic Advisor Enhancement
- [ ] Enhance `public/js/aiza.js`:
  - Glassmorphism floating & embedded chat interface.
  - Quick suggestion chips: "What programs do you offer?", "Tell me about research labs", "How do I apply?", "Scholarship opportunities".
  - Bilingual knowledge base for Iraqi & international students.
  - Mock instant answering engine with Anthropic/LLM API key toggle option.
- [ ] Test chatbot responses in both Arabic and English.
- [ ] Commit changes: `feat: upgrade AIZA academic advisor with suggestion chips and dual language support`.

### Task 6: Admin CMS Extension for Research Labs
- [ ] Update `public/admin.html`:
  - Add "Research Labs" tab/card in the CMS dashboard.
  - Modal form to Add / Edit / Delete research labs (Title, Arabic Title, Lead, Description, Focus Area).
- [ ] Test CRUD operations in the Admin dashboard.
- [ ] Commit changes: `feat: add Research Labs CRUD management to admin dashboard`.

### Task 7: Verification, Server Startup & Git Push
- [ ] Verify server runs cleanly: `node server.js` on port 3000.
- [ ] Verify all public pages (`/`, `/about.html`, `/programs.html`, `/classes.html`, `/calendar.html`, `/news.html`, `/portfolio.html`, `/admin.html`) render without console errors.
- [ ] Test language toggle (`AR` / `EN`) across all sections.
- [ ] Push unified project to GitHub: `git push origin main`.
- [ ] Present completed platform to user with live localhost link.
