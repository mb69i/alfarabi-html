// admin-content.js - Articles, Events, Cohorts, Projects CRUD
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