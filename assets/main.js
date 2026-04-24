let activeFilter = 'all';
let searchQuery = '';

const allApps = [
  {
    id: "peerwire",
    name: "Peerwire",
    description: "Lightweight chat app for desktop.",
    type: "desktop",
    tags: ["electron", "chat", "cross-platform"],
    icon: "💬",
    repo: "nGubbins/peerwire",
    links: { github: "https://github.com/nGubbins/peerwire" }
  },
  {
    id: "urlias-cli",
    name: "urlias",
    description: "CLI tool for inspecting web pages.",
    type: "desktop",
    tags: ["python", "cli", "web"],
    icon: "🔗",
    repo: "nGubbins/urlias-cli",
    links: { github: "https://github.com/nGubbins/urlias-cli" }
  },
  {
    id: "ng3-player",
    name: "ng3 Player",
    description: "Simple music player and library manager.",
    type: "flutter",
    tags: ["flutter", "music", "cross-platform"],
    icon: "🎵",
    repo: "nGubbins/ng3-player",
    links: { github: "https://github.com/nGubbins/ng3-player" }
  },
  {
    id: "portfolio-site",
    name: "newp space",
    description: "This site.",
    type: "web",
    tags: ["javascript", "web", "static"],
    icon: "🌐",
    repo: "nGubbins/portfolio-site",
    links: { demo: "https://newp.space", github: "https://github.com/nGubbins/portfolio-site" }
  },
  {
    id: "newgh",
    name: "newgh",
    description: "Sets up a Python project repo for modern development.",
    type: "package",
    tags: ["python", "cli", "devtools"],
    icon: "🏗️",
    pypi: "newgh",
    links: { pypi: "https://pypi.org/project/newgh/" }
  },
  {
    id: "tokensplit",
    name: "tokensplit",
    description: "String-separated values with user-defined multi-character delimiters.",
    type: "package",
    tags: ["python", "library", "parsing"],
    icon: "✂️",
    pypi: "tokensplit",
    links: { pypi: "https://pypi.org/project/tokensplit/" }
  }
];

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
  panel.hidden = !panel.hidden;
  btn.classList.toggle('active', !panel.hidden);
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

function setDates(id, firstIso, latestIso) {
  const el = document.getElementById(`date-${id}`);
  if (!el) return;
  if (!firstIso) return;
  if (!latestIso || firstIso === latestIso) {
    el.innerHTML = `<div>released ${formatDate(firstIso)}</div>`;
  } else {
    el.innerHTML = `<div>first release ${formatDate(firstIso)}</div><div>updated ${formatDate(latestIso)}</div>`;
  }
}

async function fetchData() {
  allApps.forEach(async app => {
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

    if (app.repo) {
      const [repoRes, releaseRes, firstReleaseRes] = await Promise.all([
        fetch(`https://api.github.com/repos/${app.repo}`).catch(() => null),
        fetch(`https://api.github.com/repos/${app.repo}/releases/latest`).catch(() => null),
        fetch(`https://api.github.com/repos/${app.repo}/releases?per_page=1&direction=asc`).catch(() => null)
      ]);

      if (repoRes?.ok) {
        const { description } = await repoRes.json();
        if (description) {
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

      let firstDate = null;
      if (firstReleaseRes?.ok) {
        const [first] = await firstReleaseRes.json();
        firstDate = first?.published_at ?? null;
      }

      setDates(app.id, firstDate || latestDate, latestDate);

      const el = document.getElementById(`links-${app.id}`);
      if (el) el.innerHTML = buildLinks(app);
    }
  });
}

// ── Render ──────────────────────────────────────────────

function render() {
  const grid = document.getElementById('app-grid');
  const q = searchQuery.toLowerCase();
  const apps = allApps
    .filter(a => activeFilter === 'all' || a.type === activeFilter)
    .filter(a => !q || [a.name, a.description, ...(a.tags || [])].some(s => s?.toLowerCase().includes(q)));

  if (apps.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <span>🔍</span>
        No apps in this category yet.
      </div>`;
    return;
  }

  grid.innerHTML = apps.map((app, i) => cardHTML(app, i)).join('');
}

function cardHTML(app, index) {
  const badges = { web: '🌐 Web', desktop: '🖥️ Desktop', flutter: '🐦 Flutter', package: '📦 Package' };
  const typeBadge = `<span class="type-badge ${app.type}">${badges[app.type] || app.type}</span>`;

  const tags = (app.tags || []).map(t => `<span class="tag">${t}</span>`).join('');
  const links = buildLinks(app);
  const lines = installLines(app);

  const infoBtn = lines.length
    ? `<button class="info-btn" id="info-btn-${app.id}" onclick="toggleInstall('${app.id}')" aria-label="Install instructions">i</button>`
    : '';

  const installPanel = lines.length ? `
    <div class="card-install" id="install-${app.id}" hidden>
      ${lines.map(cmd => `
        <div class="install-line">
          <code>${cmd}</code>
          <button class="copy-btn" onclick="copyInstall(this, '${cmd}')">copy</button>
        </div>`).join('')}
    </div>` : '';

  return `
    <article class="card" style="animation-delay:${index * 0.04}s">
      <div class="card-header">
        <div class="card-icon">${app.icon || '📦'}</div>
        <div class="card-title-group">
          <div class="card-title">${app.name}</div>
          ${typeBadge}
        </div>
        ${infoBtn}
      </div>
      ${installPanel}
      <p class="card-desc" id="desc-${app.id}">${app.description}</p>
      ${tags ? `<div class="card-tags">${tags}</div>` : ''}
      <div class="card-links" id="links-${app.id}">${links}</div>
      <div class="card-date" id="date-${app.id}"></div>
    </article>`;
}

function buildLinks(app) {
  const l = app.links || {};
  const parts = [];

  if (app.type === 'flutter' && l.launch) {
    parts.push(`<button class="btn btn-primary" onclick="openModal('${l.launch}', '${app.name}')">▶ Launch</button>`);
  } else if (app.repo && l.downloads === undefined) {
    return '<span class="loading-ring"></span>';
  } else if (l.downloads && l.downloads.length) {
    l.downloads.forEach(d => {
      parts.push(`<a class="btn btn-primary" href="${d.url}">↓ ${d.label}</a>`);
    });
  } else if (app.type === 'web' && l.demo) {
    parts.push(`<a class="btn btn-primary" href="${l.demo}" target="_blank" rel="noopener">↗ Live Demo</a>`);
  }
  if (l.pypi) {
    parts.push(`<a class="btn btn-ghost" href="${l.pypi}" target="_blank" rel="noopener">PyPI</a>`);
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

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => setFilter(btn.dataset.filter));
});

document.getElementById('search').addEventListener('input', e => {
  searchQuery = e.target.value;
  render();
});

// ── Flutter modal ────────────────────────────────────────

const modal = document.getElementById('app-modal');
const modalFrame = document.getElementById('modal-frame');
const modalTitle = document.getElementById('modal-title');

function openModal(src, name) {
  modalFrame.src = src;
  modalTitle.textContent = name;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.hidden = true;
  modalFrame.src = '';
  document.body.style.overflow = '';
}

document.getElementById('modal-close').addEventListener('click', closeModal);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !modal.hidden) closeModal();
});

// ── Init ─────────────────────────────────────────────────

render();
fetchData();
