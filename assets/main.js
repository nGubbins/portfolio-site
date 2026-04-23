let activeFilter = 'all';

const allApps = [
  {
    id: "mock-1",
    name: "File Organiser",
    description: "Watches a folder and automatically sorts files into subdirectories by type, date, or custom rules. Never touch Downloads chaos again.",
    type: "desktop",
    tags: ["python", "automation", "files"],
    icon: "📁",
    links: { download: "#", github: "#" }
  },
  {
    id: "mock-2",
    name: "Quick Invoice",
    description: "Generate clean PDF invoices from a simple form. No subscription, no account — just fill in the fields and download.",
    type: "web",
    tags: ["productivity", "finance"],
    icon: "🧾",
    links: { demo: "#", github: "#" }
  },
  {
    id: "mock-3",
    name: "Clipboard History",
    description: "System tray app that keeps a searchable history of everything you've copied. Keyboard shortcut to paste anything from the last 24 hours.",
    type: "desktop",
    tags: ["python", "productivity", "tray"],
    icon: "📋",
    links: { download: "#", github: "#" }
  },
  {
    id: "mock-4",
    name: "CSV Cleaner",
    description: "Drag in a messy CSV, pick transformations (trim whitespace, fix casing, dedupe rows), and get a clean file back. No pandas knowledge required.",
    type: "web",
    tags: ["data", "utility"],
    icon: "🧹",
    links: { demo: "#", github: "#" }
  },
  {
    id: "mock-5",
    name: "Focus Timer",
    description: "Minimal Pomodoro timer that blocks distracting sites during work sessions and logs how much deep work you did each day.",
    type: "desktop",
    tags: ["python", "productivity", "focus"],
    icon: "⏱️",
    links: { download: "#", github: "#" }
  },
  {
    id: "mock-6",
    name: "Colour Palette Extractor",
    description: "Upload any image and instantly get its dominant colour palette as hex codes, ready to copy into your design tool.",
    type: "web",
    tags: ["design", "utility"],
    icon: "🎨",
    links: { demo: "#", github: "#" }
  },
  {
    id: "mock-7",
    name: "Batch Renamer",
    description: "Rename hundreds of files at once using pattern matching, numbering sequences, or find-and-replace. Preview changes before committing.",
    type: "desktop",
    tags: ["python", "files", "automation"],
    icon: "✏️",
    links: { download: "#", github: "#" }
  },
  {
    id: "mock-8",
    name: "Markdown Previewer",
    description: "Paste markdown on the left, see the rendered output on the right. Includes export to clean HTML or PDF with one click.",
    type: "web",
    tags: ["writing", "utility"],
    icon: "📝",
    links: { demo: "#", github: "#" }
  },
  {
    id: "mock-9",
    name: "System Monitor",
    description: "Lightweight tray app showing CPU, RAM, and disk usage at a glance. Alerts you when something is eating your resources.",
    type: "desktop",
    tags: ["python", "system", "tray"],
    icon: "📊",
    links: { download: "#", github: "#" }
  }
];

function loadApps() {
  render();
}

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
  const typeBadge = app.type === 'web'
    ? `<span class="type-badge web">🌐 Web</span>`
    : `<span class="type-badge desktop">🖥️ Desktop</span>`;

  const tags = (app.tags || [])
    .map(t => `<span class="tag">${t}</span>`)
    .join('');

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
      <div class="card-links">${links}</div>
    </article>`;
}

function buildLinks(app) {
  const l = app.links || {};
  const parts = [];

  if (app.type === 'web' && l.demo) {
    parts.push(`<a class="btn btn-primary" href="${l.demo}" target="_blank" rel="noopener">
      ↗ Live Demo
    </a>`);
  }
  if (app.type === 'desktop' && l.download) {
    parts.push(`<a class="btn btn-primary" href="${l.download}" target="_blank" rel="noopener">
      ↓ Download
    </a>`);
  }
  if (l.github) {
    parts.push(`<a class="btn btn-ghost" href="${l.github}" target="_blank" rel="noopener">
      GitHub
    </a>`);
  }

  return parts.join('');
}

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

loadApps();
