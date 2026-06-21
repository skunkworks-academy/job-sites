const ORG = 'skunkworks-academy';
const REPO = 'job-sites';
const DATA_URL = 'public/jobsites.json';

let allSites = [];
let activeFilter = 'all';
let activeQuery = '';

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function setCount(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

async function loadSites() {
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`Unable to load ${DATA_URL}: ${res.status}`);
    allSites = await res.json();

    setCount('siteCount', allSites.length);
    bindInteractions();
    applyFilters();
    loadRepositoryPanel();
  } catch (err) {
    console.error('Error loading job sites:', err);
    document.getElementById('cards').innerHTML = '<p class="error">Could not load job sites data.</p>';
  }
}

function bindInteractions() {
  const searchInput = document.getElementById('search');
  searchInput?.addEventListener('input', () => {
    activeQuery = searchInput.value.trim().toLowerCase();
    applyFilters();
  });

  document.querySelectorAll('.filters button').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeFilter = btn.getAttribute('data-filter') || 'all';
      document.querySelectorAll('.filters button').forEach((item) => item.classList.remove('active'));
      btn.classList.add('active');
      applyFilters();
    });
  });

  document.getElementById('copyBtn')?.addEventListener('click', async () => {
    const text = allSites.map((site) => `${site.name} — ${site.url}`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      showToast('Job sites copied to clipboard.');
    } catch {
      showToast('Copy failed. Your browser may block clipboard access.');
    }
  });

  document.getElementById('csvBtn')?.addEventListener('click', () => {
    const header = ['Name', 'URL', 'Region', 'Category'];
    const rows = allSites.map((site) => [site.name, site.url, site.region || '', site.category || '']);
    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'skunkworks-academy-job-sites.csv';
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

function applyFilters() {
  const filtered = allSites.filter((site) => {
    const categoryMatch = activeFilter === 'all' || site.category === activeFilter || site.region === activeFilter;
    const haystack = `${site.name} ${site.url} ${site.region || ''} ${site.category || ''}`.toLowerCase();
    const queryMatch = !activeQuery || haystack.includes(activeQuery);
    return categoryMatch && queryMatch;
  });
  renderSites(filtered);
}

function renderSites(list) {
  const cards = document.getElementById('cards');
  const empty = document.getElementById('empty');
  cards.innerHTML = '';
  setCount('visibleCount', list.length);

  if (!list.length) {
    empty.hidden = false;
    return;
  }

  empty.hidden = true;
  const fragment = document.createDocumentFragment();

  list.forEach((site) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-content">
        <h2>${escapeHtml(site.name)}</h2>
        <p class="meta">${escapeHtml(site.region || 'Global')} · ${escapeHtml(site.category || 'Directory')}</p>
      </div>
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
  toast.textContent = message;
  toast.style.position = 'fixed';
  toast.style.right = '18px';
  toast.style.bottom = '18px';
  toast.style.zIndex = '100';
  toast.style.padding = '12px 14px';
  toast.style.borderRadius = '16px';
  toast.style.background = 'rgba(5, 5, 5, 0.92)';
  toast.style.color = '#fff';
  toast.style.border = '1px solid rgba(255,255,255,.2)';
  toast.style.boxShadow = '0 18px 50px rgba(0,0,0,.35)';
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 2400);
}

loadSites();
