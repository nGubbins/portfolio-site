let activeFilter = 'all';
let activeMadeFilter = 'all';
let searchQuery = '';
let expandedId = null;

// allApps is defined in assets/projects.js — edit that file to manage your projects.

// ── Helpers ──────────────────────────────────────────────

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ── Install helpers ──────────────────────────────────────

function installLines(app) {
  const lines = [];
  if (app.pypi) lines.push(`pip install ${app.pypi}`);
  if (app.repo) lines.push(`git clone https://github.com/${app.repo}`);
  return lines;
}

function toggleInstall(id) {
  const panel = document.getElementById(`install-${id}`);
  const btn = document.getElementById(`info-btn-${id}`);
  if (!panel) return;
  panel.classList.toggle('open');
  btn.classList.toggle('active', panel.classList.contains('open'));
}

function copyInstall(btn, cmd) {
  navigator.clipboard.writeText(cmd).then(() => {
    btn.textContent = '✓';
    setTimeout(() => btn.textContent = 'copy', 1500);
  });
}

// ── Releases & descriptions ──────────────────────────────

function platformLabel(filename) {
  const n = filename.toLowerCase();
  if (n.endsWith('.exe') || n.includes('windows')) return 'Windows';
  if (n.endsWith('.dmg') || n.includes('macos') || n.includes('darwin') || n.includes('mac')) return 'macOS';
  if (n.endsWith('.appimage') || n.includes('linux')) return 'Linux';
  if (n.endsWith('.apk') || n.includes('android')) return 'Android';
  return null;
}

function setDates(id, firstIso, latestIso, pushedAt) {
  const el = document.getElementById(`date-${id}`);
  if (!el) return;
  if (!firstIso && !latestIso) {
    el.innerHTML = pushedAt
      ? `<div class="date-source-only">updated ${formatDate(pushedAt)}</div>`
      : `<div class="date-source-only">source only</div>`;
    return;
  }
  if (!latestIso || firstIso === latestIso) {
    el.innerHTML = `<div>released ${formatDate(firstIso)}</div>`;
  } else {
    el.innerHTML = `<div>first release ${formatDate(firstIso)}</div><div>updated ${formatDate(latestIso)}</div>`;
  }
}

async function fetchData() {
  // Load pre-built release data (generated at deploy time, no rate limit)
  let cache = {};
  try {
    const res = await fetch('assets/releases.json');
    if (res.ok) cache = await res.json();
  } catch {}

  allApps.forEach(async app => {
    // GitHub data: served from static cache — unlimited concurrent users
    if (app.repo) {
      const cached = cache[app.repo];
      if (cached) {
        if (cached.description) {
          app.description = cached.description;
          const el = document.getElementById(`desc-${app.id}`);
          if (el) el.textContent = cached.description;
        }
        app.links.downloads = cached.downloads || [];
        const linksEl = document.getElementById(`links-${app.id}`);
        if (linksEl) linksEl.innerHTML = buildLinks(app);
        if (!app.pypi) {
          setDates(app.id, cached.firstPublishedAt || cached.publishedAt, cached.publishedAt, cached.pushedAt);
        }
      } else {
        // Fallback: live API (development / cache miss)
        try {
          const [repoRes, releaseRes, firstRes] = await Promise.all([
            fetch(`https://api.github.com/repos/${app.repo}`).catch(() => null),
            fetch(`https://api.github.com/repos/${app.repo}/releases/latest`).catch(() => null),
            fetch(`https://api.github.com/repos/${app.repo}/releases?per_page=1&direction=asc`).catch(() => null)
          ]);
          let pushedAt = null;
          if (repoRes?.ok) {
            const { description, pushed_at } = await repoRes.json();
            pushedAt = pushed_at || null;
            if (description && !app.pypi) {
              app.description = description;
              const el = document.getElementById(`desc-${app.id}`);
              if (el) el.textContent = description;
            }
          }
          app.links.downloads = [];
          let latestDate = null;
          if (releaseRes?.ok) {
            const release = await releaseRes.json();
            app.links.downloads = release.assets
              .map(a => ({ label: platformLabel(a.name), url: a.browser_download_url }))
              .filter(d => d.label);
            latestDate = release.published_at;
          }
          if (!app.pypi) {
            let firstDate = null;
            if (firstRes?.ok) {
              const [first] = await firstRes.json();
              firstDate = first?.published_at ?? null;
            }
            setDates(app.id, firstDate || latestDate, latestDate, pushedAt);
          }
          const linksEl = document.getElementById(`links-${app.id}`);
          if (linksEl) linksEl.innerHTML = buildLinks(app);
        } catch {}
      }
    }

    // PyPI data: always live (no meaningful rate limit, low traffic)
    if (app.pypi) {
      try {
        const res = await fetch(`https://pypi.org/pypi/${app.pypi}/json`);
        if (res.ok) {
          const { info, releases, urls } = await res.json();
          if (info.summary) {
            app.description = info.summary;
            const el = document.getElementById(`desc-${app.id}`);
            if (el) el.textContent = info.summary;
          }
          const allDates = Object.values(releases).flat().map(f => f.upload_time).filter(Boolean).sort();
          setDates(app.id, allDates[0], urls?.[0]?.upload_time);
        }
      } catch {}
    }
  });
}

