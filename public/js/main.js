// ── Alfarabi — Main JavaScript ────────────────────────────────────
// Navbar, mobile menu, language toggle, theme toggle, animations, countup

document.addEventListener('DOMContentLoaded', () => {
  applyLocale();
  initTheme();
  initNavbar();
  initMobileMenu();
  initSearch();
  initAnimateOnScroll();
  initCountUp();
  updateAuthUI();
});

// ── Locale / RTL ────────────────────────────────────────────────────
function applyLocale() {
  const locale = getLocale();
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
}

// ── Theme (Day/Night) ───────────────────────────────────────────────
function getTheme() {
  return localStorage.getItem('alfarabi_theme') || 'dark';
}
function initTheme() {
  const theme = getTheme();
  document.documentElement.setAttribute('data-theme', theme);
}
function toggleTheme() {
  const current = getTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem('alfarabi_theme', next);
  document.documentElement.setAttribute('data-theme', next);
  // Update all toggle button icons
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.innerHTML = next === 'dark' ? '☀️' : '🌙';
    btn.setAttribute('aria-label', next === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  });
}

// ── Navbar ──────────────────────────────────────────────────────────
function initNavbar() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;

  // Scroll effect (passive for smooth scrolling)
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle('scrolled', window.scrollY > 40);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Active link highlighting
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const links = nav.querySelectorAll('.nav-link');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === 'index.html' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// ── Mobile Menu ─────────────────────────────────────────────────────
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('mobile-menu-open');
    hamburger.classList.toggle('hamburger-open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('mobile-menu-open');
      hamburger.classList.remove('hamburger-open');
      document.body.style.overflow = '';
    });
  });

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('mobile-menu-open')) {
      mobileMenu.classList.remove('mobile-menu-open');
      hamburger.classList.remove('hamburger-open');
      document.body.style.overflow = '';
    }
  });
}

// ── Animate On Scroll (IntersectionObserver) ────────────────────────
let _aosObserver = null;

function initAnimateOnScroll() {
  _aosObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.aosDelay || 0;
        setTimeout(() => {
          entry.target.classList.add('aos-visible');
          setTimeout(() => { entry.target.style.willChange = 'auto'; }, 800);
        }, parseInt(delay));
        _aosObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '40px 0px 0px 0px' });

  document.querySelectorAll('.aos-up, .aos-left, .aos-right, .aos-none').forEach(el => {
    // If already in or above the viewport, reveal immediately
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 60) {
      el.classList.add('aos-visible');
    } else {
      _aosObserver.observe(el);
    }
  });
}

/** Call after dynamically injecting AOS-classed elements. */
function observeNewAOS(container) {
  const root = container || document;
  root.querySelectorAll('.aos-up, .aos-left, .aos-right, .aos-none').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 60) {
      el.classList.add('aos-visible');
    } else if (_aosObserver) {
      _aosObserver.observe(el);
    }
  });
}

