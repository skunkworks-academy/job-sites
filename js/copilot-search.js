(() => {
  const toolTerms = {
    'copilot-web': [],
    linkedin: ['linkedin', 'professional', 'network', 'recruiter'],
    indeed: ['indeed', 'broad job board', 'job board', 'career'],
    pnet: ['pnet', 'south africa', 'local', 'careers24', 'careerjunction'],
    github: ['github', 'software', 'developer', 'portfolio', 'open source', 'cloud', 'ai'],
    'cv-parser': ['cv', 'resume', 'certificate', 'skills', 'experience'],
    'image-context': ['image', 'screenshot', 'certificate', 'portfolio']
  };

  const uploadState = { files: [], images: [], text: '' };

  function selectedTools() {
    return Array.from(document.querySelectorAll('input[name="searchTool"]:checked')).map((input) => input.value);
  }

  function escapeHtml(value = '') {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function contextText() {
    return [
      uploadState.text,
      selectedTools().flatMap((tool) => toolTerms[tool] || []).join(' ')
    ].filter(Boolean).join(' ');
  }

  function syncSearchContext() {
    try {
      const source = typeof activeQuery === 'string' ? activeQuery : '';
      const extra = contextText();
      if (typeof applyFilters === 'function') applyFilters();
      renderCopilotPanel(source, extra);
    } catch (error) {
      console.warn('Copilot search context sync failed:', error);
    }
  }

  async function readUploads(files, kind) {
    return Promise.all(files.slice(0, 8).map(async (file) => {
      const text = kind === 'file' ? await extractText(file) : '';
      return { kind, name: file.name, type: file.type || 'unknown', size: file.size, text };
    }));
  }

  async function extractText(file) {
    const name = file.name.toLowerCase();
    const textLike = file.type.startsWith('text/') || ['.txt', '.md', '.csv', '.json', '.html', '.htm', '.rtf'].some((ext) => name.endsWith(ext));
    if (!textLike) return '';
    try {
      return (await file.text()).slice(0, 6000);
    } catch {
      return '';
    }
  }

  function rebuildUploadText() {
    const fileText = uploadState.files.map((file) => `${file.name} ${file.type} ${file.text}`).join(' ');
    const imageText = uploadState.images.map((image) => `${image.name} ${image.type}`).join(' ');
    uploadState.text = `${fileText} ${imageText}`.trim();
  }

  function updateUploadSummary() {
    const summary = document.getElementById('uploadSummary');
    if (!summary) return;
    const uploads = [...uploadState.files, ...uploadState.images];
    if (!uploads.length) {
      summary.innerHTML = 'No files uploaded yet.';
      return;
    }
    const chips = uploads.map((item) => `<span>${escapeHtml(item.kind)}: ${escapeHtml(item.name)}</span>`).join('');
    summary.innerHTML = `Using ${uploads.length} uploaded item${uploads.length === 1 ? '' : 's'} as local search context.<span class="upload-chip-row">${chips}</span>`;
  }

  function setToolChecked(toolName, checked) {
    const input = document.querySelector(`input[name="searchTool"][value="${toolName}"]`);
    if (input) input.checked = checked;
  }

  function buildCopilotQuery(prompt, extra) {
    const selected = selectedTools().join(', ');
    const uploadedNames = [...uploadState.files, ...uploadState.images].map((item) => item.name).join(', ');
    return [prompt || 'job search', selected && `tools: ${selected}`, extra, uploadedNames && `uploaded context: ${uploadedNames}`].filter(Boolean).join(' | ');
  }

  function renderCopilotPanel(prompt = '', extra = '') {
    const panel = document.getElementById('copilotPanel');
    const summary = document.getElementById('copilotSummary');
    const links = document.getElementById('copilotLinks');
    if (!panel || !summary || !links) return;

    const query = buildCopilotQuery(prompt, extra);
    if (!query.trim()) {
      panel.hidden = true;
      return;
    }

    const encoded = encodeURIComponent(query);
    const jobQuery = encodeURIComponent(`${query} jobs`);
    const routes = [
      ['Open in Copilot', 'fa-wand-magic-sparkles', `https://copilot.microsoft.com/?q=${encoded}`],
      ['Bing web search', 'fa-magnifying-glass', `https://www.bing.com/search?q=${jobQuery}`],
      ['LinkedIn Jobs', 'fa-arrow-up-right-from-square', `https://www.linkedin.com/jobs/search/?keywords=${jobQuery}`],
      ['Indeed', 'fa-briefcase', `https://www.indeed.com/jobs?q=${jobQuery}`],
      ['Google jobs query', 'fa-arrow-up-right-from-square', `https://www.google.com/search?q=${jobQuery}`]
    ];

    summary.textContent = `Use this generated prompt with Copilot or web search: ${query}`;
    links.innerHTML = routes.map(([label, icon, url]) => `
      <a href="${escapeHtml(url)}" target="_blank" rel="noopener">
        <i class="fa-solid ${escapeHtml(icon)}" aria-hidden="true"></i>${escapeHtml(label)}
      </a>
    `).join('');
    panel.hidden = false;
  }

  function patchScoring() {
    if (typeof scoreSite !== 'function') return;
    const originalScoreSite = scoreSite;
    scoreSite = function patchedScoreSite(site, query, filter) {
      const tools = selectedTools();
      const augmentedQuery = [query, contextText()].filter(Boolean).join(' ');
      let score = originalScoreSite(site, augmentedQuery, filter);
      const haystack = `${site.name} ${site.url} ${site.region} ${site.category} ${(site.tags || []).join(' ')}`.toLowerCase();
      if (tools.includes('linkedin') && haystack.includes('linkedin')) score += 16;
      if (tools.includes('indeed') && (haystack.includes('indeed') || haystack.includes('job board') || haystack.includes('career'))) score += 8;
      if (tools.includes('pnet') && (haystack.includes('pnet') || site.region === 'South Africa')) score += 8;
      if (tools.includes('github') && (haystack.includes('software') || haystack.includes('tech') || haystack.includes('developer'))) score += 8;
      if (tools.includes('cv-parser') && uploadState.files.length) score += 3;
      if (tools.includes('image-context') && uploadState.images.length) score += 2;
      return score;
    };
  }

  function bindEnhancers() {
    patchScoring();

    document.querySelectorAll('input[name="searchTool"]').forEach((input) => {
      input.addEventListener('change', syncSearchContext);
    });

    document.getElementById('fileUpload')?.addEventListener('change', async (event) => {
      uploadState.files = await readUploads(Array.from(event.target.files || []), 'file');
      rebuildUploadText();
      updateUploadSummary();
      setToolChecked('cv-parser', true);
      syncSearchContext();
    });

    document.getElementById('imageUpload')?.addEventListener('change', async (event) => {
      uploadState.images = await readUploads(Array.from(event.target.files || []), 'image');
      rebuildUploadText();
      updateUploadSummary();
      setToolChecked('image-context', true);
      syncSearchContext();
    });

    const originalClear = document.getElementById('clearBtn');
    originalClear?.addEventListener('click', () => {
      uploadState.files = [];
      uploadState.images = [];
      uploadState.text = '';
      const fileUpload = document.getElementById('fileUpload');
      const imageUpload = document.getElementById('imageUpload');
      if (fileUpload) fileUpload.value = '';
      if (imageUpload) imageUpload.value = '';
      updateUploadSummary();
      renderCopilotPanel('', '');
    });

    updateUploadSummary();
    syncSearchContext();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindEnhancers);
  } else {
    bindEnhancers();
  }
})();
