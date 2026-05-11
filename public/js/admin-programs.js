// admin-programs.js - Programs, Flagship, Admissions, Site Settings CRUD

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