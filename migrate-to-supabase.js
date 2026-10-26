const fs = require('fs');

const SUPABASE_URL = 'https://zzbkqngodpbkogjjheim.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_df6Ivo8JPOluoRN8zA0FyQ_tBo_hv2e';

async function insertData(table, payload) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.text();
    console.error(`Failed to insert into ${table}:`, err);
  } else {
    console.log(`Successfully migrated data to ${table}`);
  }
}

async function run() {
  try {
    // 1. Settings
    const settingsRaw = fs.readFileSync('data/site-settings.json', 'utf8');
    const s = JSON.parse(settingsRaw);
    const settingsPayload = {
      id: 1,
      site_name: s.site_name,
      department_name: s.department_name,
      hero_title: s.hero_title,
      total_students: s.total_students,
      partner_universities: s.partner_universities,
      research_papers: s.research_papers
    };
    await insertData('settings', settingsPayload);

    // 2. Articles
    const articlesRaw = fs.readFileSync('data/articles.json', 'utf8');
    const articles = JSON.parse(articlesRaw);
    // Filter out invalid/empty ones or just push directly
    const formattedArticles = articles.map(a => ({
      title: a.title,
      summary: a.summary,
      content: a.content || '',
      type: a.type || 'news',
      image_url: a.image_url || null,
      published_at: a.published_at || new Date().toISOString()
    }));
    if (formattedArticles.length > 0) {
      await insertData('articles', formattedArticles);
    }

  } catch (err) {
    console.error('Migration failed:', err);
  }
}

run();
