// admin-about.js - Faculty, Timeline, Mission Values CRUD

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