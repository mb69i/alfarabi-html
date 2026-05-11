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

// ── CRUD: Articles ──
async function saveArticle() {
  const a = adminState.editingArticle;
  if (!a) return;
  if (!a.title.trim()) { flash('error', 'Title is required.'); return; }
  const exists = adminState.articles.find(x => x.id === a.id);
  adminState.articles = exists ? adminState.articles.map(x => x.id === a.id ? a : x) : [...adminState.articles, a];
  if (await persist('articles', adminState.articles, a.type === 'news' ? 'Article' : 'Event')) {
    closeModal();
  }
}

// ── Shared inline two-click delete confirmation ───────────────────
// First call: highlights the button and rewires onclick to confirmed version. Returns false.
// Second call (confirmed=true): returns true so the delete proceeds.
function adminConfirmDelete(confirmed, confirmOnclick) {
  if (confirmed) return true;
  // Build the un-confirmed version of the onclick string to match against
  const unconfirmed = confirmOnclick.replace(', true)', ')').replace(',true)', ')');
  const allBtns = document.querySelectorAll('[onclick]');
  allBtns.forEach(btn => {
    if ((btn.getAttribute('onclick') || '').trim() === unconfirmed.trim()) {
      btn.textContent = 'Confirm?';
      btn.style.cssText += ';background:var(--crimson)!important;color:#fff!important;border-color:var(--crimson)!important;';
      btn.setAttribute('onclick', confirmOnclick);
    }
  });
  return false;
}


async function deleteArticle(id, confirmed) {

  if (!adminConfirmDelete(confirmed, `deleteArticle('${id}', true)`)) return;
  adminState.articles = adminState.articles.filter(a => a.id !== id);
  await persist('articles', adminState.articles, 'Article');
  renderAdmin();
}

async function toggleArticleStatus(id) {
  adminState.articles = adminState.articles.map(a =>
    a.id === id ? { ...a, status: a.status === 'published' ? 'draft' : 'published' } : a
  );
  await persist('articles', adminState.articles, 'Article status');
  renderAdmin();
}

// ── CRUD: Cohorts ──
async function saveCohort() {
  const c = adminState.editingCohort;
  if (!c) return;
  if (!c.title.trim()) { flash('error', 'Cohort title is required.'); return; }
  const exists = adminState.cohorts.find(x => x.id === c.id);
  adminState.cohorts = exists ? adminState.cohorts.map(x => x.id === c.id ? c : x) : [...adminState.cohorts, c];
  if (await persist('cohorts', adminState.cohorts, 'Cohort')) {
    closeModal();
  }
}

async function deleteCohort(id, confirmed) {
  if (!adminConfirmDelete(confirmed, `deleteCohort('${id}', true)`)) return;
  adminState.cohorts = adminState.cohorts.filter(c => c.id !== id);
  await persist('cohorts', adminState.cohorts, 'Cohort');
  renderAdmin();
}

// ── CRUD: Projects ──
async function saveProject() {
  const p = adminState.editingProject;
  if (!p) return;
  if (!p.title.trim()) { flash('error', 'Project title is required.'); return; }
  if (!p.student_name.trim()) { flash('error', 'Student name is required.'); return; }
  const exists = adminState.projects.find(x => x.id === p.id);
  adminState.projects = exists ? adminState.projects.map(x => x.id === p.id ? p : x) : [...adminState.projects, p];
  if (await persist('projects', adminState.projects, 'Project')) {
    closeModal();
  }
}

async function deleteProject(id, confirmed) {
  if (!adminConfirmDelete(confirmed, `deleteProject('${id}', true)`)) return;
  adminState.projects = adminState.projects.filter(p => p.id !== id);
  await persist('projects', adminState.projects, 'Project');
  renderAdmin();
}

async function setProjectStatus(id, status) {
  adminState.projects = adminState.projects.map(p => p.id === id ? { ...p, status } : p);
  await persist('projects', adminState.projects, 'Project status');
  renderAdmin();
}

// ── CRUD: Faculty ──
async function saveFacultyMember() {
  const f = adminState.editingFaculty;
  if (!f) return;
  if (!f.name.trim()) { flash('error', 'Name is required.'); return; }
  const exists = adminState.faculty.find(x => x.id === f.id);
  adminState.faculty = exists ? adminState.faculty.map(x => x.id === f.id ? f : x) : [...adminState.faculty, f];
  if (await persist('faculty', adminState.faculty, 'Faculty member')) {
    closeModal();
  }
}

async function deleteFacultyMember(id, confirmed) {
  if (!adminConfirmDelete(confirmed, `deleteFacultyMember('${id}', true)`)) return;
  adminState.faculty = adminState.faculty.filter(f => f.id !== id);
  await persist('faculty', adminState.faculty, 'Faculty');
  renderAdmin();
}

// ── CRUD: Timeline ──
async function saveMilestone() {
  const m = adminState.editingMilestone;
  if (!m) return;
  if (!m.label.trim()) { flash('error', 'Title is required.'); return; }
  const exists = adminState.timeline.find(x => x.id === m.id);
  adminState.timeline = exists ? adminState.timeline.map(x => x.id === m.id ? m : x) : [...adminState.timeline, m];
  adminState.timeline.sort((a, b) => a.order - b.order);
  if (await persist('timeline', adminState.timeline, 'Timeline milestone')) {
    closeModal();
  }
}

async function deleteMilestone(id, confirmed) {
  if (!adminConfirmDelete(confirmed, `deleteMilestone('${id}', true)`)) return;
  adminState.timeline = adminState.timeline.filter(m => m.id !== id);
  await persist('timeline', adminState.timeline, 'Timeline');
  renderAdmin();
}

// ── CRUD: Mission Values ──
async function saveValue() {
  const v = adminState.editingValue;
  if (!v) return;
  if (!v.title.trim()) { flash('error', 'Title is required.'); return; }
  const exists = adminState.values.find(x => x.id === v.id);
  adminState.values = exists ? adminState.values.map(x => x.id === v.id ? v : x) : [...adminState.values, v];
  adminState.values.sort((a, b) => (a.order||0) - (b.order||0));
  if (await persist('values', adminState.values, 'Mission value')) {
    closeModal();
  }
}

async function deleteValue(id, confirmed) {
  if (!adminConfirmDelete(confirmed, `deleteValue('${id}', true)`)) return;
  adminState.values = adminState.values.filter(v => v.id !== id);
  await persist('values', adminState.values, 'Mission value');
  renderAdmin();
}

// ── CRUD: Programs ──
async function saveProgramItem() {
  const p = adminState.editingProgram;
  if (!p) return;
  if (!p.title.trim()) { flash('error', 'Title is required.'); return; }
  const pd = adminState.programsData;
  const exists = pd.programs.find(x => x.id === p.id);
  pd.programs = exists ? pd.programs.map(x => x.id === p.id ? p : x) : [...pd.programs, p];
  pd.programs.sort((a,b) => (a.order||0) - (b.order||0));
  if (await persist('programs', pd, 'Program')) {
    closeModal();
  }
}

