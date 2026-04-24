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

## Managing projects with Claude Code

The easiest way to add and manage projects is with [Claude Code](https://claude.ai/code) — Anthropic's AI CLI. It can look up your GitHub repos and PyPI packages, write the card entries, and commit and deploy in one conversation.

Install it:

```sh
npm install -g @anthropic-ai/claude-code
```

Then from the repo directory:

```sh
claude
```

Example prompts to get started:

- *"Add a card for github.com/you/your-repo"*
- *"Grab all my public PyPI packages and add cards for each"*
- *"Add a box for this portfolio site and repo"*
- *"Commit and push with a v tag to deploy"*

Claude will fetch repo descriptions, map release assets to platform labels, write the `allApps` entry, commit, and push — including tagging a release to trigger the deploy workflow.

## Adding a project manually

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
