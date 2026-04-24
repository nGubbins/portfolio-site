# newp space

Portfolio site — live at [newp.space](https://newp.space).

A static single-page site that pulls project cards dynamically from the GitHub releases API and PyPI JSON API. No build step, no framework. Use it as a template for your own.

## Stack

- Vanilla HTML / CSS / JS
- GitHub Actions → GitHub Pages (deploys on every push to `master`)
- Release data baked in at deploy time via `GITHUB_TOKEN` — no runtime rate limits
- PyPI JSON API for package descriptions

## Structure

```
index.html                   — markup and filter bar
assets/projects.js           — ← your projects, edit this file
assets/main.js               — fetch logic and rendering
assets/style.css             — all styles
style-guide.md               — colour tokens and design principles
scripts/fetch-releases.js    — runs at deploy time to bake in release data
.github/workflows/deploy.yml — GitHub Pages deploy workflow
```

## Using as a template

Click **Use this template** on GitHub to create your own copy, then:

1. Edit `assets/projects.js` — replace the entries with your own projects
2. Update `index.html` — change the site name, title, and footer
3. Add your custom domain to `CNAME` and configure GitHub Pages in repo settings
4. Push to `master` — GitHub Actions deploys automatically

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

Example prompts:

- *"Add a card for github.com/you/your-repo"*
- *"Grab all my public PyPI packages and add cards for each"*
- *"Commit and push to deploy"*

## Adding a project manually

Edit `assets/projects.js`. Each entry supports:

```js
{
  id: "unique-id",
  name: "Display Name",
  description: "Fallback (replaced at load time by live GitHub/PyPI description)",
  type: "desktop" | "web" | "flutter" | "package",
  tags: ["tag1", "tag2"],        // max 3
  icon: "emoji",
  pinned: true,                  // optional — shows in pinned section at top
  repo: "owner/repo",            // GitHub — fetches description + release assets
  pypi: "package-name",          // PyPI — fetches description, shows pip install
  links: {
    github: "https://...",
    pypi:   "https://...",
    demo:   "https://...",       // primary button for web apps
    launch: "path/to/flutter/",  // opens Flutter web build in modal
  }
}
```