// ── Render ──────────────────────────────────────────────

function render() {
  const pinnedGrid = document.getElementById('pinned-grid');
  const grid = document.getElementById('app-grid');
  const q = searchQuery.toLowerCase();

  const pinned = allApps.filter(a => a.pinned);
  document.querySelector('.pinned-section').hidden = pinned.length === 0;
  pinnedGrid.innerHTML = pinned.map((app, i) => cardHTML(app, i)).join('');

  const rest = allApps
    .filter(a => !a.pinned)
    .filter(a => activeFilter === 'all' || (a.platforms || []).includes(activeFilter))
    .filter(a => activeMadeFilter === 'all' || a.made === activeMadeFilter)
    .filter(a => !q || [a.name, a.description, ...(a.tags || [])].some(s => s?.toLowerCase().includes(q)));

  expandedId = null;

  grid.innerHTML = rest.length
    ? rest.map((app, i) => cardHTML(app, i)).join('')
    : `<div class="empty-state"><span>🔍</span> No projects match.</div>`;
}

function cardHTML(app, index) {
  const badgeLabels = { game: '🎮 Game', web: '🌐 Web', desktop: '🖥️ Desktop', android: '📱 Android', package: '📦 Package', library: '📚 Library', cli: '⌨️ CLI' };
  const madeLabels = { handmade: '🖐️ Handmade', hybrid: '⚡ Hybrid', ai: '🤖 AI' };
  const madeBadge = app.made ? `<span class="made-badge ${app.made}">${madeLabels[app.made] || app.made}</span>` : '';
  const typeBadge = `<div class="card-badges">${(app.platforms || []).map(p => `<span class="type-badge ${p}">${badgeLabels[p] || p}</span>`).join('')}</div>`;

  const tags = (app.tags || []).map(t => `<span class="tag">${t}</span>`).join('');
  const links = buildLinks(app);
  const lines = installLines(app);
  const gitLines = lines.filter(l => l.startsWith('git clone'));

  const infoBtn = gitLines.length
    ? `<button class="info-btn" id="info-btn-${app.id}" onclick="toggleInstall('${app.id}')" aria-label="Install instructions">i</button>`
    : '';

  const installPanel = gitLines.length ? `
    <div class="card-install" id="install-${app.id}">
      ${gitLines.map(cmd => `
        <div class="install-line">
          <code>${cmd}</code>
          <button class="copy-btn" onclick="copyInstall(this, '${cmd}')">copy</button>
        </div>`).join('')}
    </div>` : '';

  const pipLine = app.pypi ? `
    <div class="card-pip">
      <code>pip install ${app.pypi}</code>
      <button class="copy-btn" onclick="copyInstall(this, 'pip install ${app.pypi}')">copy</button>
    </div>` : '';

  return `
    <article class="card" id="${app.id}" style="animation-delay:${index * 0.04}s">
      <div class="card-left">
        <div class="card-header">
          <div class="card-icon">${app.icon || '📦'}</div>
          <div class="card-title-group">
            <div class="card-title-line">
              <div class="card-title">${app.name}</div>
              ${madeBadge}
            </div>
            ${typeBadge}
          </div>
          ${infoBtn}
        </div>
        ${installPanel}
        <p class="card-desc" id="desc-${app.id}">${app.description}</p>
      </div>
      <div class="card-mid"></div>
      <div class="card-right">
        ${tags ? `<div class="card-tags">${tags}</div>` : ''}
        <div class="card-links" id="links-${app.id}">${links}</div>
        ${pipLine}
        <div class="card-date" id="date-${app.id}"></div>
      </div>
    </article>`;
}

