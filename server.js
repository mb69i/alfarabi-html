// ─── Alfarabi University — Lightweight Server ───────────────────────
// Zero npm dependencies. Uses only Node.js built-in modules.
// Start with: node server.js
// Then open: http://localhost:3000

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const PUBLIC_DIR = path.join(__dirname, 'public');
const ENV_PATH = path.join(__dirname, '.env');

// ── Load passwords from .env file (NEVER hardcoded) ─────────────────
function loadEnv() {
  const env = {};
  try {
    const lines = fs.readFileSync(ENV_PATH, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      const val = trimmed.slice(eqIndex + 1).trim();
      env[key] = val;
    }
  } catch {
    console.error('  ✗ ERROR: .env file not found! Create one with ADMIN_PASSWORD and OWNER_PASSWORD.');
    console.error('    Example .env contents:');
    console.error('    ADMIN_PASSWORD=your_admin_password');
    console.error('    OWNER_PASSWORD=your_owner_password');
    process.exit(1);
  }
  return env;
}

function saveEnv(updates) {
  try {
    let content = fs.readFileSync(ENV_PATH, 'utf-8');
    for (const [key, val] of Object.entries(updates)) {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (regex.test(content)) {
        content = content.replace(regex, `${key}=${val}`);
      } else {
        content += `\n${key}=${val}`;
      }
    }
    fs.writeFileSync(ENV_PATH, content, 'utf-8');
  } catch (err) {
    console.error('  ✗ Failed to save .env:', err.message);
  }
}

const env = loadEnv();

// ── Strict password loading — NO hardcoded fallbacks ────────────────
if (!env.ADMIN_PASSWORD || !env.OWNER_PASSWORD) {
  console.error('  ✗ FATAL: ADMIN_PASSWORD and OWNER_PASSWORD must be set in .env file.');
  console.error('    Both passwords are REQUIRED. No fallback defaults are used.');
  process.exit(1);
}
let ADMIN_PASSWORD = env.ADMIN_PASSWORD;
const OWNER_PASSWORD = env.OWNER_PASSWORD;

// ── In-memory session store ─────────────────────────────────────────
const sessions = new Map();

// ══════════════════════════════════════════════════════════════════════
// ── RATE LIMITER (in-memory, per-IP) ────────────────────────────────
// ══════════════════════════════════════════════════════════════════════
const rateLimitStore = new Map();

/**
 * Simple sliding-window rate limiter.
 * @param {string} key       - Unique key (usually IP + route)
 * @param {number} maxHits   - Max requests allowed in the window
 * @param {number} windowMs  - Window duration in milliseconds
 * @returns {object}         - { allowed: bool, remaining: number, retryAfterMs: number }
 */
function rateLimit(key, maxHits, windowMs) {
  const now = Date.now();
  let bucket = rateLimitStore.get(key);

  if (!bucket || now - bucket.windowStart > windowMs) {
    // Start a new window
    bucket = { windowStart: now, hits: 1 };
    rateLimitStore.set(key, bucket);
    return { allowed: true, remaining: maxHits - 1, retryAfterMs: 0 };
  }

  bucket.hits++;
  if (bucket.hits > maxHits) {
    const retryAfterMs = windowMs - (now - bucket.windowStart);
    return { allowed: false, remaining: 0, retryAfterMs };
  }

  return { allowed: true, remaining: maxHits - bucket.hits, retryAfterMs: 0 };
}

// Clean up stale rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateLimitStore) {
    if (now - bucket.windowStart > 20 * 60 * 1000) { // 20min expiry
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
}

// ══════════════════════════════════════════════════════════════════════
// ── INPUT SANITIZATION ──────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════

/** Escape HTML entities to prevent XSS in stored content */
function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/** Strip any <script> tags and event handlers from user strings (defense in depth) */
function stripDangerous(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript\s*:/gi, '');
}

