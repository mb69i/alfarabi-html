// admin-modals.js - Modal open/close/render/collect, esc(), handleLogout
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