async function deleteProgramItem(id, confirmed) {
  if (!adminConfirmDelete(confirmed, `deleteProgramItem('${id}', true)`)) return;
  adminState.programsData.programs = adminState.programsData.programs.filter(p => p.id !== id);
  await persist('programs', adminState.programsData, 'Program');
  renderAdmin();
}

async function handleSaveFlagship(e) {
  e.preventDefault();
  const pd = adminState.programsData;
  pd.flagship = pd.flagship || {};
  pd.flagship.heading = document.getElementById('fl-heading').value;
  pd.flagship.title = document.getElementById('fl-title').value;
  pd.flagship.title_accent = document.getElementById('fl-title-accent').value;
  pd.flagship.desc = document.getElementById('fl-desc').value;
  pd.flagship.highlights = document.getElementById('fl-highlights').value;
  await persist('programs', pd, 'Flagship');
}

async function handleSaveAdmissions(e) {
  e.preventDefault();
  const pd = adminState.programsData;
  pd.requirements = pd.requirements || {};
  pd.requirements.bsc_title = document.getElementById('req-bsc-title').value;
  pd.requirements.bsc_items = document.getElementById('req-bsc-items').value.split('\n').map(l => l.trim()).filter(Boolean);
  pd.requirements.msc_title = document.getElementById('req-msc-title').value;
  pd.requirements.msc_items = document.getElementById('req-msc-items').value.split('\n').map(l => l.trim()).filter(Boolean);
  await persist('programs', pd, 'Admissions');
}

// ── Site Settings ──
async function handleSaveSettings(e) {
  e.preventDefault();
  const form = e.target;
  const inputs = form.querySelectorAll('[data-key]');
  inputs.forEach(input => {
    const key = input.dataset.key;
    const type = input.dataset.type;
    adminState.settings[key] = type === 'number' ? Number(input.value) : input.value;
  });
  // Save logo URL from upload widget
  const logoUrl = document.getElementById('settings-logo-url');
  if (logoUrl) adminState.settings.logo_url = logoUrl.value;
  adminState.settings.updated_at = new Date().toISOString();
  await persist('site-settings', adminState.settings, 'Settings');
}

// ── Modal ──
function openModal(type, item) {
  if (type === 'article') {
    adminState.editingArticle = item || { id: uid(), type: 'news', title: '', summary: '', author: '', published_at: new Date().toISOString().slice(0, 10), status: 'draft', image_url: '' };
  } else if (type === 'event') {
    adminState.editingArticle = item || { id: uid(), type: 'event', title: '', summary: '', author: '', published_at: new Date().toISOString().slice(0, 10), status: 'draft', event_date: new Date().toISOString().slice(0, 10), category: 'seminar', location: '', time: '', cohort: '', image_url: '' };
  } else if (type === 'cohort') {
    adminState.editingCohort = item || { id: uid(), year: new Date().getFullYear(), title: '', description: '', rep_name: '', rep_email: '', student_count: 0, status: 'active' };
  } else if (type === 'project') {
    adminState.editingProject = item || { id: uid(), title: '', description: '', student_name: '', cohort: '', tags: [], github_url: '', demo_url: '', status: 'pending', submitted_at: new Date().toISOString().slice(0, 10) };
  } else if (type === 'faculty') {
    adminState.editingFaculty = item || { id: uid(), name: '', role: '', tags: [], color: FACULTY_COLORS[adminState.faculty.length % FACULTY_COLORS.length], order: adminState.faculty.length + 1, image_url: '' };
  } else if (type === 'milestone') {
    adminState.editingMilestone = item || { id: uid(), year: String(new Date().getFullYear()), label: '', desc: '', order: adminState.timeline.length + 1 };
  } else if (type === 'value') {
    adminState.editingValue = item || { id: uid(), icon: '🔹', title: '', desc: '', color: FACULTY_COLORS[adminState.values.length % FACULTY_COLORS.length], order: adminState.values.length + 1 };
  } else if (type === 'program') {
    adminState.editingProgram = item || { id: uid(), title: '', desc: '', duration: '4 years', icon: '🤖', color: PROGRAM_COLORS[(adminState.programsData?.programs||[]).length % PROGRAM_COLORS.length], badge: 'Program', modules: [], order: (adminState.programsData?.programs||[]).length + 1 };
  }
  renderModal(type);
}

function closeModal() {
  adminState.editingArticle = null;
  adminState.editingCohort = null;
  adminState.editingProject = null;
  adminState.editingFaculty = null;
  adminState.editingMilestone = null;
  adminState.editingValue = null;
  adminState.editingProgram = null;
  const overlay = document.getElementById('admin-modal-overlay');
  if (overlay) overlay.remove();
}

