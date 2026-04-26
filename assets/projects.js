// ── Your projects ────────────────────────────────────────
// Add, remove, or edit entries here. Each project gets its own card.
//
// Fields:
//   id          unique string, used for DOM element IDs
//   name        display name
//   description fallback text (replaced at load time by live GitHub/PyPI description)
//   type        "desktop" | "web" | "flutter" | "package"
//   tags        max 3 — used for search and filtering
//   icon        emoji shown on the card
//   pinned      true → appears in the pinned section at top (optional)
//   repo        "owner/repo" — fetches description, release assets, dates from GitHub
//   pypi        "package-name" — fetches description and dates from PyPI
//   links:
//     github    source link button
//     pypi      PyPI page button
//     demo      primary button for web apps (↗ Live Demo)
//     launch    path to Flutter web build (opens in modal)

const allApps = [
  {
    id: "portfolio-site",
    name: "newp space",
    description: "This site.",
    type: "web",
    platforms: ["web"],
    tags: ["javascript", "web", "static"],
    icon: "🌐",
    repo: "nGubbins/portfolio-site",
    links: { demo: "https://newp.space", github: "https://github.com/nGubbins/portfolio-site" }
  },
  {
    id: "gridraider",
    name: "GridRaider",
    description: "Grid-based strategy game.",
    type: "desktop",
    platforms: ["desktop", "web"],
    tags: ["game", "strategy", "grid"],
    icon: "🎮",
    repo: "nGubbins/gridraider",
    links: { play: "https://ngubbins.github.io/gridraider", github: "https://github.com/nGubbins/gridraider" }
  },
  {
    id: "ng3-player",
    name: "ng3 Player",
    description: "Simple music player and library manager.",
    type: "flutter",
    platforms: ["desktop", "android"],
    tags: ["flutter", "music", "cross-platform"],
    icon: "🎵",
    repo: "nGubbins/ng3-player",
    links: { github: "https://github.com/nGubbins/ng3-player" }
  },
  {
    id: "peerwire",
    name: "Peerwire",
    description: "Lightweight chat app for desktop.",
    type: "desktop",
    platforms: ["desktop"],
    tags: ["electron", "chat", "cross-platform"],
    icon: "💬",
    repo: "nGubbins/peerwire",
    links: { github: "https://github.com/nGubbins/peerwire" }
  },
  {
    id: "quicksec",
    name: "quicksec",
    description: "Command-line tool that audits website security.",
    type: "package",
    platforms: ["package", "library", "cli"],
    tags: ["python", "cli", "security"],
    icon: "🔒",
    pypi: "quicksec",
    repo: "nGubbins/quicksec",
    links: { pypi: "https://pypi.org/project/quicksec/", github: "https://github.com/nGubbins/quicksec" }
  },
  {
    id: "newgh",
    name: "newgh",
    description: "Sets up a Python project repo for modern development.",
    type: "package",
    platforms: ["package", "cli"],
    tags: ["python", "cli", "devtools"],
    icon: "🏗️",
    pypi: "newgh",
    repo: "nGubbins/newgh",
    links: { pypi: "https://pypi.org/project/newgh/", github: "https://github.com/nGubbins/newgh" }
  },
  {
    id: "urlias-cli",
    name: "urlias",
    description: "CLI tool for inspecting web pages.",
    type: "desktop",
    platforms: ["cli"],
    tags: ["python", "cli", "web"],
    icon: "🔗",
    repo: "nGubbins/urlias-cli",
    links: { github: "https://github.com/nGubbins/urlias-cli" }
  },
  {
    id: "tokensplit",
    name: "tokensplit",
    description: "String-separated values with user-defined multi-character delimiters.",
    type: "package",
    platforms: ["package", "library"],
    tags: ["python", "library", "parsing"],
    icon: "✂️",
    pypi: "tokensplit",
    repo: "nGubbins/tokensplit",
    links: { pypi: "https://pypi.org/project/tokensplit/", github: "https://github.com/nGubbins/tokensplit" }
  },
];