// ── Count Up Animation ──────────────────────────────────────────────
function initCountUp() {
  const counters = document.querySelectorAll('[data-countup]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.countup, 10);
        const suffix = el.dataset.countupSuffix || '';
        const prefix = el.dataset.countupPrefix || '';
        const duration = 2000;
        const start = performance.now();

        function update(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(eased * target);
          el.textContent = prefix + current.toLocaleString() + suffix;
          if (progress < 1) requestAnimationFrame(update);
          else el.textContent = prefix + target.toLocaleString() + suffix;
        }
        requestAnimationFrame(update);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(el => observer.observe(el));
}

// ── Auth UI Updates ─────────────────────────────────────────────────
async function updateAuthUI() {
  try {
    const isAdmin = await checkAdmin();
    const adminLinks = document.querySelectorAll('.admin-only');
    const loginLinks = document.querySelectorAll('.login-link');
    const avatarBtns = document.querySelectorAll('.avatar-btn');

    adminLinks.forEach(el => el.style.display = isAdmin ? '' : 'none');
    loginLinks.forEach(el => el.style.display = isAdmin ? 'none' : '');
    avatarBtns.forEach(el => el.style.display = isAdmin ? '' : 'none');
  } catch {}
}

// ── Shared Navbar HTML Builder ──────────────────────────────────────────
function buildNavbar(settings) {
  const locale = getLocale();
  const isRTL = locale === 'ar';
  const s = settings || {};
  const logoHTML = s.logo_url
    ? `<img src="${s.logo_url}" class="logo-icon" width="44" height="44" style="border-radius:12px;object-fit:cover" alt="Logo">`
    : `<svg class="logo-icon" width="44" height="44" viewBox="0 0 60 60" fill="none" aria-hidden="true">
          <rect width="60" height="60" rx="15" fill="rgba(212,175,55,0.15)"/>
          <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="var(--gold)" font-size="32" font-weight="700" font-family="serif">F</text>
        </svg>`;
  return `
  <nav class="navbar" role="navigation" aria-label="Main navigation">
    <div class="nav-inner">
      <a href="index.html" class="logo" aria-label="Go to Home">
        ${logoHTML}
        <div class="logo-text">
          <span class="logo-main">${t('logo.main')}</span>
          <span class="logo-sub">${t('logo.sub')}</span>
        </div>
      </a>
      <div class="nav-links">
        <a href="index.html" class="nav-link">${t('nav.home')}<span class="link-underline"></span></a>
        <a href="about.html" class="nav-link">${t('nav.about')}<span class="link-underline"></span></a>
        <a href="programs.html" class="nav-link">${t('nav.programs')}<span class="link-underline"></span></a>
        <a href="classes.html" class="nav-link">${t('nav.classes')}<span class="link-underline"></span></a>
        <a href="calendar.html" class="nav-link">${t('nav.calendar')}<span class="link-underline"></span></a>
        <a href="news.html" class="nav-link">${t('nav.news')}<span class="link-underline"></span></a>
        <a href="portfolio.html" class="nav-link">${t('nav.portfolio')}<span class="link-underline"></span></a>
      </div>
      <div class="nav-actions">
        <button class="nav-search-btn" id="nav-search-btn" aria-label="Search" title="Search (Ctrl+K)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </button>
        <button class="theme-toggle" onclick="toggleTheme()" aria-label="${getTheme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}">${getTheme() === 'dark' ? '☀️' : '🌙'}</button>
        <button class="lang-toggle" onclick="toggleLocale()" aria-label="Toggle language">${locale === 'en' ? 'العربية' : 'English'}</button>
        <a href="sign-in.html" class="btn-login login-link">${t('nav.admin')}</a>
        <a href="admin.html" class="avatar-btn admin-only" style="display:none" aria-label="Admin dashboard">
          <span class="avatar-initials">A</span>
        </a>
      </div>
      <button class="hamburger" aria-label="Toggle menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
    <div class="mobile-menu" aria-hidden="true">
      <div class="mobile-links">
        <a href="index.html" class="mobile-nav-link">${t('nav.home')}</a>
        <a href="about.html" class="mobile-nav-link">${t('nav.about')}</a>
        <a href="programs.html" class="mobile-nav-link">${t('nav.programs')}</a>
        <a href="classes.html" class="mobile-nav-link">${t('nav.classes')}</a>
        <a href="calendar.html" class="mobile-nav-link">${t('nav.calendar')}</a>
        <a href="news.html" class="mobile-nav-link">${t('nav.news')}</a>
        <a href="portfolio.html" class="mobile-nav-link">${t('nav.portfolio')}</a>
      </div>
      <div class="mobile-ctas">
        <button class="nav-search-btn mobile-search-btn" id="mob-search-btn" aria-label="Search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          Search
        </button>
        <button class="theme-toggle" onclick="toggleTheme()" aria-label="${getTheme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}">${getTheme() === 'dark' ? '☀️' : '🌙'}</button>
        <button class="lang-toggle" onclick="toggleLocale()">${locale === 'en' ? 'العربية' : 'English'}</button>
        <a href="sign-in.html" class="btn-gold login-link">${t('nav.admin')}</a>
        <a href="admin.html" class="btn-primary admin-only" style="display:none">${t('nav.dashboard')}</a>
      </div>
    </div>
  </nav>`;
}

// ── Shared Footer HTML Builder ──────────────────────────────────────
function buildFooter(settings) {
  const s = settings || {};
  const footerLogoHTML = s.logo_url
    ? `<img src="${s.logo_url}" width="40" height="40" style="border-radius:10px;object-fit:cover" alt="Logo">`
    : `<svg class="footer-logo-icon" width="40" height="40" viewBox="0 0 60 60" fill="none" aria-hidden="true">
            <rect width="60" height="60" rx="15" fill="rgba(212,175,55,0.15)"/>
            <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="var(--gold)" font-size="32" font-weight="700" font-family="serif">F</text>
          </svg>`;
  return `
  <footer class="footer" role="contentinfo">
    <div class="footer-separator" aria-hidden="true"></div>
    <div class="footer-inner">
      <div class="footer-brand">
        <a href="index.html" class="footer-logo-link">
          ${footerLogoHTML}
          <div>
            <div class="footer-logo-name">${s.site_name || 'Al-Farabi University'}</div>
            <div class="footer-logo-tagline">${s.department_name || 'AI Engineering'}</div>
          </div>
        </a>
        <p class="footer-brand-desc">${s.description || 'Pioneering AI education in Iraq.'}</p>
        <div class="footer-contact-info">
          <div class="footer-contact-item"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg> ${s.city || 'Baghdad'}, ${s.country || 'Iraq'}</div>
          <div class="footer-contact-item"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> ${s.contact_email || 'info@alfarabi.edu.iq'}</div>
          <div class="footer-contact-item"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg> ${s.phone || '+964 xxx xxx'}</div>
        </div>
        <div class="footer-socials">
          ${s.social_telegram ? `<a href="${s.social_telegram}" class="footer-social-link" target="_blank" rel="noopener" aria-label="Telegram"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.904-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg></a>` : ''}
          ${s.social_instagram ? `<a href="${s.social_instagram}" class="footer-social-link" target="_blank" rel="noopener" aria-label="Instagram"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>` : ''}
          ${s.social_linkedin ? `<a href="${s.social_linkedin}" class="footer-social-link" target="_blank" rel="noopener" aria-label="LinkedIn"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>` : ''}
          ${s.social_youtube ? `<a href="${s.social_youtube}" class="footer-social-link" target="_blank" rel="noopener" aria-label="YouTube"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>` : ''}
        </div>
      </div>
      <div class="footer-col"><div class="footer-col-title">${t('footer.academic')}</div><ul class="footer-col-links"><li><a href="programs.html">${t('footer.programs')}</a></li><li><a href="classes.html">${t('footer.classes')}</a></li><li><a href="calendar.html">${t('footer.calendar')}</a></li></ul></div>
      <div class="footer-col"><div class="footer-col-title">${t('footer.community')}</div><ul class="footer-col-links"><li><a href="news.html">${t('footer.news')}</a></li><li><a href="portfolio.html">${t('footer.portfolio')}</a></li><li><a href="calendar.html">${t('footer.events')}</a></li></ul></div>
      <div class="footer-col"><div class="footer-col-title">${t('footer.institution')}</div><ul class="footer-col-links"><li><a href="about.html">${t('footer.about')}</a></li><li><a href="about.html#faculty">${t('footer.faculty')}</a></li><li><a href="about.html#contact">${t('footer.contact')}</a></li></ul></div>
      <div class="footer-col"><div class="footer-col-title">${t('footer.account')}</div><ul class="footer-col-links"><li><a href="admin.html">${t('footer.admin')}</a></li><li><a href="sign-in.html">${t('footer.signin')}</a></li></ul></div>
    </div>
    <div class="footer-bottom">
      <div class="footer-bottom-inner">
        <div class="footer-copyright">© ${new Date().getFullYear()} ${s.site_name || 'Al-Farabi University'}. ${t('footer.rights')}</div>
        <div class="footer-credits">
          <span class="footer-credits-item"><span class="footer-credits-role">${t('footer.developed_by')}</span> <span class="footer-credits-name">Mohamed AL-Baqir</span></span>
          <span class="footer-credits-divider">·</span>
          <span class="footer-credits-item"><span class="footer-credits-role">${t('footer.supervised_by')}</span> <span class="footer-credits-name">Cenaa Ghani</span></span>
        </div>
        <div class="footer-bottom-links">
          <a href="about.html#contact">${t('footer.contact')}</a>
        </div>
      </div>
    </div>
  </footer>`;
}

// ── Insert Navbar + Footer ──────────────────────────────────────────
async function initPage() {
  // Load settings first for logo
  const settings = await getSiteSettings();

  // Insert navbar with logo
  const navTarget = document.getElementById('navbar-root');
  if (navTarget) navTarget.innerHTML = buildNavbar(settings);

  // Insert footer
  const footerTarget = document.getElementById('footer-root');
  if (footerTarget) {
    footerTarget.innerHTML = buildFooter(settings);
  }

  // Re-init after dynamic insert
  initNavbar();
  initMobileMenu();
  initSearch();
  updateAuthUI();
  initBackToTop();
}

// ── Global Search ────────────────────────────────────────────────────
function initSearch() {
  // Inject overlay into body if not already present
  if (document.getElementById('search-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'search-overlay';
  overlay.className = 'search-overlay';
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-label', 'Search');
  overlay.innerHTML = `
    <div class="search-backdrop" id="search-backdrop"></div>
    <div class="search-modal glass-card">
      <div class="search-header">
        <svg class="search-icon-inner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" id="search-input" class="search-input" placeholder="${t('search.placeholder')}" autocomplete="off" spellcheck="false">
        <kbd class="search-esc-hint">ESC</kbd>
      </div>
      <div class="search-results" id="search-results">
        <div class="search-empty">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <p>${t('search.empty')}</p>
          <span class="search-hint-key">Ctrl+K</span>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  let searchData = null;
  let debounceTimer = null;

  async function loadSearchData() {
    if (searchData) return searchData;
    const [articles, faculty, programs] = await Promise.all([
      getArticles().catch(() => []),
      getFaculty().catch(() => []),
      getProgramsData().catch(() => ({}))
    ]);
    searchData = {
      articles: (articles || []).filter(a => a.status === 'published'),
      faculty: faculty || [],
      programs: (programs && programs.programs) || []
    };
    return searchData;
  }

  function openSearch() {
    overlay.classList.add('search-open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('search-input').focus(), 80);
    loadSearchData(); // preload
  }

  function closeSearch() {
    overlay.classList.remove('search-open');
    document.body.style.overflow = '';
    document.getElementById('search-input').value = '';
    renderEmpty();
  }

  function renderEmpty() {
    document.getElementById('search-results').innerHTML = `
      <div class="search-empty">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <p>${t('search.empty')}</p>
      </div>`;
  }

  function renderNoResults(q) {
    document.getElementById('search-results').innerHTML = `
      <div class="search-empty">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <p>${t('search.no_results')} "<strong>${q}</strong>"</p>
      </div>`;
  }

  function highlight(text, q) {
    if (!q) return text;
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark class="search-highlight">$1</mark>');
  }

  async function doSearch(q) {
    const queryLower = q.trim().toLowerCase();
    const queryRaw   = q.trim(); // keep original for Arabic (no case folding needed)
    if (queryRaw.length < 2) { renderEmpty(); return; }

    // matches() checks English (lowercased) AND Arabic (raw) in one call
    function matches(...fields) {
      return fields.some(f =>
        (f || '').toLowerCase().includes(queryLower) || // English
        (f || '').includes(queryRaw)                    // Arabic / exact
      );
    }

    const data = await loadSearchData();
    const results = [];

    // Articles — EN + AR fields
    data.articles.forEach(a => {
      if (matches(a.title, a.summary, a.ar_title, a.ar_summary)) {
        // Prefer Arabic display title when user is searching in Arabic
        const isArabicQuery = /[\u0600-\u06FF]/.test(queryRaw);
        const displayTitle = (isArabicQuery && a.ar_title) ? a.ar_title : a.title;
        const displayDesc  = (isArabicQuery && a.ar_summary) ? a.ar_summary : a.summary;
        results.push({ type: 'article', icon: '📰', label: a.type === 'event' ? 'Event' : 'News', title: displayTitle, desc: displayDesc, href: `article.html?id=${a.id}` });
      }
    });

    // Programs — EN + AR fields
    data.programs.forEach(p => {
      if (matches(p.title, p.desc, p.ar_title, p.ar_desc)) {
        const isArabicQuery = /[\u0600-\u06FF]/.test(queryRaw);
        const displayTitle = (isArabicQuery && p.ar_title) ? p.ar_title : p.title;
        const displayDesc  = (isArabicQuery && p.ar_desc)  ? p.ar_desc  : p.desc;
        results.push({ type: 'program', icon: p.icon || '🎓', label: 'Program', title: displayTitle, desc: displayDesc, href: 'programs.html' });
      }
    });

    // Faculty — EN + AR fields
    data.faculty.forEach(f => {
      if (matches(f.name, f.role, f.ar_name, f.ar_role, (f.tags || []).join(' '))) {
        const isArabicQuery = /[\u0600-\u06FF]/.test(queryRaw);
        const displayName = (isArabicQuery && f.ar_name) ? f.ar_name : f.name;
        const displayRole = (isArabicQuery && f.ar_role) ? f.ar_role : f.role;
        results.push({ type: 'faculty', icon: '👤', label: 'Faculty', title: displayName, desc: displayRole, href: 'about.html#faculty' });
      }
    });

    const container = document.getElementById('search-results');
    if (results.length === 0) { renderNoResults(q.trim()); return; }

    const groups = { article: [], program: [], faculty: [] };
    results.forEach(r => groups[r.type].push(r));

    let html = '';
    const groupLabels = { article: t('search.group_news'), program: t('search.group_prog'), faculty: t('search.group_fac') };
    Object.entries(groups).forEach(([type, items]) => {
      if (items.length === 0) return;
      html += `<div class="search-group"><div class="search-group-label">${groupLabels[type]}</div>`;
      items.slice(0, 4).forEach(r => {
        html += `<a href="${r.href}" class="search-result-item" onclick="document.getElementById('search-overlay').classList.remove('search-open');document.body.style.overflow='';">
          <span class="search-result-icon">${r.icon}</span>
          <div class="search-result-body">
            <div class="search-result-title">${highlight(r.title, q.trim())}</div>
            ${r.desc ? `<div class="search-result-desc">${highlight((r.desc || '').slice(0, 80), q.trim())}${r.desc.length > 80 ? '…' : ''}</div>` : ''}
          </div>
          <span class="search-result-badge">${r.label}</span>
        </a>`;
      });
      html += '</div>';
    });
    container.innerHTML = html;
  }

  // Event bindings
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('#nav-search-btn, #mob-search-btn, .nav-search-btn');
    if (btn) { openSearch(); return; }
    if (e.target.id === 'search-backdrop') closeSearch();
  });

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); openSearch(); }
    if (e.key === '/' && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
    if (e.key === 'Escape' && overlay.classList.contains('search-open')) closeSearch();
  });

  document.addEventListener('input', (e) => {
    if (e.target.id !== 'search-input') return;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => doSearch(e.target.value), 250);
  });
}

// ── Faculty Profile Modal ────────────────────────────────────────────
function initFacultyModal() {
  // Inject modal into body if not already present
  if (document.getElementById('faculty-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'faculty-modal';
  modal.className = 'faculty-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Faculty profile');
  modal.innerHTML = `
    <div class="faculty-modal-backdrop" id="faculty-modal-backdrop"></div>
    <div class="faculty-modal-card glass-card">
      <button class="faculty-modal-close" id="faculty-modal-close" aria-label="Close">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <div id="faculty-modal-body"></div>
    </div>
  `;
  document.body.appendChild(modal);

  function openModal(faculty) {
    const initials = faculty.name.charAt(0) + ((faculty.name.split(' ').pop() || '').charAt(0));
    const avatarHTML = faculty.image_url
      ? `<img src="${faculty.image_url}" class="faculty-modal-avatar" alt="${faculty.name}" loading="lazy">`
      : `<div class="faculty-modal-avatar faculty-modal-avatar-initials" style="color:${faculty.color || 'var(--gold)'};border-color:${faculty.color || 'var(--gold)'}">${initials}</div>`;

    document.getElementById('faculty-modal-body').innerHTML = `
      <div class="faculty-modal-header">
        ${avatarHTML}
        <div class="faculty-modal-info">
          <h2 class="faculty-modal-name">${faculty.name}</h2>
          <div class="faculty-modal-role">${faculty.role || ''}</div>
          ${faculty.email ? `<a href="mailto:${faculty.email}" class="faculty-modal-email">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            ${faculty.email}
          </a>` : ''}
        </div>
      </div>
      ${faculty.bio ? `<div class="faculty-modal-divider"></div><p class="faculty-modal-bio">${faculty.bio}</p>` : ''}
      ${(faculty.tags && faculty.tags.length) ? `
        <div class="faculty-modal-divider"></div>
        <div class="faculty-modal-section-title">Specializations</div>
        <div class="faculty-modal-tags">
          ${faculty.tags.map(tag => `<span class="about-expert-tag" style="border-color:${(faculty.color||'var(--gold)')}40;color:${faculty.color||'var(--gold)'}">${tag}</span>`).join('')}
        </div>` : ''}
      ${(faculty.courses && faculty.courses.length) ? `
        <div class="faculty-modal-divider"></div>
        <div class="faculty-modal-section-title">Courses Taught</div>
        <ul class="faculty-modal-courses">
          ${faculty.courses.map(c => `<li>${c}</li>`).join('')}
        </ul>` : ''}
      ${faculty.office_hours ? `
        <div class="faculty-modal-divider"></div>
        <div class="faculty-modal-section-title">Office Hours</div>
        <p class="faculty-modal-office">${faculty.office_hours}</p>` : ''}
    `;
    modal.classList.add('faculty-modal-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('faculty-modal-open');
    document.body.style.overflow = '';
  }

  // Delegate clicks on faculty cards
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.about-faculty-card');
    if (card) {
      const name = card.querySelector('.about-faculty-name')?.textContent?.trim();
      const role = card.querySelector('.about-faculty-role')?.textContent?.trim();
      const img = card.querySelector('img.about-faculty-avatar');
      const avatar = card.querySelector('.about-faculty-avatar');
      const colorAttr = avatar?.style?.borderColor;
      // Build faculty data from DOM
      const tags = Array.from(card.querySelectorAll('.about-expert-tag')).map(t => t.textContent.trim());
      openModal({ name, role, image_url: img ? img.src : '', color: colorAttr || 'var(--gold)', tags, bio: '', email: '' });
    }
    if (e.target.id === 'faculty-modal-backdrop' || e.target.id === 'faculty-modal-close' || e.target.closest('#faculty-modal-close')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('faculty-modal-open')) closeModal();
  });
}

// ── Shared Error Fallback UI ────────────────────────────────────────
/**
 * Renders a branded error card inside any container element.
 * @param {string|HTMLElement} target  CSS selector or DOM node to render into
 * @param {object}             opts   { title, message, icon, retry }
 */
function renderError(target, { title = 'Something went wrong', message = 'We couldn\'t load this content. Please try refreshing the page.', icon = '⚠️', retry = false } = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;
  el.innerHTML = `
    <div class="glass-card" style="padding:48px 32px;text-align:center;max-width:480px;margin:0 auto">
      <div style="font-size:2.4rem;margin-bottom:16px">${icon}</div>
      <h3 style="font-size:1.15rem;color:var(--text-primary);margin-bottom:10px">${title}</h3>
      <p style="font-size:0.88rem;color:var(--text-muted);line-height:1.6;margin-bottom:${retry ? '20px' : '0'}">${message}</p>
      ${retry ? `<button onclick="location.reload()" class="btn-primary" style="padding:10px 22px;font-size:0.85rem">↻ Retry</button>` : ''}
    </div>`;
}

// ── Back-To-Top Button ──────────────────────────────────────────────
function initBackToTop() {
  // Skip on admin/owner/sign-in pages
  if (document.querySelector('.admin-page, .auth-page')) return;

  const btn = document.createElement('button');
  btn.id = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`;
  document.body.appendChild(btn);

  const toggle = () => btn.classList.toggle('visible', window.scrollY > 400);
  window.addEventListener('scroll', toggle, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  toggle(); // run once on load
}

// ── Skeleton / Shimmer Loader ───────────────────────────────────────
/**
 * Renders shimmer skeleton cards into a container.
 * @param {string|HTMLElement} target   CSS selector or DOM element
 * @param {'news'|'portfolio'|'calendar'|'programs'} type
 * @param {number} count  Number of skeleton cards to render (default: 6)
 */
function renderSkeleton(target, type = 'news', count = 6) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;

  const cards = {
    news: () => `
      <div class="skeleton-news-card">
        <div class="skeleton skeleton-news-img"></div>
        <div class="skeleton-news-body">
          <div class="skeleton skeleton-news-tag"></div>
          <div class="skeleton skeleton-news-h"></div>
          <div class="skeleton skeleton-news-h2"></div>
          <div class="skeleton skeleton-news-p"></div>
          <div class="skeleton skeleton-news-p2"></div>
          <div class="skeleton skeleton-news-meta"></div>
        </div>
      </div>`,
    portfolio: () => `
      <div class="skeleton-portfolio-card">
        <div class="skeleton skeleton-portfolio-img"></div>
        <div class="skeleton-portfolio-body">
          <div class="skeleton skeleton-portfolio-tag"></div>
          <div class="skeleton skeleton-portfolio-h"></div>
          <div class="skeleton skeleton-portfolio-p"></div>
          <div class="skeleton skeleton-portfolio-p2"></div>
        </div>
      </div>`,
    calendar: () => `
      <div class="skeleton-cal-card">
        <div class="skeleton skeleton-cal-date"></div>
        <div class="skeleton-cal-body">
          <div class="skeleton skeleton-cal-tag"></div>
          <div class="skeleton skeleton-cal-h"></div>
          <div class="skeleton skeleton-cal-p"></div>
          <div class="skeleton skeleton-cal-p2"></div>
        </div>
      </div>`,
    programs: () => `
      <div class="skeleton-prog-card">
        <div class="skeleton skeleton-prog-icon"></div>
        <div class="skeleton skeleton-prog-h"></div>
        <div class="skeleton skeleton-prog-p"></div>
        <div class="skeleton skeleton-prog-p2"></div>
        <div class="skeleton skeleton-prog-tag"></div>
      </div>`,
  };

  const template = cards[type] || cards.news;
  el.innerHTML = Array.from({ length: count }, template).join('');
}
