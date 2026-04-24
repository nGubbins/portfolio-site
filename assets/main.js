let activeFilter = 'all';

const allApps = [
  {
    id: "peerwire",
    name: "Peerwire",
    description: "Lightweight chat app for desktop. Available for Windows, macOS, and Linux — no account or server required.",
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
    description: "Simple music player and library manager. Available for Windows and Android.",
    type: "flutter",
    tags: ["flutter", "music", "windows", "android"],
    icon: "🎵",
    repo: "nGubbins/ng3-player",
    links: { github: "https://github.com/nGubbins/ng3-player" }
  }
];

// ── Releases ─────────────────────────────────────────────

function platformLabel(filename) {
  const n = filename.toLowerCase();
  if (n.endsWith('.exe') || n.includes('windows')) return 'Windows';
  if (n.endsWith('.dmg') || n.includes('macos') || n.includes('darwin') || n.includes('mac')) return 'macOS';
  if (n.endsWith('.appimage') || n.includes('linux')) return 'Linux';
  if (n.endsWith('.apk') || n.includes('android')) return 'Android';
  return null;
}

async function fetchReleases() {
  allApps.filter(a => a.repo).forEach(async app => {
    try {
      const res = await fetch(`https://api.github.com/repos/${app.repo}/releases/latest`);
      if (!res.ok) throw new Error();
      const release = await res.json();
      app.links.downloads = release.assets
        .map(a => ({ label: platformLabel(a.name), url: a.browser_download_url }))
        .filter(d => d.label);
    } catch {
      app.links.downloads = [];
    }
    const el = document.getElementById(`links-${app.id}`);
    if (el) el.innerHTML = buildLinks(app);
  });
}

// ── Render ──────────────────────────────────────────────

function render() {
  const grid = document.getElementById('app-grid');
  const apps = activeFilter === 'all'
    ? allApps
    : allApps.filter(a => a.type === activeFilter);

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
  const badges = { web: '🌐 Web', desktop: '🖥️ Desktop', flutter: '🐦 Flutter' };
  const typeBadge = `<span class="type-badge ${app.type}">${badges[app.type] || app.type}</span>`;

  const tags = (app.tags || []).map(t => `<span class="tag">${t}</span>`).join('');
  const links = buildLinks(app);

  return `
    <article class="card" style="animation-delay:${index * 0.04}s">
      <div class="card-header">
        <div class="card-icon">${app.icon || '📦'}</div>
        <div class="card-title-group">
          <div class="card-title">${app.name}</div>
          ${typeBadge}
        </div>
      </div>
      <p class="card-desc">${app.description}</p>
      ${tags ? `<div class="card-tags">${tags}</div>` : ''}
      <div class="card-links" id="links-${app.id}">${links}</div>
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
fetchReleases();
