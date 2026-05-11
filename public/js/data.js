// ── Alfarabi — Data Fetching Layer ────────────────────────────────
// Fetches JSON data from the server API and caches it.

const dataCache = {};

async function fetchData(file) {
  if (dataCache[file]) return dataCache[file];
  try {
    const res = await fetch('/api/cms?file=' + file);
    if (!res.ok) throw new Error('Failed to load ' + file);
    const data = await res.json();
    dataCache[file] = data;
    return data;
  } catch (err) {
    console.error('Data fetch error:', err);
    return null;
  }
}

function clearCache(file) {
  if (file) delete dataCache[file];
  else Object.keys(dataCache).forEach(k => delete dataCache[k]);
}

async function saveData(file, data) {
  const res = await fetch('/api/cms?file=' + file, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to save');
  dataCache[file] = data;
  return true;
}

async function getSiteSettings() { return fetchData('site-settings'); }
async function getArticles() { return fetchData('articles'); }
async function getCohorts() { return fetchData('cohorts'); }
async function getProjects() { return fetchData('projects'); }
async function getFaculty() { return fetchData('faculty'); }
async function getTimeline() { return fetchData('timeline'); }
async function getValues() { return fetchData('values'); }
async function getProgramsData() { return fetchData('programs'); }

async function checkAdmin() {
  try {
    const res = await fetch('/api/admin-auth/check');
    const data = await res.json();
    return data.isAdmin === true;
  } catch { return false; }
}
