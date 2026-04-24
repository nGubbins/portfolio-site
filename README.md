# newp space

Portfolio site — live at [newp.space](https://newp.space).

A static single-page site that pulls project cards dynamically from the GitHub releases API and PyPI JSON API on every load. No build step, no framework.

## Stack

- Vanilla HTML / CSS / JS
- GitHub Actions → GitHub Pages (deploys on `v*` tag push)
- GitHub Releases API for download buttons
- PyPI JSON API for package descriptions

## Structure

```
index.html        — markup and filter bar
assets/style.css  — all styles
assets/main.js    — app data, fetch logic, rendering
style-guide.md    — colour tokens and design principles
.github/workflows/deploy.yml — GitHub Pages deploy workflow
```

## Adding a project

Edit `allApps` in `assets/main.js`. Each entry supports:

```js
{
  id: "unique-id",
  name: "Display Name",
  description: "Fallback description (replaced by live API data)",
  type: "desktop" | "web" | "flutter" | "package",
  tags: ["tag1", "tag2"],
  icon: "emoji",
  repo: "owner/repo",       // GitHub repo — fetches description + release assets
  pypi: "package-name",     // PyPI package — fetches description, shows pip install
  links: {
    github: "https://...",
    pypi:   "https://...",
    demo:   "https://...",
    launch: "path/to/flutter-web/",
  }
}
```

## Deploy

Push a version tag to trigger the GitHub Actions workflow:

```sh
git tag v1.0.0 && git push origin v1.0.0
```
