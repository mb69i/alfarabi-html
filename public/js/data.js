// ── Alfarabi — Data Fetching Layer ────────────────────────────────
// Fetches JSON data from Supabase (if configured) or falls back to local API.

// TODO: Replace these with your actual Supabase URL and Anon Key
const SUPABASE_URL = 'https://zzbkqngodpbkogjjheim.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_df6Ivo8JPOluoRN8zA0FyQ_tBo_hv2e';
let supabaseClient = null;

if (typeof supabase !== 'undefined' && SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

const dataCache = {};

async function fetchData(file) {
  if (dataCache[file]) return dataCache[file];

  // 1. Try Supabase first if configured
  if (supabaseClient) {
    try {
      const tableName = file === 'site-settings' ? 'settings' : file;
      const { data, error } = await supabaseClient.from(tableName).select('*');
      
      if (!error && data) {
        // Return single object for settings, arrays for everything else
        const formattedData = (file === 'site-settings' && data.length > 0) ? data[0] : data;
        dataCache[file] = formattedData;
        return formattedData;
      }
      console.warn(`[Supabase] Failed to load ${tableName}, falling back to local.`, error);
    } catch (e) {
      console.warn(`[Supabase] Exception for ${file}, falling back.`, e);
    }
  }

  // 2. Fallback to Local JSON API
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
