async function loadSites() {
  try {
    const res = await fetch('../public/jobsites.json');
    const sites = await res.json();
    renderSites(sites);

    // --- Search filter
    const searchInput = document.getElementById('search');
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase();
      const filtered = sites.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.url.toLowerCase().includes(q) ||
        (s.region && s.region.toLowerCase().includes(q)) ||
        (s.category && s.category.toLowerCase().includes(q))
      );
      renderSites(filtered);
    });

    // --- Category filter buttons
    document.querySelectorAll('nav.filters button').forEach(btn => {
      btn.addEventListener('click', () => {
        const category = btn.getAttribute('data-filter');
        let filtered = sites;
        if (category !== 'all') {
          filtered = sites.filter(s => s.category === category);
        }
        renderSites(filtered);
      });
    });

  } catch (err) {
    console.error("Error loading job sites:", err);
    document.getElementById('cards').innerHTML =
      `<p class="error">⚠ Could not load job sites data.</p>`;
  }
}

function renderSites(list) {
  const cards = document.getElementById('cards');
  const empty = document.getElementById('empty');
  cards.innerHTML = '';

  if (!list.length) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  list.forEach(site => {
    const card = document.createElement('div');
    card.className = 'card fade-in';
    card.innerHTML = `
      <div class="card-content">
        <h2>${site.name}</h2>
        <p class="meta">${site.region || ''} · ${site.category || ''}</p>
        <a href="${site.url}" target="_blank" rel="noopener" class="visit-btn">
          Visit <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </a>
      </div>
    `;
    cards.appendChild(card);
  });
}

// Kick things off
loadSites();