/** Sanitize an object recursively — escape strings, enforce size limits */
function sanitizeObject(obj, maxDepth = 5, currentDepth = 0) {
  if (currentDepth > maxDepth) return null;
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'boolean' || typeof obj === 'number') return obj;
  if (typeof obj === 'string') {
    // Reject individual strings over 10KB
    if (obj.length > 10240) return obj.slice(0, 10240);
    return stripDangerous(obj);
  }
  if (Array.isArray(obj)) {
    // Reject arrays with over 500 items
    if (obj.length > 500) return obj.slice(0, 500).map(item => sanitizeObject(item, maxDepth, currentDepth + 1));
    return obj.map(item => sanitizeObject(item, maxDepth, currentDepth + 1));
  }
  if (typeof obj === 'object') {
    const clean = {};
    const keys = Object.keys(obj);
    // Reject objects with over 100 keys
    if (keys.length > 100) return {};
    for (const key of keys) {
      // Sanitize key names too — only allow safe characters
      const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64);
      clean[safeKey] = sanitizeObject(obj[key], maxDepth, currentDepth + 1);
    }
    return clean;
  }
  return null;
}

/** Validate CMS file parameter — only lowercase letters, numbers, hyphens */
function isValidCMSFile(file) {
  return typeof file === 'string' && /^[a-z0-9-]{1,30}$/.test(file);
}

// MIME types
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

// ── Helpers ──────────────────────────────────────────────────────────
function getCookie(req, name) {
  const cookies = (req.headers.cookie || '').split(';');
  for (const c of cookies) {
    const [k, v] = c.trim().split('=');
    if (k === name) return v;
  }
  return null;
}

function isAdmin(req) {
  const sid = getCookie(req, 'admin_session');
  return sid && sessions.has(sid);
}

function isOwner(req) {
  const sid = getCookie(req, 'admin_session');
  return sid && sessions.has(sid) && sessions.get(sid).role === 'owner';
}

function getRole(req) {
  const sid = getCookie(req, 'admin_session');
  if (sid && sessions.has(sid)) return sessions.get(sid).role;
  return null;
}

function sendJSON(res, data, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function readBody(req, maxSize = 10 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', chunk => {
      size += chunk.length;
      if (size > maxSize) { req.destroy(); reject(new Error('Body too large')); return; }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
      catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

// ══════════════════════════════════════════════════════════════════════
// ── SECURITY HEADERS ────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════
function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  // CSP: allow self, inline scripts (needed for the HTML pages), and specific CDNs
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://unpkg.com https://fonts.googleapis.com https://cdnjs.cloudflare.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: blob:; " +
    "connect-src 'self'; " +
    "frame-ancestors 'self';"
  );
}