function renderModal(type) {
  let existing = document.getElementById('admin-modal-overlay');
  if (existing) existing.remove();

  let title = '', fieldsHTML = '', saveFn = '';

  if (type === 'article' || type === 'event') {
    const a = adminState.editingArticle;
    const isNew = !adminState.articles.find(x => x.id === a.id);
    title = isNew ? `New ${a.type === 'news' ? 'Article' : 'Event'}` : `Edit ${a.type === 'news' ? 'Article' : 'Event'}`;
    saveFn = 'saveArticle()';
    fieldsHTML = `
      <div class="admin-form-grid">
        <div class="admin-form-group full"><label class="admin-label">Title</label><input class="admin-input" id="modal-title" value="${esc(a.title)}" placeholder="Enter a title…"></div>
        <div class="admin-form-group full"><label class="admin-label">Summary</label><textarea class="admin-textarea" id="modal-summary" placeholder="Write a short summary…">${esc(a.summary)}</textarea></div>
        ${imageUploadHTML('modal-image', a.image_url || '', '📷 Cover Image')}
        <div class="admin-form-group"><label class="admin-label">${a.type === 'news' ? 'Author' : 'Organizer'}</label><input class="admin-input" id="modal-author" value="${esc(a.author)}"></div>
        <div class="admin-form-group"><label class="admin-label">Publish Date</label><input class="admin-input" id="modal-date" type="date" value="${a.published_at.slice(0,10)}"></div>
        <div class="admin-form-group"><label class="admin-label">Status</label><select class="admin-select" id="modal-status"><option value="draft" ${a.status==='draft'?'selected':''}>Draft</option><option value="published" ${a.status==='published'?'selected':''}>Published</option></select></div>
        <div class="admin-form-group"><label class="admin-label">Type</label><select class="admin-select" id="modal-type"><option value="news" ${a.type==='news'?'selected':''}>News</option><option value="event" ${a.type==='event'?'selected':''}>Event</option></select></div>
      </div>
      ${a.type === 'event' ? `
      <div class="admin-section-divider">📅 Event Details</div>
      <div class="admin-form-grid">
        <div class="admin-form-group"><label class="admin-label">Event Date</label><input class="admin-input" id="modal-event-date" type="date" value="${(a.event_date||'').slice(0,10)}"></div>
        <div class="admin-form-group"><label class="admin-label">Time</label><input class="admin-input" id="modal-event-time" value="${esc(a.time||'')}" placeholder="10:00 AM – 12:00 PM"></div>
        <div class="admin-form-group"><label class="admin-label">Location</label><input class="admin-input" id="modal-event-location" value="${esc(a.location||'')}" placeholder="Hall A, Building 3"></div>
        <div class="admin-form-group"><label class="admin-label">Category</label><select class="admin-select" id="modal-event-category"><option value="seminar" ${a.category==='seminar'?'selected':''}>Seminar</option><option value="exam" ${a.category==='exam'?'selected':''}>Exam</option><option value="deadline" ${a.category==='deadline'?'selected':''}>Deadline</option><option value="social" ${a.category==='social'?'selected':''}>Social</option><option value="lecture" ${a.category==='lecture'?'selected':''}>Lecture</option><option value="workshop" ${a.category==='workshop'?'selected':''}>Workshop</option><option value="other" ${a.category==='other'?'selected':''}>Other</option></select></div>
      </div>` : ''}`;
  } else if (type === 'cohort') {
    const c = adminState.editingCohort;
    const isNew = !adminState.cohorts.find(x => x.id === c.id);
    title = isNew ? 'New Cohort' : 'Edit Cohort';
    saveFn = 'saveCohort()';
    fieldsHTML = `<div class="admin-form-grid">
      <div class="admin-form-group"><label class="admin-label">Cohort Title</label><input class="admin-input" id="modal-title" value="${esc(c.title)}" placeholder="e.g. Cohort 2024–2025"></div>
      <div class="admin-form-group"><label class="admin-label">Enrollment Year</label><input class="admin-input" id="modal-year" type="number" value="${c.year}"></div>
      <div class="admin-form-group full"><label class="admin-label">Description</label><textarea class="admin-textarea" id="modal-desc" placeholder="Describe this cohort…">${esc(c.description)}</textarea></div>
      <div class="admin-form-group"><label class="admin-label">Representative Name</label><input class="admin-input" id="modal-rep" value="${esc(c.rep_name)}"></div>
      <div class="admin-form-group"><label class="admin-label">Representative Email</label><input class="admin-input" id="modal-rep-email" value="${esc(c.rep_email)}"></div>
      <div class="admin-form-group"><label class="admin-label">Student Count</label><input class="admin-input" id="modal-students" type="number" value="${c.student_count}"></div>
      <div class="admin-form-group"><label class="admin-label">Status</label><select class="admin-select" id="modal-status"><option value="active" ${c.status==='active'?'selected':''}>Active</option><option value="inactive" ${c.status==='inactive'?'selected':''}>Inactive</option></select></div>
    </div>`;
  } else if (type === 'project') {
    const p = adminState.editingProject;
    const isNew = !adminState.projects.find(x => x.id === p.id);
    title = isNew ? 'New Project' : 'Edit Project';
    saveFn = 'saveProject()';
    fieldsHTML = `<div class="admin-form-grid">
      <div class="admin-form-group full"><label class="admin-label">Project Title</label><input class="admin-input" id="modal-title" value="${esc(p.title)}"></div>
      <div class="admin-form-group full"><label class="admin-label">Description</label><textarea class="admin-textarea" id="modal-desc">${esc(p.description)}</textarea></div>
      <div class="admin-form-group"><label class="admin-label">Student Name</label><input class="admin-input" id="modal-student" value="${esc(p.student_name)}"></div>
      <div class="admin-form-group"><label class="admin-label">Cohort</label><input class="admin-input" id="modal-cohort" value="${esc(p.cohort)}"></div>
      <div class="admin-form-group full"><label class="admin-label">Tags (comma-separated)</label><input class="admin-input" id="modal-tags" value="${esc(p.tags.join(', '))}"></div>
      <div class="admin-form-group"><label class="admin-label">GitHub URL</label><input class="admin-input" id="modal-github" value="${esc(p.github_url)}"></div>
      <div class="admin-form-group"><label class="admin-label">Demo URL</label><input class="admin-input" id="modal-demo" value="${esc(p.demo_url)}"></div>
      <div class="admin-form-group"><label class="admin-label">Status</label><select class="admin-select" id="modal-status"><option value="pending" ${p.status==='pending'?'selected':''}>Pending</option><option value="approved" ${p.status==='approved'?'selected':''}>Approved</option><option value="rejected" ${p.status==='rejected'?'selected':''}>Rejected</option></select></div>
    </div>`;
  } else if (type === 'faculty') {
    const f = adminState.editingFaculty;
    const isNew = !adminState.faculty.find(x => x.id === f.id);
    title = isNew ? 'New Faculty Member' : 'Edit Faculty Member';
    fieldsHTML = `<div class="admin-form-grid">
      <div class="admin-form-group"><label class="admin-label">Full Name</label><input class="admin-input" id="modal-name" value="${esc(f.name)}" placeholder="e.g. Dr. Ahmed M."></div>
      <div class="admin-form-group"><label class="admin-label">Display Order</label><input class="admin-input" id="modal-order" type="number" value="${f.order || 1}"></div>
      ${imageUploadHTML('modal-photo', f.image_url || '', '📷 Profile Photo')}
      <div class="admin-form-group full"><label class="admin-label">Role / Title</label><input class="admin-input" id="modal-role" value="${esc(f.role)}" placeholder="e.g. Department Head · Machine Learning"></div>
      <div class="admin-form-group full"><label class="admin-label">Expertise Tags (comma-separated)</label><input class="admin-input" id="modal-tags" value="${esc(f.tags.join(', '))}" placeholder="Deep Learning, NLP, Computer Vision"></div>
      <div class="admin-form-group"><label class="admin-label">Accent Color</label><select class="admin-select" id="modal-color">${FACULTY_COLORS.map(c => `<option value="${c}" ${f.color===c?'selected':''}>${c.replace('var(--','').replace(')','')}</option>`).join('')}</select></div>
    </div>`;
  } else if (type === 'milestone') {
    const m = adminState.editingMilestone;
    const isNew = !adminState.timeline.find(x => x.id === m.id);
    title = isNew ? 'New Milestone' : 'Edit Milestone';
    fieldsHTML = `<div class="admin-form-grid">
      <div class="admin-form-group"><label class="admin-label">Year</label><input class="admin-input" id="modal-year" value="${esc(m.year)}" placeholder="e.g. 2024"></div>
      <div class="admin-form-group"><label class="admin-label">Display Order</label><input class="admin-input" id="modal-order" type="number" value="${m.order || 1}"></div>
      <div class="admin-form-group full"><label class="admin-label">Title</label><input class="admin-input" id="modal-title" value="${esc(m.label)}" placeholder="e.g. Department Founded"></div>
      <div class="admin-form-group full"><label class="admin-label">Description</label><textarea class="admin-textarea" id="modal-desc" placeholder="What happened this year…">${esc(m.desc)}</textarea></div>
    </div>`;
  } else if (type === 'value') {
    const v = adminState.editingValue;
    const isNew = !adminState.values.find(x => x.id === v.id);
    title = isNew ? 'New Mission Value' : 'Edit Mission Value';
    fieldsHTML = `<div class="admin-form-grid">
      <div class="admin-form-group"><label class="admin-label">Icon (emoji)</label><input class="admin-input" id="modal-icon" value="${esc(v.icon)}" placeholder="🔬"></div>
      <div class="admin-form-group"><label class="admin-label">Display Order</label><input class="admin-input" id="modal-order" type="number" value="${v.order || 1}"></div>
      <div class="admin-form-group full"><label class="admin-label">Title</label><input class="admin-input" id="modal-title" value="${esc(v.title)}" placeholder="e.g. Research Excellence"></div>
      <div class="admin-form-group full"><label class="admin-label">Description</label><textarea class="admin-textarea" id="modal-desc" placeholder="Describe this value…">${esc(v.desc)}</textarea></div>
      <div class="admin-form-group"><label class="admin-label">Accent Color</label><select class="admin-select" id="modal-color">${FACULTY_COLORS.map(c => `<option value="${c}" ${v.color===c?'selected':''}>${c.replace('var(--','').replace(')','')}</option>`).join('')}</select></div>
    </div>`;
  } else if (type === 'program') {
    const p = adminState.editingProgram;
    const isNew = !(adminState.programsData?.programs||[]).find(x => x.id === p.id);
    title = isNew ? 'New Program' : 'Edit Program';
    fieldsHTML = `<div class="admin-form-grid">
      <div class="admin-form-group"><label class="admin-label">Program Title</label><input class="admin-input" id="modal-title" value="${esc(p.title)}"></div>
      <div class="admin-form-group"><label class="admin-label">Badge Label</label><input class="admin-input" id="modal-badge" value="${esc(p.badge)}" placeholder="Bachelor's, Master's…"></div>
      <div class="admin-form-group full"><label class="admin-label">Description</label><textarea class="admin-textarea" id="modal-desc">${esc(p.desc)}</textarea></div>
      <div class="admin-form-group"><label class="admin-label">Duration</label><input class="admin-input" id="modal-duration" value="${esc(p.duration)}" placeholder="4 years"></div>
      <div class="admin-form-group"><label class="admin-label">Icon (emoji)</label><input class="admin-input" id="modal-icon" value="${esc(p.icon)}" placeholder="🤖"></div>
      <div class="admin-form-group full"><label class="admin-label">Key Modules (comma-separated)</label><input class="admin-input" id="modal-modules" value="${esc((p.modules||[]).join(', '))}"></div>
      <div class="admin-form-group"><label class="admin-label">Accent Color</label><select class="admin-select" id="modal-color">${PROGRAM_COLORS.map(c => `<option value="${c}" ${p.color===c?'selected':''}>${c.replace('var(--','').replace(')','')}</option>`).join('')}</select></div>
      <div class="admin-form-group"><label class="admin-label">Display Order</label><input class="admin-input" id="modal-order" type="number" value="${p.order || 1}"></div>
    </div>`;
  }

  const overlay = document.createElement('div');
  overlay.id = 'admin-modal-overlay';
  overlay.className = 'admin-modal-overlay';
  overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
  overlay.innerHTML = `<div class="admin-modal">
    <div class="admin-modal-head"><h3 class="admin-modal-title">${title}</h3><button class="admin-modal-close" onclick="closeModal()">✕</button></div>
    ${fieldsHTML}
    <div class="admin-modal-footer">
      <button class="admin-action-btn" onclick="closeModal()" style="padding:8px 20px">Cancel</button>
      <button class="btn-primary" onclick="collectModalAndSave('${type}')" style="padding:8px 20px;font-size:0.85rem">Save</button>
    </div>
  </div>`;
  document.body.appendChild(overlay);

  // Init image upload widgets after DOM insert
  setTimeout(() => {
    if (type === 'article' || type === 'event') initImageUpload('modal-image');
    if (type === 'faculty') initImageUpload('modal-photo');
  }, 50);
}

