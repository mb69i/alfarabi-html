// admin-views.js - renderAdmin(), all section renderers, initAdmin()

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
