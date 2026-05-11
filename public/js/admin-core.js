// admin-core.js - Shared state, constants, utilities, image upload, flash, persist, navigation
// ── Alfarabi — Admin Dashboard Logic ─────────────────────────────
// Full CRUD for articles, cohorts, projects, faculty, timeline, and site settings.

let adminState = {
  active: 'Dashboard',
  settings: null,
  articles: [],
  cohorts: [],
  projects: [],
  faculty: [],
  timeline: [],
  values: [],
  programsData: null,
  saving: false,
  editingArticle: null,
  editingCohort: null,
  editingProject: null,
  editingFaculty: null,
  editingMilestone: null,
  editingValue: null,
  editingProgram: null,
};

const FACULTY_COLORS = ['var(--gold)', 'var(--crimson-light)', '#7eb3f9', '#a78bfa', '#34d399', '#f97066'];
const PROGRAM_COLORS = ['var(--gold)', 'var(--crimson-light)', '#7eb3f9', '#a78bfa', '#f97066', '#34d399'];

const sideItems = [
  { label: 'Dashboard', icon: '▦', section: 'Overview' },
  { label: 'News & Articles', icon: '📰', section: 'Content' },
  { label: 'Events & Calendar', icon: '📅', section: 'Content' },
  { label: 'Classes & Cohorts', icon: '🏫', section: 'Content' },
  { label: 'Student Projects', icon: '🎓', section: 'Content' },
  { label: 'Contact Messages', icon: '✉️', section: 'Content' },
  { label: 'Mission Values', icon: '⚖️', section: 'About Page' },

  { label: 'Faculty & Team', icon: '👩‍🏫', section: 'About Page' },
  { label: 'History & Timeline', icon: '📜', section: 'About Page' },
  { label: 'Flagship Program', icon: '⭐', section: 'Programs Page' },
  { label: 'All Programs', icon: '📚', section: 'Programs Page' },
  { label: 'Admissions', icon: '📋', section: 'Programs Page' },
  { label: 'Site Settings', icon: '⚙️', section: 'Configuration' },
];

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

// ── Image Upload Helper ──
async function uploadImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: reader.result, filename: file.name.replace(/\.[^.]+$/, '') }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        resolve(json.url);
      } catch (err) { reject(err); }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

function imageUploadHTML(id, currentUrl, label = 'Image') {
  const preview = currentUrl
    ? `<img src="${esc(currentUrl)}" style="max-width:100%;max-height:120px;border-radius:8px;margin-bottom:8px;display:block">`
    : '';
  return `<div class="admin-form-group full">
    <label class="admin-label">${label}</label>
    <div id="${id}-wrap" style="border:2px dashed var(--glass-border);border-radius:12px;padding:16px;text-align:center;cursor:pointer;transition:border-color 0.3s;position:relative">
      <div id="${id}-preview">${preview}</div>
      <input type="file" id="${id}" accept="image/*" style="position:absolute;inset:0;opacity:0;cursor:pointer">
      <div style="color:var(--text-muted);font-size:0.82rem">${currentUrl ? '📎 Click or drag to replace' : '📷 Click or drag image here'}</div>
      <div id="${id}-status" style="font-size:0.75rem;margin-top:6px;color:var(--gold)"></div>
    </div>
    <input type="hidden" id="${id}-url" value="${esc(currentUrl || '')}">
  </div>`;
}

function initImageUpload(id) {
  const input = document.getElementById(id);
  const wrap = document.getElementById(id + '-wrap');
  const preview = document.getElementById(id + '-preview');
  const status = document.getElementById(id + '-status');
  const urlInput = document.getElementById(id + '-url');
  if (!input) return;

  // Drag visual feedback
  wrap.addEventListener('dragover', (e) => { e.preventDefault(); wrap.style.borderColor = 'var(--gold)'; });
  wrap.addEventListener('dragleave', () => { wrap.style.borderColor = 'var(--glass-border)'; });
  wrap.addEventListener('drop', (e) => { e.preventDefault(); wrap.style.borderColor = 'var(--glass-border)'; if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); });

  input.addEventListener('change', () => { if (input.files[0]) handleFile(input.files[0]); });

  async function handleFile(file) {
    if (!file.type.startsWith('image/')) { status.textContent = '❌ Not an image file'; status.style.color = 'var(--crimson-light)'; return; }
    if (file.size > 5 * 1024 * 1024) { status.textContent = '❌ File too large (max 5MB)'; status.style.color = 'var(--crimson-light)'; return; }

    status.textContent = '⏳ Uploading…';
    status.style.color = 'var(--gold)';
    try {
      const url = await uploadImage(file);
      urlInput.value = url;
      preview.innerHTML = `<img src="${url}" style="max-width:100%;max-height:120px;border-radius:8px;margin-bottom:8px;display:block">`;
      status.textContent = '✅ Uploaded!';
      status.style.color = '#4ade80';
    } catch (err) {
      status.textContent = '❌ ' + (err.message || 'Upload failed');
      status.style.color = 'var(--crimson-light)';
    }
  }
}

function flash(type, text) {
  const main = document.getElementById('admin-main-content');
  const existing = main.querySelector('.admin-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = `admin-toast admin-toast-${type}`;
  toast.textContent = text;
  main.prepend(toast);
  setTimeout(() => toast.remove(), 3000);
}

function statusBadgeHTML(status) {
  const colors = {
    published: ['rgba(74,222,128,0.15)', '#4ade80'],
    draft: ['rgba(251,146,60,0.15)', '#fb923c'],
    active: ['rgba(74,222,128,0.15)', '#4ade80'],
    inactive: ['rgba(106,120,160,0.2)', '#6a78a0'],
    approved: ['rgba(74,222,128,0.15)', '#4ade80'],
    pending: ['rgba(251,146,60,0.15)', '#fb923c'],
    rejected: ['rgba(165,28,48,0.15)', 'var(--crimson-light)'],
  };
  const [bg, fg] = colors[status] || colors.draft;
  return `<span class="admin-status-badge" style="background:${bg};color:${fg}">${status}</span>`;
}

// ── Save helper ──
async function persist(file, data, label) {
  adminState.saving = true;
  try {
    await saveData(file, data);
    clearCache(file);
    flash('success', `${label} saved successfully!`);
    return true;
  } catch {
    flash('error', `Failed to save ${label.toLowerCase()}.`);
    return false;
  } finally {
    adminState.saving = false;
  }
}

// ── Navigation ──
function setActiveSection(label) {
  adminState.active = label;
  renderAdmin();
}
