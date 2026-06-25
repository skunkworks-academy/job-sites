const ORG = 'skunkworks-academy';
const REPO = 'jobs';
const DATA_URL = 'public/jobsites.json';

let allSites = [];
let visibleSites = [];
let activeFilter = 'all';
let activeQuery = '';

const categoryRules = [
  { category: 'Remote', terms: ['remote', 'remotive', 'nomad', 'nodesk', 'justremote', 'remotehub', 'virtual', 'skipthedrive', 'we work remotely', 'working remotely'] },
  { category: 'Freelance', terms: ['upwork', 'freelancer', 'fiverr', 'toptal', 'peopleperhour', 'guru', 'hubstaff', 'codementor', 'workana', 'kolabtree', 'designcrowd', 'freelancermap'] },
  { category: 'Agency / NGO', terms: ['ngo', 'un jobs', 'reliefweb', 'govpage', 'sayouth', 'jobnet africa', 'careers in africa'] },
  { category: 'Recruitment Agency', terms: ['recruitment', 'staffing', 'michael page', 'robert walters', 'kelly', 'quest', 'manpower', 'hire resolve', 'network recruitment', 'prostaff', 'tower group', 'masa', 'isilumko'] }
];

const intentDictionary = [
  { term: 'remote', filters: ['Remote'], tags: ['remote', 'global', 'software', 'developer', 'work from home'] },
  { term: 'software', filters: ['Remote', 'Freelance', 'Global'], tags: ['software', 'developer', 'engineer', 'tech', 'remote'] },
  { term: 'developer', filters: ['Remote', 'Freelance', 'Global'], tags: ['software', 'developer', 'engineer', 'tech'] },
  { term: 'engineer', filters: ['Remote', 'Freelance', 'Global'], tags: ['software', 'developer', 'engineer', 'tech'] },
  { term: 'ai', filters: ['Freelance', 'Remote', 'Global'], tags: ['ai', 'cloud', 'tech', 'freelance', 'remote'] },
  { term: 'cloud', filters: ['Freelance', 'Remote', 'Global'], tags: ['cloud', 'microsoft', 'azure', 'tech', 'remote'] },
  { term: 'cyber', filters: ['Global', 'Remote'], tags: ['security', 'cybersecurity', 'tech'] },
  { term: 'freelance', filters: ['Freelance'], tags: ['freelance', 'contract', 'gig'] },
  { term: 'contract', filters: ['Freelance', 'Recruitment Agency'], tags: ['contract', 'freelance', 'agency'] },
  { term: 'part-time', filters: ['South Africa', 'Global'], tags: ['part-time', 'entry-level', 'local'] },
  { term: 'intern', filters: ['South Africa', 'Global', 'Agency / NGO'], tags: ['internship', 'graduate', 'entry-level'] },
  { term: 'entry-level', filters: ['South Africa', 'Global', 'Agency / NGO'], tags: ['entry-level', 'graduate', 'junior'] },
  { term: 'junior', filters: ['South Africa', 'Global'], tags: ['entry-level', 'junior', 'graduate'] },
  { term: 'graduate', filters: ['South Africa', 'Agency / NGO'], tags: ['graduate', 'entry-level', 'local'] },
  { term: 'sales', filters: ['South Africa', 'Recruitment Agency'], tags: ['sales', 'business', 'job board', 'agency'] },
  { term: 'pharma', filters: ['South Africa', 'Recruitment Agency'], tags: ['pharma', 'sales', 'agency'] },
  { term: 'marketing', filters: ['South Africa', 'Global'], tags: ['marketing', 'media', 'business'] },
  { term: 'media', filters: ['South Africa', 'Global'], tags: ['media', 'marketing', 'creative'] },
  { term: 'international', filters: ['Global', 'Remote'], tags: ['international', 'global', 'visa', 'remote'] },
  { term: 'global', filters: ['Global', 'Remote'], tags: ['international', 'global', 'remote'] },
  { term: 'south africa', filters: ['South Africa'], tags: ['south africa', 'local', 'graduate'] }
];

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function normaliseText(value = '') {
  return String(value).toLowerCase().replace(/[’']/g, '').trim();
}

function inferCategory(site) {
  const haystack = normaliseText(`${site.name} ${site.url} ${site.region || ''} ${site.category || ''}`);
  for (const rule of categoryRules) {
    if (rule.terms.some((term) => haystack.includes(term))) return rule.category;
  }
  return site.category || 'Job Board';
}

function enrichSite(site) {
  const category = inferCategory(site);
  const region = site.region || 'Global';
  const base = normaliseText(`${site.name} ${site.url} ${region} ${category}`);
  const tags = new Set([region, category]);

  if (region === 'South Africa') tags.add('local');
  if (region === 'Global') tags.add('international');
  if (category === 'Remote') tags.add('work from home');
  if (category === 'Freelance') tags.add('contract');
  if (category === 'Job Board') tags.add('general search');
  if (base.includes('linkedin') || base.includes('indeed') || base.includes('pnet') || base.includes('career')) tags.add('broad job board');
  if (base.includes('offerzen') || base.includes('dice') || base.includes('stack') || base.includes('techno') || base.includes('hired')) tags.add('software');
  if (base.includes('bizcommunity')) tags.add('media');
  if (base.includes('jobjack') || base.includes('sayouth')) tags.add('entry-level');

  return { ...site, region, category, tags: Array.from(tags) };
}

function setCount(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setSummary(count) {
  const summary = document.getElementById('resultSummary');
  if (!summary) return;
  if (!activeQuery && activeFilter === 'all') {
    summary.textContent = 'Start with a prompt above or browse all platforms below.';
    return;
  }
  const mode = activeFilter === 'all' ? 'all categories' : activeFilter;
  summary.textContent = `Showing ${count} recommended platform${count === 1 ? '' : 's'} for “${activeQuery || mode}”.`;
}

async function loadSites() {
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`Unable to load ${DATA_URL}: ${res.status}`);
    allSites = (await res.json()).map(enrichSite);

    setCount('siteCount', allSites.length);
    bindInteractions();
    hydrateFromUrl();
    applyFilters();
    loadRepositoryPanel();
  } catch (err) {
    console.error('Error loading job sites:', err);
    const cards = document.getElementById('cards');
    if (cards) cards.innerHTML = '<p class="error">Could not load job sites data.</p>';
  }
}

function bindInteractions() {
  const searchInput = document.getElementById('search');
  const form = document.getElementById('intentForm');
  const clearBtn = document.getElementById('clearBtn');
  const backButton = document.getElementById('backButton');

  searchInput?.addEventListener('input', () => {
    activeQuery = searchInput.value.trim();
    applyFilters();
  });

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    activeQuery = searchInput?.value.trim() || '';
    updateUrlQuery(activeQuery);
    applyFilters();
    document.getElementById('directory')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  clearBtn?.addEventListener('click', () => {
    activeFilter = 'all';
    activeQuery = '';
    if (searchInput) searchInput.value = '';
    setActiveFilterButton('all');
    updateUrlQuery('');
    applyFilters();
  });

  backButton?.addEventListener('click', () => {
    if (window.history.length > 1) window.history.back();
    else window.location.href = 'https://skunkworksacademy.com/';
  });

  document.querySelectorAll('.prompt-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const query = chip.getAttribute('data-query') || '';
      const filter = chip.getAttribute('data-filter') || 'all';
      activeQuery = query;
      activeFilter = filter;
      if (searchInput) searchInput.value = query;
      setActiveFilterButton(filter);
      updateUrlQuery(query);
      applyFilters();
      document.getElementById('directory')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  document.querySelectorAll('.filters button').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeFilter = btn.getAttribute('data-filter') || 'all';
      setActiveFilterButton(activeFilter);
      applyFilters();
    });
  });

  document.getElementById('copyBtn')?.addEventListener('click', async () => {
    const text = visibleSites.map((site) => `${site.name} — ${site.url}`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      showToast('Visible job platforms copied to clipboard.');
    } catch {
      showToast('Copy failed. Your browser may block clipboard access.');
    }
  });

  document.getElementById('csvBtn')?.addEventListener('click', () => {
    const header = ['Name', 'URL', 'Region', 'Category', 'Tags'];
    const rows = visibleSites.map((site) => [site.name, site.url, site.region || '', site.category || '', site.tags.join('; ')]);
    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'skunkworks-academy-job-platforms.csv';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  });

  document.querySelector('.nav-toggle')?.addEventListener('click', (event) => {
    const nav = document.getElementById('primaryNav');
    const expanded = event.currentTarget.getAttribute('aria-expanded') === 'true';
    event.currentTarget.setAttribute('aria-expanded', String(!expanded));
    nav?.classList.toggle('open');
  });
}

function hydrateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q') || '';
  if (!q) return;
  activeQuery = q;
  const input = document.getElementById('search');
  if (input) input.value = q;
}

function updateUrlQuery(query) {
  const url = new URL(window.location.href);
  if (query) url.searchParams.set('q', query);
  else url.searchParams.delete('q');
  window.history.replaceState({}, '', url);
}

function setActiveFilterButton(filter) {
  document.querySelectorAll('.filters button').forEach((item) => {
    item.classList.toggle('active', item.getAttribute('data-filter') === filter);
  });
}

function applyFilters() {
  const scored = allSites
    .map((site) => ({ site, score: scoreSite(site, activeQuery, activeFilter) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.site.name.localeCompare(b.site.name));

  visibleSites = scored.map((entry) => entry.site);
  renderSites(visibleSites, scored);
  setSummary(visibleSites.length);
}

function scoreSite(site, query, filter) {
  let score = 1;
  const haystack = normaliseText(`${site.name} ${site.url} ${site.region} ${site.category} ${site.tags.join(' ')}`);

  if (filter !== 'all') {
    const matchesFilter = site.category === filter || site.region === filter || site.tags.includes(filter);
    if (!matchesFilter) return 0;
    score += 8;
  }

  const q = normaliseText(query);
  if (!q) return score;

  const terms = q.split(/\s+/).filter((term) => term.length > 2);
  for (const term of terms) {
    if (haystack.includes(term)) score += 4;
  }

  for (const intent of intentDictionary) {
    if (!q.includes(intent.term)) continue;
    if (intent.filters.includes(site.category) || intent.filters.includes(site.region)) score += 10;
    if (intent.tags.some((tag) => haystack.includes(normaliseText(tag)))) score += 6;
  }

  if (score === 1 && q.length > 0) return 0;
  return score;
}

function renderSites(list, scored = []) {
  const cards = document.getElementById('cards');
  const empty = document.getElementById('empty');
  if (!cards || !empty) return;

  cards.innerHTML = '';
  setCount('visibleCount', list.length);

  if (!list.length) {
    empty.hidden = false;
    return;
  }

  empty.hidden = true;
  const fragment = document.createDocumentFragment();
  const scoreMap = new Map(scored.map((entry) => [entry.site.url, entry.score]));

  list.forEach((site) => {
    const card = document.createElement('article');
    card.className = 'card';
    const visibleTags = site.tags.slice(0, 4).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('');
    const score = scoreMap.get(site.url) || 1;
    const matchLabel = activeQuery ? `Recommended match score: ${Math.max(1, score)}` : 'Browse this platform';

    card.innerHTML = `
      <div class="card-content">
        <h3>${escapeHtml(site.name)}</h3>
        <p class="meta">${escapeHtml(site.region)} · ${escapeHtml(site.category)}</p>
        <p class="intent-match">${escapeHtml(matchLabel)}</p>
      </div>
      <div class="tag-row">${visibleTags}</div>
      <a href="${escapeHtml(site.url)}" target="_blank" rel="noopener" class="visit-btn">
        Visit <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
      </a>
    `;
    fragment.appendChild(card);
  });

  cards.appendChild(fragment);
}

async function loadRepositoryPanel() {
  const repoGrid = document.getElementById('repoGrid');
  if (!repoGrid) return;

  try {
    const [repo, contents] = await Promise.all([
      fetch(`https://api.github.com/repos/${ORG}/${REPO}`).then((res) => res.json()),
      fetch(`https://api.github.com/repos/${ORG}/${REPO}/contents/`).then((res) => res.json())
    ]);

    const rootItems = Array.isArray(contents)
      ? contents.slice(0, 8).map((item) => repoItem(`${item.type === 'dir' ? 'Folder' : 'File'}: ${item.name}`, item.path, item.html_url)).join('')
      : '';

    repoGrid.innerHTML = `
      ${repoItem('Current repository', repo.full_name || `${ORG}/${REPO}`, repo.html_url || `https://github.com/${ORG}/${REPO}`)}
      ${repoItem('GitHub organisation', ORG, `https://github.com/${ORG}`)}
      ${rootItems}
    `;
  } catch (err) {
    console.warn('GitHub metadata unavailable:', err);
  }
}

function repoItem(title, subtitle, url) {
  return `
    <a class="repo-item" href="${escapeHtml(url)}" target="_blank" rel="noopener">
      <strong>${escapeHtml(title)}</strong>
      <span>${escapeHtml(subtitle)}</span>
    </a>
  `;
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 2400);
}

loadSites();