function collectModalAndSave(type) {
  if (type === 'article' || type === 'event') {
    const a = adminState.editingArticle;
    a.title = document.getElementById('modal-title').value;
    a.summary = document.getElementById('modal-summary').value;
    a.author = document.getElementById('modal-author').value;
    a.published_at = document.getElementById('modal-date').value;
    a.status = document.getElementById('modal-status').value;
    a.type = document.getElementById('modal-type').value;
    a.image_url = document.getElementById('modal-image-url')?.value || a.image_url || '';
    if (a.type === 'event') {
      a.event_date = (document.getElementById('modal-event-date') || {}).value || a.published_at;
      a.time = (document.getElementById('modal-event-time') || {}).value || '';
      a.location = (document.getElementById('modal-event-location') || {}).value || '';
      a.category = (document.getElementById('modal-event-category') || {}).value || 'seminar';
    }
    saveArticle();
  } else if (type === 'cohort') {
    const c = adminState.editingCohort;
    c.title = document.getElementById('modal-title').value;
    c.year = Number(document.getElementById('modal-year').value);
    c.description = document.getElementById('modal-desc').value;
    c.rep_name = document.getElementById('modal-rep').value;
    c.rep_email = document.getElementById('modal-rep-email').value;
    c.student_count = Number(document.getElementById('modal-students').value);
    c.status = document.getElementById('modal-status').value;
    saveCohort();
  } else if (type === 'project') {
    const p = adminState.editingProject;
    p.title = document.getElementById('modal-title').value;
    p.description = document.getElementById('modal-desc').value;
    p.student_name = document.getElementById('modal-student').value;
    p.cohort = document.getElementById('modal-cohort').value;
    p.tags = document.getElementById('modal-tags').value.split(',').map(t => t.trim()).filter(Boolean);
    p.github_url = document.getElementById('modal-github').value;
    p.demo_url = document.getElementById('modal-demo').value;
    p.status = document.getElementById('modal-status').value;
    saveProject();
  } else if (type === 'faculty') {
    const f = adminState.editingFaculty;
    f.name = document.getElementById('modal-name').value;
    f.role = document.getElementById('modal-role').value;
    f.tags = document.getElementById('modal-tags').value.split(',').map(t => t.trim()).filter(Boolean);
    f.color = document.getElementById('modal-color').value;
    f.order = Number(document.getElementById('modal-order').value);
    f.image_url = document.getElementById('modal-photo-url')?.value || f.image_url || '';
    saveFacultyMember();
  } else if (type === 'milestone') {
    const m = adminState.editingMilestone;
    m.year = document.getElementById('modal-year').value;
    m.label = document.getElementById('modal-title').value;
    m.desc = document.getElementById('modal-desc').value;
    m.order = Number(document.getElementById('modal-order').value);
    saveMilestone();
  } else if (type === 'value') {
    const v = adminState.editingValue;
    v.icon = document.getElementById('modal-icon').value;
    v.title = document.getElementById('modal-title').value;
    v.desc = document.getElementById('modal-desc').value;
    v.color = document.getElementById('modal-color').value;
    v.order = Number(document.getElementById('modal-order').value);
    saveValue();
  } else if (type === 'program') {
    const p = adminState.editingProgram;
    p.title = document.getElementById('modal-title').value;
    p.badge = document.getElementById('modal-badge').value;
    p.desc = document.getElementById('modal-desc').value;
    p.duration = document.getElementById('modal-duration').value;
    p.icon = document.getElementById('modal-icon').value;
    p.modules = document.getElementById('modal-modules').value.split(',').map(t => t.trim()).filter(Boolean);
    p.color = document.getElementById('modal-color').value;
    p.order = Number(document.getElementById('modal-order').value);
    saveProgramItem();
  }
}