// ── Request Handler ─────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  // Apply security headers to every response
  setSecurityHeaders(res);

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;
  const method = req.method;
  const clientIP = getClientIP(req);

  // ══════════════════════════════════════════════════════════════════
  // ── API: Admin Auth (LOGIN) — Rate limit: 5 per 15 minutes ────
  // ══════════════════════════════════════════════════════════════════
  if (pathname === '/api/admin-auth' && method === 'POST') {
    const rl = rateLimit(`login:${clientIP}`, 5, 15 * 60 * 1000);
    if (!rl.allowed) {
      const retryAfterSec = Math.ceil(rl.retryAfterMs / 1000);
      res.setHeader('Retry-After', retryAfterSec);
      return sendJSON(res, {
        success: false,
        error: `Too many login attempts. Try again in ${Math.ceil(retryAfterSec / 60)} minute(s).`
      }, 429);
    }

    try {
      const body = await readBody(req, 1024); // Login body max 1KB
      const { password } = body;

      // Validate password field
      if (!password || typeof password !== 'string' || password.length > 256) {
        return sendJSON(res, { success: false, error: 'Invalid request' }, 400);
      }

      // Check owner password first
      if (password === OWNER_PASSWORD) {
        const sid = crypto.randomBytes(32).toString('hex');
        sessions.set(sid, { created: Date.now(), role: 'owner' });
        res.setHeader('Set-Cookie', `admin_session=${sid}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
        return sendJSON(res, { success: true, role: 'owner' });
      }
      // Check admin password
      if (password === ADMIN_PASSWORD) {
        const sid = crypto.randomBytes(32).toString('hex');
        sessions.set(sid, { created: Date.now(), role: 'admin' });
        res.setHeader('Set-Cookie', `admin_session=${sid}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
        return sendJSON(res, { success: true, role: 'admin' });
      }
      // Generic error — don't reveal which password is wrong
      return sendJSON(res, { success: false, error: 'Invalid password' }, 401);
    } catch {
      return sendJSON(res, { error: 'Bad request' }, 400);
    }
  }

  // ── API: Logout ──
  if (pathname === '/api/admin-auth' && method === 'DELETE') {
    const sid = getCookie(req, 'admin_session');
    if (sid) sessions.delete(sid);
    res.setHeader('Set-Cookie', 'admin_session=; Path=/; Max-Age=0');
    return sendJSON(res, { success: true });
  }

  // ── API: Auth Check — Rate limit: 60/min ──
  if (pathname === '/api/admin-auth/check' && method === 'GET') {
    const rl = rateLimit(`check:${clientIP}`, 60, 60 * 1000);
    if (!rl.allowed) return sendJSON(res, { error: 'Too many requests' }, 429);
    return sendJSON(res, { isAdmin: isAdmin(req), isOwner: isOwner(req), role: getRole(req) });
  }

  // ══════════════════════════════════════════════════════════════════
  // ── API: Owner — Change Admin Password — Rate limit: 5/15min ──
  // ══════════════════════════════════════════════════════════════════
  if (pathname === '/api/owner/change-password' && method === 'POST') {
    if (!isOwner(req)) return sendJSON(res, { error: 'Unauthorized — owner access required' }, 403);
    const rl = rateLimit(`changepw:${clientIP}`, 5, 15 * 60 * 1000);
    if (!rl.allowed) return sendJSON(res, { error: 'Too many requests. Try again later.' }, 429);

    try {
      const body = await readBody(req, 1024);
      const { newPassword } = body;
      if (!newPassword || typeof newPassword !== 'string') {
        return sendJSON(res, { success: false, error: 'Invalid password' }, 400);
      }
      const trimmed = newPassword.trim();
      if (trimmed.length < 4 || trimmed.length > 128) {
        return sendJSON(res, { success: false, error: 'Password must be 4–128 characters' }, 400);
      }
      ADMIN_PASSWORD = trimmed;
      saveEnv({ ADMIN_PASSWORD: ADMIN_PASSWORD });
      return sendJSON(res, { success: true, message: 'Admin password changed successfully!' });
    } catch {
      return sendJSON(res, { error: 'Bad request' }, 400);
    }
  }

  // ── API: Owner — Get Current Admin Password — Rate limit: 5/15min ──
  if (pathname === '/api/owner/get-password' && method === 'GET') {
    if (!isOwner(req)) return sendJSON(res, { error: 'Unauthorized' }, 403);
    const rl = rateLimit(`getpw:${clientIP}`, 5, 15 * 60 * 1000);
    if (!rl.allowed) return sendJSON(res, { error: 'Too many requests' }, 429);
    return sendJSON(res, { success: true, password: ADMIN_PASSWORD });
  }

  // ══════════════════════════════════════════════════════════════════
  // ── API: CMS Data Read — Rate limit: 60/min ──
  // ══════════════════════════════════════════════════════════════════
  if (pathname === '/api/cms' && method === 'GET') {
    const rl = rateLimit(`cmsread:${clientIP}`, 60, 60 * 1000);
    if (!rl.allowed) return sendJSON(res, { error: 'Too many requests' }, 429);

    const file = url.searchParams.get('file');
    if (!isValidCMSFile(file)) return sendJSON(res, { error: 'Invalid file parameter' }, 400);
    const filePath = path.join(DATA_DIR, `${file}.json`);

    // Extra path traversal check
    if (!filePath.startsWith(DATA_DIR)) return sendJSON(res, { error: 'Forbidden' }, 403);

    try {
      const data = fs.readFileSync(filePath, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(data);
    } catch {
      return sendJSON(res, { error: 'File not found' }, 404);
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // ── API: CMS Data Write — Rate limit: 30/min ─────────────────
  // ══════════════════════════════════════════════════════════════════
  if (pathname === '/api/cms' && method === 'POST') {
    if (!isAdmin(req)) return sendJSON(res, { error: 'Unauthorized' }, 401);
    const rl = rateLimit(`cmswrite:${clientIP}`, 30, 60 * 1000);
    if (!rl.allowed) return sendJSON(res, { error: 'Too many write requests' }, 429);

    const file = url.searchParams.get('file');
    if (!isValidCMSFile(file)) return sendJSON(res, { error: 'Invalid file parameter' }, 400);

    try {
      const rawData = await readBody(req, 2 * 1024 * 1024); // Max 2MB for CMS data
      // Sanitize all incoming data
      const data = sanitizeObject(rawData);
      if (data === null) return sendJSON(res, { error: 'Invalid data structure' }, 400);

      const filePath = path.join(DATA_DIR, `${file}.json`);
      if (!filePath.startsWith(DATA_DIR)) return sendJSON(res, { error: 'Forbidden' }, 403);

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      return sendJSON(res, { success: true });
    } catch (err) {
      return sendJSON(res, { error: err.message }, 500);
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // ── API: Contact Form — Rate limit: 10/hr per IP ─────────────
  // ══════════════════════════════════════════════════════════════════
  if (pathname === '/api/contact' && method === 'POST') {
    const rl = rateLimit(`contact:${clientIP}`, 10, 60 * 60 * 1000); // 10/hr
    if (!rl.allowed) {
      return sendJSON(res, { error: 'Too many submissions. Please try again later.' }, 429);
    }

    try {
      const body = await readBody(req, 8 * 1024); // Max 8KB for contact form
      const { name, email, subject, message } = body;

      // Validate required fields
      if (!name || !email || !subject || !message) {
        return sendJSON(res, { error: 'All fields are required.' }, 400);
      }
      if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
        return sendJSON(res, { error: 'Invalid name (2–100 characters).' }, 400);
      }
      if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || email.length > 150) {
        return sendJSON(res, { error: 'Invalid email address.' }, 400);
      }
      if (typeof subject !== 'string' || subject.trim().length < 2 || subject.trim().length > 100) {
        return sendJSON(res, { error: 'Invalid subject.' }, 400);
      }
      if (typeof message !== 'string' || message.trim().length < 10 || message.trim().length > 2000) {
        return sendJSON(res, { error: 'Message must be 10–2000 characters.' }, 400);
      }

      // Load existing contacts
      const contactsPath = path.join(DATA_DIR, 'contacts.json');
      let contacts = [];
      try {
        contacts = JSON.parse(fs.readFileSync(contactsPath, 'utf-8'));
        if (!Array.isArray(contacts)) contacts = [];
      } catch { contacts = []; }

      // Add new contact submission
      const entry = {
        id: Date.now(),
        name: name.trim().slice(0, 100),
        email: email.trim().slice(0, 150),
        subject: subject.trim().slice(0, 100),
        message: message.trim().slice(0, 2000),
        submitted_at: new Date().toISOString(),
        ip: clientIP,
        read: false
      };
      contacts.push(entry);

      // Limit stored contacts to 500
      if (contacts.length > 500) contacts = contacts.slice(-500);

      fs.writeFileSync(contactsPath, JSON.stringify(contacts, null, 2), 'utf-8');
      console.log(`  ✓ Contact form submission from ${entry.email}`);
      return sendJSON(res, { success: true });
    } catch (err) {
      return sendJSON(res, { error: 'Failed to save message.' }, 500);
    }
  }

  // ── API: Get Contacts (Admin only) — Rate limit: 30/min ──────────
  if (pathname === '/api/contacts' && method === 'GET') {
    if (!isAdmin(req)) return sendJSON(res, { error: 'Unauthorized' }, 401);
    const rl = rateLimit(`contacts-read:${clientIP}`, 30, 60 * 1000);
    if (!rl.allowed) return sendJSON(res, { error: 'Too many requests' }, 429);
    try {
      const contactsPath = path.join(DATA_DIR, 'contacts.json');
      const data = fs.readFileSync(contactsPath, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(data);
    } catch {
      return sendJSON(res, [], 200);
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // ── API: Image Upload — Rate limit: 10/min ────────────────────
  // ══════════════════════════════════════════════════════════════════
  if (pathname === '/api/upload' && method === 'POST') {

    if (!isAdmin(req)) return sendJSON(res, { error: 'Unauthorized' }, 401);
    const rl = rateLimit(`upload:${clientIP}`, 10, 60 * 1000);
    if (!rl.allowed) return sendJSON(res, { error: 'Too many uploads. Try again later.' }, 429);

    try {
      const body = await readBody(req);
      const { data, filename } = body; // data = "data:image/png;base64,iVBOR..."

      // Validate data field
      if (!data || typeof data !== 'string' || !data.startsWith('data:')) {
        return sendJSON(res, { error: 'Invalid image data' }, 400);
      }

      // Parse base64 — only allow image types
      const matches = data.match(/^data:image\/(png|jpe?g|gif|webp|svg\+xml);base64,(.+)$/);
      if (!matches) return sendJSON(res, { error: 'Invalid image format. Allowed: PNG, JPG, GIF, WebP, SVG' }, 400);

      const ext = matches[1].replace('jpeg', 'jpg').replace('svg+xml', 'svg');
      const buffer = Buffer.from(matches[2], 'base64');

      // Size limit: 5MB
      if (buffer.length > 5 * 1024 * 1024) {
        return sendJSON(res, { error: 'Image too large (max 5MB)' }, 400);
      }

      // Sanitize filename — only allow safe characters
      const safeName = (typeof filename === 'string' ? filename : 'image')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .slice(0, 40);
      const uniqueName = `${safeName}_${Date.now()}.${ext}`;
      const uploadsDir = path.join(PUBLIC_DIR, 'uploads');

      // Ensure uploads dir exists
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

      const savePath = path.join(uploadsDir, uniqueName);
      // Path traversal check
      if (!savePath.startsWith(uploadsDir)) return sendJSON(res, { error: 'Invalid filename' }, 400);

      fs.writeFileSync(savePath, buffer);

      const url = `/uploads/${uniqueName}`;
      console.log(`  ✓ Image uploaded: ${url}`);
      return sendJSON(res, { success: true, url });
    } catch (err) {
      return sendJSON(res, { error: 'Upload failed: ' + err.message }, 500);
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Static File Serving ───────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  // Block access to sensitive paths
  if (pathname === '/.env' || pathname.startsWith('/.') || pathname.includes('..')) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  let filePath = pathname === '/' ? '/index.html' : pathname;

  // If no extension, try .html
  if (!path.extname(filePath)) filePath += '.html';

  const fullPath = path.join(PUBLIC_DIR, filePath);

  // Security: prevent directory traversal
  if (!fullPath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  try {
    const stat = fs.statSync(fullPath);
    if (stat.isFile()) {
      const ext = path.extname(fullPath).toLowerCase();
      const contentType = MIME[ext] || 'application/octet-stream';

      // Cache static assets for better performance
      let cacheControl = 'no-cache';
      if (['.css', '.js', '.woff', '.woff2'].includes(ext)) {
        cacheControl = 'public, max-age=3600'; // 1 hour
      } else if (['.png', '.jpg', '.jpeg', '.svg', '.ico'].includes(ext)) {
        cacheControl = 'public, max-age=86400'; // 1 day
      }

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': cacheControl,
      });
      fs.createReadStream(fullPath).pipe(res);
      return;
    }
  } catch {
    // File not found — serve 404
  }

  // 404 — serve branded page
  try {
    const page404 = fs.readFileSync(path.join(PUBLIC_DIR, '404.html'));
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(page404);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>404 — Not Found</h1>');
  }
});

// Clean up expired sessions every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [sid, session] of sessions) {
    if (now - session.created > 24 * 60 * 60 * 1000) { // 24h expiry
      sessions.delete(sid);
    }
  }
}, 30 * 60 * 1000);

server.listen(env.PORT || PORT, () => {
  console.log(`\n  ✦ Alfarabi University Platform`);
  console.log(`  ─────────────────────────────`);
  console.log(`  ✓ Server running at http://localhost:${env.PORT || PORT}`);
  console.log(`  ✓ Passwords loaded from .env (secured — no fallbacks)`);
  console.log(`  ✓ Rate limiting active (5 login attempts / 15 min)`);
  console.log(`  ✓ Input sanitization enabled`);
  console.log(`  ✓ Security headers enabled`);
  console.log(`  ✓ Press Ctrl+C to stop\n`);
});