function buildLinks(app) {
  const l = app.links || {};
  const parts = [];

  if (app.repo && l.downloads === undefined) {
    return '<span class="loading-ring"></span>';
  }

  if (l.launch) {
    parts.push(`<button class="btn btn-primary" onclick="openModal('${l.launch}', '${app.name}')">▶ Launch</button>`);
  }

  if (l.play) {
    parts.push(`<a class="btn btn-primary" href="${l.play}" target="_blank" rel="noopener">▶ Play</a>`);
  }

  if (l.downloads && l.downloads.length) {
    l.downloads.forEach(d => {
      parts.push(`<a class="btn btn-primary" href="${d.url}">↓ ${d.label}</a>`);
    });
  } else if (!l.launch && app.type === 'web' && l.demo) {
    parts.push(`<a class="btn btn-primary" href="${l.demo}" target="_blank" rel="noopener">↗ Live Demo</a>`);
  }
  if (l.pypi) {
    parts.push(`<a class="btn btn-pypi" href="${l.pypi}" target="_blank" rel="noopener">PyPI</a>`);
  }
  if (l.github) {
    parts.push(`<a class="btn btn-ghost" href="${l.github}" target="_blank" rel="noopener">Source</a>`);
  }

  return parts.join('');
}

// ── Filter ──────────────────────────────────────────────

function setFilter(type) {
  activeFilter = type;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === type);
  });
  render();
}

function setMadeFilter(made) {
  activeMadeFilter = made;
  document.querySelectorAll('.made-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.made === made);
  });
  render();
}

// ── Flutter modal ────────────────────────────────────────

let modal, modalFrame, modalTitle;

function openModal(src, name) {
  if (!modal) return;
  modalFrame.src = src;
  modalTitle.textContent = name;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  if (!modal) return;
  modal.hidden = true;
  modalFrame.src = '';
  document.body.style.overflow = '';
}

// ── Init ─────────────────────────────────────────────────

if (document.getElementById('app-grid')) {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
  });

  document.querySelectorAll('.made-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => setMadeFilter(btn.dataset.made));
  });

  document.getElementById('search').addEventListener('input', e => {
    searchQuery = e.target.value;
    render();
  });

  modal = document.getElementById('app-modal');
  modalFrame = document.getElementById('modal-frame');
  modalTitle = document.getElementById('modal-title');

  document.getElementById('modal-close').addEventListener('click', closeModal);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (!modal.hidden) closeModal();
      else if (expandedId) {
        document.getElementById(expandedId)?.classList.remove('card--expanded');
        expandedId = null;
      }
    }
  });

  document.addEventListener('click', e => {
    if (e.target.closest('a, button')) return;
    const card = e.target.closest('.card');
    if (card) {
      const id = card.id;
      history.replaceState(null, '', '#' + id);
      if (expandedId === id) return;
      if (expandedId) document.getElementById(expandedId)?.classList.remove('card--expanded');
      card.classList.add('card--expanded');
      expandedId = id;
    } else {
      if (expandedId) {
        document.getElementById(expandedId)?.classList.remove('card--expanded');
        expandedId = null;
      }
    }
  });

  const statsEl = document.getElementById('hero-stats');
  if (statsEl) {
    const byPlatform = key => allApps.filter(a => (a.platforms||[]).includes(key)).length;
    const byMade     = key => allApps.filter(a => a.made === key).length;

    const mainDefs = [
      { n: allApps.length,       label: 'Projects', color: 'var(--text)' },
      { n: byPlatform('game'),   label: 'Games',    color: '#ec4899' },
      { n: byPlatform('web'),    label: 'Web',      color: 'var(--accent)' },
      { n: byPlatform('desktop'),label: 'Desktop',  color: '#22d3ee' },
      { n: byPlatform('package'),label: 'Packages', color: '#f97316' },
    ].filter(s => s.n > 0);

    const madeDefs = [
      { n: byMade('ai'),        label: 'AI',        color: '#0ea5e9' },
      { n: byMade('hybrid'),    label: 'Hybrid',    color: '#6366f1' },
      { n: byMade('handmade'),  label: 'Handmade',  color: '#84cc16' },
    ].filter(s => s.n > 0);

    const sep = `<div class="hero-stat-sep"></div>`;
    const renderRow = (defs, cls) =>
      `<div class="hero-stats-row ${cls}">${defs.map(({ n, label, color }) =>
        `<div class="hero-stat"><span class="hero-stat-n" style="color:${color}">${n}</span><span class="hero-stat-l">${label}</span></div>`
      ).join(sep)}</div>`;

    statsEl.innerHTML = renderRow(mainDefs, '') + renderRow(madeDefs, 'hero-stats-row--sub');
  }

  render();
  fetchData();

  const scrollToHash = () => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('card--highlighted');
    setTimeout(() => el.classList.remove('card--highlighted'), 2000);
  };

  scrollToHash();
  window.addEventListener('hashchange', scrollToHash);
}