function esc(str) { return (str || '').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

// ── Logout ──
async function handleLogout() {
  try {
    await fetch('/api/admin-auth', { method: 'DELETE' });
    window.location.href = 'index.html';
  } catch { flash('error', 'Failed to log out.'); }
}

// ── Render Main Content ──
function renderAdmin() {
  const main = document.getElementById('admin-main-content');
  const { active, settings, articles, cohorts, projects } = adminState;

  // Update sidebar active
  document.querySelectorAll('.admin-sidebar-link').forEach(el => {
    el.classList.toggle('active', el.dataset.label === active);
  });
  document.querySelectorAll('.admin-mobile-tab').forEach(el => {
    el.classList.toggle('active', el.dataset.label === active);
  });

  const newsItems = articles.filter(a => a.type === 'news');
  const eventItems = articles.filter(a => a.type === 'event');
  const pendingProjects = projects.filter(p => p.status === 'pending');

  let html = '';

  if (active === 'Dashboard') {
    html = `
      <div class="admin-stats-grid">
        ${[
          { num: cohorts.reduce((s,c)=>s+c.student_count,0), label: 'Total Students', color: 'var(--gold)', icon: '👥' },
          { num: cohorts.filter(c=>c.status==='active').length, label: 'Active Cohorts', color: 'var(--crimson-light)', icon: '🏫' },
          { num: articles.filter(a=>a.status==='draft').length, label: 'Draft Articles', color: '#7eb3f9', icon: '📰' },
          { num: pendingProjects.length, label: 'Projects Pending', color: '#a78bfa', icon: '🎓' },
        ].map(s => `<div class="admin-stat-card"><div class="admin-stat-accent" style="background:${s.color}"></div><div class="admin-stat-icon" style="background:${s.color}22"><span style="font-size:1.1rem">${s.icon}</span></div><div class="admin-stat-num">${s.num}</div><div class="admin-stat-label">${s.label}</div></div>`).join('')}
      </div>
      <div class="admin-panel"><div class="admin-panel-head"><div class="admin-panel-title">Quick Actions</div></div><div class="admin-panel-body">
        <div class="admin-quick-grid">
          ${sideItems.filter(i=>i.section==='Content').map(item => `<button class="admin-quick-action" onclick="setActiveSection('${item.label}')"><div class="admin-quick-icon"><span style="font-size:1rem">${item.icon}</span></div><div class="admin-quick-label">${item.label}</div></button>`).join('')}
          <button class="admin-quick-action" onclick="setActiveSection('Site Settings')"><div class="admin-quick-icon"><span style="font-size:1rem">⚙️</span></div><div class="admin-quick-label">Site Settings</div></button>
        </div>
      </div></div>`;
  } else if (active === 'News & Articles') {
    html = renderContentList('📰 News & Articles', newsItems, 'news', 'article');
  } else if (active === 'Events & Calendar') {
    html = renderContentList('📅 Events & Calendar', eventItems, 'event', 'event');
  } else if (active === 'Classes & Cohorts') {
    html = renderCohorts();
  } else if (active === 'Student Projects') {
    html = renderProjects();
  } else if (active === 'Mission Values') {
    html = renderValuesAdmin();
  } else if (active === 'Faculty & Team') {
    html = renderFacultyAdmin();
  } else if (active === 'History & Timeline') {
    html = renderTimelineAdmin();
  } else if (active === 'Flagship Program') {
    html = renderFlagshipAdmin();
  } else if (active === 'All Programs') {
    html = renderProgramsAdmin();
  } else if (active === 'Admissions') {
    html = renderAdmissionsAdmin();
  } else if (active === 'Contact Messages') {
    html = '<div style="text-align:center;padding:60px 0;color:var(--text-muted)">Loading messages…</div>';
    main.innerHTML = html;
    renderContactsAdmin();
    return;
  } else if (active === 'Site Settings') {
    html = renderSettings();
  }

  main.innerHTML = html;

  // Init logo upload widget when on settings page
  if (active === 'Site Settings') {
    setTimeout(() => initImageUpload('settings-logo'), 50);
  }
}

function renderContentList(title, items, typeForNew, modalType) {
  return `<div class="admin-panel"><div class="admin-panel-head"><div class="admin-panel-title">${title}</div><button class="btn-primary" style="font-size:0.82rem;padding:7px 16px" onclick="openModal('${modalType}')">+ Add ${typeForNew === 'news' ? 'Article' : 'Event'}</button></div><div class="admin-panel-body">
    ${items.length === 0 ? `<div style="text-align:center;padding:40px 0;color:var(--text-muted)">No items yet. Click <strong>+ Add</strong> to create one.</div>` : ''}
    <div class="admin-content-list">${items.map(a => `<div class="admin-content-item">
      <div class="admin-content-left">
        ${a.image_url ? `<img src="${a.image_url}" style="width:48px;height:48px;border-radius:10px;object-fit:cover;flex-shrink:0">` : `<div class="admin-content-icon" style="background:rgba(212,175,55,0.15)"><span>${a.type==='news'?'📰':'📅'}</span></div>`}
        <div><div class="admin-content-title">${a.title||'Untitled'}</div><div class="admin-content-meta">${a.author||'No author'} · ${a.published_at?new Date(a.published_at).toLocaleDateString():'—'}</div></div>
      </div>
      <div class="admin-content-actions">
        ${statusBadgeHTML(a.status)}
        <button class="admin-action-btn" onclick="toggleArticleStatus('${a.id}')">${a.status==='published'?'Unpublish':'Publish'}</button>
        <button class="admin-action-btn" onclick="openModal('${a.type}',adminState.articles.find(x=>x.id==='${a.id}'))">Edit</button>
        <button class="admin-action-btn" style="color:var(--crimson-light)" onclick="deleteArticle('${a.id}')">Delete</button>
      </div>
    </div>`).join('')}</div>
  </div></div>`;
}

function renderCohorts() {
  const { cohorts } = adminState;
  return `<div class="admin-panel"><div class="admin-panel-head"><div class="admin-panel-title">🏫 Classes & Cohorts</div><button class="btn-primary" style="font-size:0.82rem;padding:7px 16px" onclick="openModal('cohort')">+ Add Cohort</button></div><div class="admin-panel-body" style="padding:0 22px 20px">
    ${cohorts.length===0?'<div style="text-align:center;padding:40px 0;color:var(--text-muted)">No cohorts yet.</div>':''}
    ${cohorts.length>0?`<table class="admin-table"><thead><tr><th>Cohort</th><th>Rep</th><th>Students</th><th>Status</th><th>Actions</th></tr></thead><tbody>
      ${cohorts.map(c=>`<tr><td style="color:var(--text-primary);font-weight:500">${c.title}</td><td>${c.rep_name}</td><td>${c.student_count}</td><td>${statusBadgeHTML(c.status)}</td><td><div style="display:flex;gap:6px"><button class="admin-action-btn" onclick="openModal('cohort',adminState.cohorts.find(x=>x.id==='${c.id}'))">Edit</button><button class="admin-action-btn" style="color:var(--crimson-light)" onclick="deleteCohort('${c.id}')">Delete</button></div></td></tr>`).join('')}
    </tbody></table>`:''}
  </div></div>`;
}

function renderProjects() {
  const { projects } = adminState;
  return `<div class="admin-panel"><div class="admin-panel-head"><div class="admin-panel-title">🎓 Student Projects</div><button class="btn-primary" style="font-size:0.82rem;padding:7px 16px" onclick="openModal('project')">+ Add Project</button></div><div class="admin-panel-body" style="padding:0 22px 20px">
    ${projects.length===0?'<div style="text-align:center;padding:40px 0;color:var(--text-muted)">No projects yet.</div>':''}
    ${projects.length>0?`<table class="admin-table"><thead><tr><th>Project</th><th>Student</th><th>Tags</th><th>Status</th><th>Actions</th></tr></thead><tbody>
      ${projects.map(p=>`<tr><td style="color:var(--text-primary);font-weight:500">${p.title}</td><td>${p.student_name}</td><td style="font-size:0.78rem;color:var(--text-muted)">${p.tags.join(', ')}</td><td>${statusBadgeHTML(p.status)}</td><td><div style="display:flex;gap:6px;flex-wrap:wrap">
        ${p.status==='pending'?`<button class="admin-action-btn" onclick="setProjectStatus('${p.id}','approved')">Approve</button><button class="admin-action-btn" onclick="setProjectStatus('${p.id}','rejected')">Reject</button>`:''}
        <button class="admin-action-btn" onclick="openModal('project',adminState.projects.find(x=>x.id==='${p.id}'))">Edit</button><button class="admin-action-btn" style="color:var(--crimson-light)" onclick="deleteProject('${p.id}')">Delete</button></div></td></tr>`).join('')}
    </tbody></table>`:''}
  </div></div>`;
}

function renderSettings() {
  const s = adminState.settings;
  if (!s) return '<div style="color:var(--text-muted);padding:20px">Loading settings…</div>';

  const fields = [
    { id: 'site_name', label: 'Site Name' }, { id: 'department_name', label: 'Department Name' },
    { id: 'city', label: 'City' }, { id: 'country', label: 'Country' },
    { id: 'contact_email', label: 'Contact Email' }, { id: 'phone', label: 'Phone' },
    { id: 'hero_title', label: 'Hero Title' }, { id: 'founded_year', label: 'Founded Year', type: 'number' },
    { id: 'total_students', label: 'Total Students', type: 'number' }, { id: 'research_papers', label: 'Research Papers', type: 'number' },
    { id: 'ai_specializations', label: 'AI Specializations', type: 'number' }, { id: 'partner_universities', label: 'Partner Universities', type: 'number' },
  ];
  const socialFields = [
    { id: 'social_telegram', label: 'Telegram' }, { id: 'social_instagram', label: 'Instagram' },
    { id: 'social_linkedin', label: 'LinkedIn' }, { id: 'social_youtube', label: 'YouTube' },
    { id: 'social_twitter', label: 'Twitter / X' }, { id: 'social_facebook', label: 'Facebook' },
  ];

  return `<div class="admin-panel"><div class="admin-panel-head"><div class="admin-panel-title">⚙️ Site Settings</div><span style="font-size:0.75rem;color:var(--gold)">Last saved: ${s.updated_at?new Date(s.updated_at).toLocaleString():'Never'}</span></div><div class="admin-panel-body">
    <form onsubmit="handleSaveSettings(event)" id="settings-form">
      <div class="admin-section-divider">🖼️ Site Logo</div>
      <div class="admin-form-grid">
        ${imageUploadHTML('settings-logo', s.logo_url || '', '📷 Upload Site Logo')}
      </div>
      <div class="admin-form-grid">
        ${fields.map(f=>`<div class="admin-form-group"><label class="admin-label">${f.label}</label><input class="admin-input" data-key="${f.id}" data-type="${f.type||'text'}" type="${f.type||'text'}" value="${esc(String(s[f.id]||''))}"></div>`).join('')}
        <div class="admin-form-group full"><label class="admin-label">Hero Subtitle</label><input class="admin-input" data-key="hero_subtitle" value="${esc(s.hero_subtitle||'')}"></div>
        <div class="admin-form-group full"><label class="admin-label">Description</label><textarea class="admin-textarea" data-key="description">${esc(s.description||'')}</textarea></div>
      </div>
      <div class="admin-section-divider">📖 About Page Hero</div>
      <div class="admin-form-grid">
        <div class="admin-form-group full">
          <label class="admin-label">Hero Subtitle — English</label>
          <textarea class="admin-textarea" data-key="about_hero_sub" rows="2" placeholder="e.g. Al-Farabi University's AI Engineering Department — pioneering AI education in Iraq since 2018.">${esc(s.about_hero_sub || '')}</textarea>
        </div>
        <div class="admin-form-group full">
          <label class="admin-label">Hero Subtitle — Arabic (العربية)</label>
          <textarea class="admin-textarea" data-key="ar_about_hero_sub" rows="2" dir="rtl" style="font-family:var(--font-arabic);text-align:right" placeholder="قسم هندسة الذكاء الاصطناعي في جامعة الفارابي…">${esc(s.ar_about_hero_sub || '')}</textarea>
        </div>
      </div>
      <div class="admin-section-divider">🔗 Social Links</div>
      <div class="admin-form-grid">
        ${socialFields.map(f=>`<div class="admin-form-group"><label class="admin-label">${f.label}</label><input class="admin-input" data-key="${f.id}" value="${esc(s[f.id]||'')}"></div>`).join('')}
      </div>
      <div style="display:flex;gap:10px;margin-top:16px"><button type="submit" class="btn-primary" style="font-size:0.85rem;padding:9px 20px">Save Changes</button></div>
    </form>
  </div></div>`;
}

function renderFacultyAdmin() {
  const { faculty } = adminState;
  const sorted = [...faculty].sort((a,b) => (a.order||0) - (b.order||0));
  return `<div class="admin-panel"><div class="admin-panel-head"><div class="admin-panel-title">👩‍🏫 Faculty & Team</div><button class="btn-primary" style="font-size:0.82rem;padding:7px 16px" onclick="openModal('faculty')">+ Add Member</button></div><div class="admin-panel-body" style="padding:0 22px 20px">
    ${sorted.length===0?'<div style="text-align:center;padding:40px 0;color:var(--text-muted)">No faculty members yet.</div>':''}
    ${sorted.length>0?`<table class="admin-table"><thead><tr><th>#</th><th>Name</th><th>Role</th><th>Expertise</th><th>Actions</th></tr></thead><tbody>
      ${sorted.map(f=>`<tr>
        <td style="color:var(--text-muted)">${f.order||'—'}</td>
        <td><div style="display:flex;align-items:center;gap:10px">${f.image_url ? `<img src="${f.image_url}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;border:2px solid ${f.color}">` : `<span style="width:32px;height:32px;border-radius:50%;border:2px solid ${f.color};display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:800;color:${f.color}">${f.name.charAt(0)}${(f.name.split(' ').pop()||'').charAt(0)}</span>`}<span style="color:var(--text-primary);font-weight:500">${f.name}</span></div></td>
        <td style="font-size:0.82rem">${f.role}</td>
        <td style="font-size:0.75rem;color:var(--text-muted)">${(f.tags||[]).join(', ')}</td>
        <td><div style="display:flex;gap:6px"><button class="admin-action-btn" onclick="openModal('faculty',adminState.faculty.find(x=>x.id==='${f.id}'))">Edit</button><button class="admin-action-btn" style="color:var(--crimson-light)" onclick="deleteFacultyMember('${f.id}')">Delete</button></div></td>
      </tr>`).join('')}
    </tbody></table>`:''}
  </div></div>`;
}

function renderTimelineAdmin() {
  const { timeline } = adminState;
  const sorted = [...timeline].sort((a,b) => (a.order||0) - (b.order||0));
  return `<div class="admin-panel"><div class="admin-panel-head"><div class="admin-panel-title">📜 History & Timeline</div><button class="btn-primary" style="font-size:0.82rem;padding:7px 16px" onclick="openModal('milestone')">+ Add Milestone</button></div><div class="admin-panel-body" style="padding:0 22px 20px">
    ${sorted.length===0?'<div style="text-align:center;padding:40px 0;color:var(--text-muted)">No milestones yet.</div>':''}
    ${sorted.length>0?`<table class="admin-table"><thead><tr><th>#</th><th>Year</th><th>Title</th><th>Description</th><th>Actions</th></tr></thead><tbody>
      ${sorted.map(m=>`<tr>
        <td style="color:var(--text-muted)">${m.order||'—'}</td>
        <td style="color:var(--gold);font-weight:700;font-size:0.85rem">${m.year}</td>
        <td style="color:var(--text-primary);font-weight:500">${m.label}</td>
        <td style="font-size:0.82rem;color:var(--text-muted);max-width:280px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${m.desc}</td>
        <td><div style="display:flex;gap:6px"><button class="admin-action-btn" onclick="openModal('milestone',adminState.timeline.find(x=>x.id==='${m.id}'))">Edit</button><button class="admin-action-btn" style="color:var(--crimson-light)" onclick="deleteMilestone('${m.id}')">Delete</button></div></td>
      </tr>`).join('')}
    </tbody></table>`:''}
  </div></div>`;
}

function renderValuesAdmin() {
  const { values } = adminState;
  const sorted = [...values].sort((a,b) => (a.order||0) - (b.order||0));
  return `<div class="admin-panel"><div class="admin-panel-head"><div class="admin-panel-title">⚖️ Mission Values</div><button class="btn-primary" style="font-size:0.82rem;padding:7px 16px" onclick="openModal('value')">+ Add Value</button></div><div class="admin-panel-body" style="padding:0 22px 20px">
    ${sorted.length===0?'<div style="text-align:center;padding:40px 0;color:var(--text-muted)">No values yet.</div>':''}
    ${sorted.length>0?`<table class="admin-table"><thead><tr><th>#</th><th>Icon</th><th>Title</th><th>Description</th><th>Actions</th></tr></thead><tbody>
      ${sorted.map(v=>`<tr>
        <td style="color:var(--text-muted)">${v.order||'—'}</td>
        <td style="font-size:1.2rem">${v.icon}</td>
        <td style="color:var(--text-primary);font-weight:500">${v.title}</td>
        <td style="font-size:0.82rem;color:var(--text-muted);max-width:280px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${v.desc}</td>
        <td><div style="display:flex;gap:6px"><button class="admin-action-btn" onclick="openModal('value',adminState.values.find(x=>x.id==='${v.id}'))">Edit</button><button class="admin-action-btn" style="color:var(--crimson-light)" onclick="deleteValue('${v.id}')">Delete</button></div></td>
      </tr>`).join('')}
    </tbody></table>`:''}
  </div></div>`;
}

function renderFlagshipAdmin() {
  const pd = adminState.programsData || {};
  const fl = pd.flagship || {};
  return `<div class="admin-panel"><div class="admin-panel-head"><div class="admin-panel-title">⭐ Flagship Program</div></div><div class="admin-panel-body">
    <form onsubmit="handleSaveFlagship(event)">
      <div class="admin-form-grid">
        <div class="admin-form-group"><label class="admin-label">Badge Heading</label><input class="admin-input" id="fl-heading" value="${esc(fl.heading||'')}"></div>
        <div class="admin-form-group"><label class="admin-label">Title</label><input class="admin-input" id="fl-title" value="${esc(fl.title||'')}"></div>
        <div class="admin-form-group"><label class="admin-label">Title Accent (gold text)</label><input class="admin-input" id="fl-title-accent" value="${esc(fl.title_accent||'')}"></div>
        <div class="admin-form-group full"><label class="admin-label">Description</label><textarea class="admin-textarea" id="fl-desc">${esc(fl.desc||'')}</textarea></div>
        <div class="admin-form-group full"><label class="admin-label">Highlights (comma-separated)</label><input class="admin-input" id="fl-highlights" value="${esc(fl.highlights||'')}" placeholder="240 ECTS Credits, 4 Year Duration, Industry Projects"></div>
      </div>
      <div style="margin-top:16px"><button type="submit" class="btn-primary" style="font-size:0.85rem;padding:9px 20px">Save Flagship</button></div>
    </form>
  </div></div>`;
}

function renderProgramsAdmin() {
  const pd = adminState.programsData || {};
  const programs = (pd.programs || []).sort((a,b) => (a.order||0) - (b.order||0));
  return `<div class="admin-panel"><div class="admin-panel-head"><div class="admin-panel-title">📚 All Programs</div><button class="btn-primary" style="font-size:0.82rem;padding:7px 16px" onclick="openModal('program')">+ Add Program</button></div><div class="admin-panel-body" style="padding:0 22px 20px">
    ${programs.length===0?'<div style="text-align:center;padding:40px 0;color:var(--text-muted)">No programs yet.</div>':''}
    ${programs.length>0?`<table class="admin-table"><thead><tr><th>#</th><th>Icon</th><th>Program</th><th>Badge</th><th>Duration</th><th>Actions</th></tr></thead><tbody>
      ${programs.map(p=>`<tr>
        <td style="color:var(--text-muted)">${p.order||'—'}</td>
        <td style="font-size:1.2rem">${p.icon}</td>
        <td style="color:var(--text-primary);font-weight:500">${p.title}</td>
        <td><span style="font-size:0.72rem;padding:2px 8px;border-radius:12px;border:1px solid ${p.color};color:${p.color}">${p.badge}</span></td>
        <td style="font-size:0.82rem;color:var(--text-muted)">${p.duration}</td>
        <td><div style="display:flex;gap:6px"><button class="admin-action-btn" onclick="openModal('program',(adminState.programsData.programs||[]).find(x=>x.id==='${p.id}'))">Edit</button><button class="admin-action-btn" style="color:var(--crimson-light)" onclick="deleteProgramItem('${p.id}')">Delete</button></div></td>
      </tr>`).join('')}
    </tbody></table>`:''}
  </div></div>`;
}

// ── Contacts Admin ──
async function renderContactsAdmin() {
  const main = document.getElementById('admin-main-content');
  try {
    const res = await fetch('/api/contacts', { credentials: 'include' });
    if (res.status === 401 || res.status === 403) {
      main.innerHTML = `<div class="admin-panel"><div class="admin-panel-head"><div class="admin-panel-title">✉️ Contact Messages</div></div><div class="admin-panel-body" style="text-align:center;padding:40px"><p style="color:var(--crimson-light)">Unauthorized. Please sign in as admin.</p></div></div>`;
      return;
    }
    const messages = await res.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      main.innerHTML = `<div class="admin-panel"><div class="admin-panel-head"><div class="admin-panel-title">✉️ Contact Messages</div><span style="font-size:0.78rem;color:var(--text-muted)">0 messages</span></div><div class="admin-panel-body" style="text-align:center;padding:60px 0;color:var(--text-muted)">
        <div style="font-size:2.5rem;margin-bottom:12px">📥</div>
        <p>No messages received yet.</p>
      </div></div>`;
      return;
    }

    // Sort newest first
    const sorted = [...messages].sort((a,b) => new Date(b.received_at||0) - new Date(a.received_at||0));

    main.innerHTML = `<div class="admin-panel">
      <div class="admin-panel-head">
        <div class="admin-panel-title">✉️ Contact Messages</div>
        <span style="font-size:0.78rem;color:var(--gold);background:rgba(212,175,55,0.1);border:1px solid rgba(212,175,55,0.25);border-radius:20px;padding:3px 12px">${sorted.length} message${sorted.length !== 1 ? 's' : ''}</span>
      </div>
      <div class="admin-panel-body" style="padding:0">
        <div class="contacts-inbox">
          ${sorted.map((m, i) => {
            const date = m.received_at ? new Date(m.received_at).toLocaleString() : '—';
            const initials = (m.name||'?').charAt(0).toUpperCase();
            return `
            <div class="contact-msg-card" id="msg-${i}">
              <div class="contact-msg-header" onclick="this.parentElement.classList.toggle('expanded')">
                <div class="contact-msg-avatar">${initials}</div>
                <div class="contact-msg-meta">
                  <div class="contact-msg-sender">${esc(m.name||'—')}</div>
                  <div class="contact-msg-email">${esc(m.email||'')}</div>
                </div>
                <div class="contact-msg-subject">${esc(m.subject||'General')}</div>
                <div class="contact-msg-date">${date}</div>
                <svg class="contact-msg-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              <div class="contact-msg-body">
                <p>${esc(m.message||'').replace(/\n/g,'<br>')}</p>
                <a href="mailto:${esc(m.email||'')}?subject=Re: ${esc(m.subject||'')}" class="btn-primary" style="display:inline-flex;align-items:center;gap:6px;font-size:0.8rem;padding:7px 16px;margin-top:12px">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  Reply via Email
                </a>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>`;
  } catch (err) {
    main.innerHTML = `<div class="admin-panel"><div class="admin-panel-body" style="text-align:center;padding:40px"><p style="color:var(--crimson-light)">Failed to load messages: ${err.message}</p></div></div>`;
  }
}

function renderAdmissionsAdmin() {
  const pd = adminState.programsData || {};
  const req = pd.requirements || {};
  return `<div class="admin-panel"><div class="admin-panel-head"><div class="admin-panel-title">📋 Admissions Requirements</div></div><div class="admin-panel-body">
    <form onsubmit="handleSaveAdmissions(event)">
      <div class="admin-form-grid">
        <div class="admin-form-group full"><label class="admin-label">Section 1 Title</label><input class="admin-input" id="req-bsc-title" value="${esc(req.bsc_title||'B.Sc. Requirements')}"></div>
        <div class="admin-form-group full"><label class="admin-label">Section 1 Items (one per line)</label><textarea class="admin-textarea" id="req-bsc-items" style="min-height:120px">${esc((req.bsc_items||[]).join('\n'))}</textarea></div>
        <div class="admin-form-group full"><label class="admin-label">Section 2 Title</label><input class="admin-input" id="req-msc-title" value="${esc(req.msc_title||'M.Sc. / Ph.D. Requirements')}"></div>
        <div class="admin-form-group full"><label class="admin-label">Section 2 Items (one per line)</label><textarea class="admin-textarea" id="req-msc-items" style="min-height:120px">${esc((req.msc_items||[]).join('\n'))}</textarea></div>
      </div>
      <div style="margin-top:16px"><button type="submit" class="btn-primary" style="font-size:0.85rem;padding:9px 20px">Save Requirements</button></div>
    </form>
  </div></div>`;
}

// ── Init ──

async function initAdmin() {
  const isAdmin = await checkAdmin();
  if (!isAdmin) { window.location.href = 'sign-in.html'; return; }

  adminState.settings = await getSiteSettings();
  adminState.articles = (await getArticles()) || [];
  adminState.cohorts = (await getCohorts()) || [];
  adminState.projects = (await getProjects()) || [];
  adminState.faculty = (await getFaculty()) || [];
  adminState.timeline = (await getTimeline()) || [];
  adminState.values = (await getValues()) || [];
  adminState.programsData = (await getProgramsData()) || { flagship: {}, programs: [], requirements: {} };

  renderAdmin();
}
