# portfolio-site (newp.space)

Static GitHub Pages site listing all projects. Deployed on push to `master`.

## Stack
- Vanilla JS, no build step
- `assets/projects.js` — all project data (edit here to add/update projects)
- `assets/main.js` — rendering, filtering, modal, fetch logic
- `assets/style.css` — all styles
- `scripts/fetch-releases.js` — runs at deploy time, writes `assets/releases.json` (GitHub release assets + descriptions)

## Adding a project
Add an entry to `allApps` in `assets/projects.js`. Fields:
- `id` — unique string, used as DOM id and URL hash
- `name`, `description`, `icon`
- `type` — `"web" | "flutter" | "desktop" | "package"` (used for internal logic, not filters)
- `platforms` — array, drives filter buttons and badges: `"game" | "web" | "desktop" | "android" | "package" | "library" | "cli"`
- `made` — `"handmade" | "hybrid" | "ai"` (shown inline with title, drives second filter row)
- `repo` — `"owner/repo"` fetches description + release download buttons automatically
- `pypi` — package name, shows always-visible pip install line
- `links.demo` — Live Demo button (web apps)
- `links.play` — Play button, opens in new tab
- `links.launch` — Launch button, opens in modal iframe (Flutter)
- `links.github`, `links.pypi` — Source / PyPI buttons

## TODO
- [ ] Fix stats bar responsiveness / mobile view
- [ ] Tile expanding to full row when selected (card expand interaction)
- [ ] Better project card data management — too many fields to update individually when adding new types; consider a schema or card builder
