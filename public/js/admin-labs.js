// admin-labs.js - Research Labs management in Admin CMS

function renderLabsAdmin() {
  const labs = adminState.labs || [];

  return `
    <div class="admin-panel">
      <div class="admin-panel-head">
        <div>
          <div class="admin-panel-title">🔬 AI Research Laboratories</div>
          <div class="admin-panel-sub">Manage specialized research labs, focus areas, leads, and bilingual details.</div>
        </div>
        <button class="btn-primary" onclick="openLabModal()" style="display:inline-flex;align-items:center;gap:6px;font-size:0.85rem;padding:8px 16px;">
          <span>+ Add Laboratory</span>
        </button>
      </div>

      <div class="admin-panel-body">
        ${labs.length === 0 ? `
          <div style="text-align:center;padding:48px 0;color:var(--text-muted)">
            <p>No research labs configured yet.</p>
          </div>
        ` : `
          <div style="overflow-x:auto">
            <table class="admin-table" style="width:100%;border-collapse:collapse;font-size:0.88rem">
              <thead>
                <tr style="border-bottom:1px solid var(--glass-border);text-align:left;color:var(--text-muted)">
                  <th style="padding:12px 14px">Lab Name</th>
                  <th style="padding:12px 14px">Arabic Name</th>
                  <th style="padding:12px 14px">Category</th>
                  <th style="padding:12px 14px">Lead</th>
                  <th style="padding:12px 14px;text-align:right">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${labs.map((lab, index) => `
                  <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
                    <td style="padding:14px;font-weight:600;color:var(--text-primary)">
                      <div style="display:flex;align-items:center;gap:10px">
                        <span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:6px;background:rgba(212,175,55,0.15);color:var(--gold);font-size:12px;">⚡</span>
                        <span>${esc(lab.name)}</span>
                      </div>
                    </td>
                    <td style="padding:14px;color:var(--text-secondary);direction:rtl">${esc(lab.ar_name || '')}</td>
                    <td style="padding:14px"><span class="admin-status-badge" style="background:rgba(212,175,55,0.15);color:var(--gold)">${esc(lab.category || '')}</span></td>
                    <td style="padding:14px;color:var(--text-secondary)">${esc(lab.lead || '')}</td>
                    <td style="padding:14px;text-align:right">
                      <div style="display:inline-flex;gap:8px">
                        <button class="btn-gold" onclick="openLabModal(${index})" style="font-size:0.75rem;padding:5px 12px">Edit</button>
                        <button class="btn-danger" onclick="deleteLab(${index})" style="font-size:0.75rem;padding:5px 12px;background:rgba(239,68,68,0.2);color:#ef4444;border:1px solid rgba(239,68,68,0.3);border-radius:6px;cursor:pointer">Delete</button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>
  `;
}

function openLabModal(index = null) {
  adminState.editingLabIndex = index;
  const lab = index !== null ? adminState.labs[index] : {
    id: 'lab-' + Date.now(),
    name: '',
    ar_name: '',
    category: '',
    ar_category: '',
    icon: 'network',
    desc: '',
    ar_desc: '',
    lead: '',
    ar_lead: '',
    tags: [],
    ar_tags: [],
    color: 'var(--gold)'
  };

  const modalHtml = `
    <div class="admin-modal-backdrop" id="lab-modal" style="position:fixed;inset:0;background:rgba(2,4,15,0.85);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;">
      <div class="admin-modal-card" style="background:var(--navy-900, #0B132B);border:1px solid var(--glass-border);border-radius:18px;width:100%;max-width:680px;max-height:90vh;overflow-y:auto;padding:28px;box-shadow:0 24px 60px rgba(0,0,0,0.6)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid var(--glass-border);padding-bottom:14px">
          <h3 style="font-family:'Syne',sans-serif;font-size:1.25rem;color:var(--text-primary);margin:0">${index !== null ? 'Edit Research Lab' : 'Create New Research Lab'}</h3>
          <button onclick="closeLabModal()" style="background:none;border:none;color:var(--text-muted);font-size:22px;cursor:pointer">&times;</button>
        </div>

        <form onsubmit="handleSaveLab(event)">
          <div class="admin-form-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
            <div class="admin-form-group">
              <label class="admin-label">Lab Name (English)</label>
              <input class="admin-input" id="lab-name" required value="${esc(lab.name)}">
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Lab Name (Arabic)</label>
              <input class="admin-input" id="lab-ar-name" dir="rtl" required value="${esc(lab.ar_name || '')}">
            </div>

            <div class="admin-form-group">
              <label class="admin-label">Category (English)</label>
              <input class="admin-input" id="lab-category" value="${esc(lab.category || '')}">
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Category (Arabic)</label>
              <input class="admin-input" id="lab-ar-category" dir="rtl" value="${esc(lab.ar_category || '')}">
            </div>

            <div class="admin-form-group">
              <label class="admin-label">Lead / Chair (English)</label>
              <input class="admin-input" id="lab-lead" value="${esc(lab.lead || '')}">
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Lead / Chair (Arabic)</label>
              <input class="admin-input" id="lab-ar-lead" dir="rtl" value="${esc(lab.ar_lead || '')}">
            </div>

            <div class="admin-form-group">
              <label class="admin-label">Icon Identifier</label>
              <select class="admin-input" id="lab-icon">
                <option value="network" ${lab.icon === 'network' ? 'selected' : ''}>Network / Neural Grid</option>
                <option value="cpu" ${lab.icon === 'cpu' ? 'selected' : ''}>CPU / Robotics</option>
                <option value="message-square" ${lab.icon === 'message-square' ? 'selected' : ''}>Message / NLP</option>
                <option value="eye" ${lab.icon === 'eye' ? 'selected' : ''}>Eye / Computer Vision</option>
                <option value="shield" ${lab.icon === 'shield' ? 'selected' : ''}>Shield / AI Ethics</option>
                <option value="atom" ${lab.icon === 'atom' ? 'selected' : ''}>Atom / Quantum ML</option>
              </select>
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Accent Color</label>
              <input class="admin-input" id="lab-color" value="${esc(lab.color || 'var(--gold)')}">
            </div>

            <div class="admin-form-group" style="grid-column:1/-1">
              <label class="admin-label">Description (English)</label>
              <textarea class="admin-textarea" id="lab-desc" rows="3">${esc(lab.desc || '')}</textarea>
            </div>
            <div class="admin-form-group" style="grid-column:1/-1">
              <label class="admin-label">Description (Arabic)</label>
              <textarea class="admin-textarea" id="lab-ar-desc" dir="rtl" rows="3">${esc(lab.ar_desc || '')}</textarea>
            </div>

            <div class="admin-form-group">
              <label class="admin-label">Tags (English, comma separated)</label>
              <input class="admin-input" id="lab-tags" value="${esc((lab.tags || []).join(', '))}">
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Tags (Arabic, comma separated)</label>
              <input class="admin-input" id="lab-ar-tags" dir="rtl" value="${esc((lab.ar_tags || []).join(', '))}">
            </div>
          </div>

          <div style="margin-top:24px;display:flex;justify-content:flex-end;gap:12px;border-top:1px solid var(--glass-border);padding-top:16px">
            <button type="button" class="btn-gold" onclick="closeLabModal()">Cancel</button>
            <button type="submit" class="btn-primary">Save Laboratory</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const container = document.createElement('div');
  container.id = 'lab-modal-container';
  container.innerHTML = modalHtml;
  document.body.appendChild(container);
}

function closeLabModal() {
  const el = document.getElementById('lab-modal-container');
  if (el) el.remove();
}

async function handleSaveLab(e) {
  e.preventDefault();
  const idx = adminState.editingLabIndex;
  const currentLabs = adminState.labs || [];

  const labData = {
    id: idx !== null && currentLabs[idx] ? currentLabs[idx].id : 'lab-' + Date.now(),
    name: document.getElementById('lab-name').value.trim(),
    ar_name: document.getElementById('lab-ar-name').value.trim(),
    category: document.getElementById('lab-category').value.trim(),
    ar_category: document.getElementById('lab-ar-category').value.trim(),
    lead: document.getElementById('lab-lead').value.trim(),
    ar_lead: document.getElementById('lab-ar-lead').value.trim(),
    icon: document.getElementById('lab-icon').value,
    color: document.getElementById('lab-color').value.trim() || 'var(--gold)',
    desc: document.getElementById('lab-desc').value.trim(),
    ar_desc: document.getElementById('lab-ar-desc').value.trim(),
    tags: document.getElementById('lab-tags').value.split(',').map(s => s.trim()).filter(Boolean),
    ar_tags: document.getElementById('lab-ar-tags').value.split(',').map(s => s.trim()).filter(Boolean),
    order: idx !== null && currentLabs[idx] ? (currentLabs[idx].order || (idx + 1)) : currentLabs.length + 1
  };

  if (idx !== null) {
    currentLabs[idx] = labData;
  } else {
    currentLabs.push(labData);
  }

  const success = await persist('labs', currentLabs, 'Research Labs');
  if (success) {
    adminState.labs = currentLabs;
    closeLabModal();
    renderAdmin();
  }
}

async function deleteLab(index) {
  if (!confirm('Are you sure you want to delete this research lab?')) return;
  const currentLabs = adminState.labs || [];
  currentLabs.splice(index, 1);

  const success = await persist('labs', currentLabs, 'Research Labs');
  if (success) {
    adminState.labs = currentLabs;
    renderAdmin();
  }
}
