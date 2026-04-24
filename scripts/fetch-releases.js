#!/usr/bin/env node
// Runs in CI (GitHub Actions) with GH_TOKEN set.
// Fetches release and repo data for every project and writes assets/releases.json.
// The client loads this static file instead of hitting the GitHub API at runtime.

const { execSync } = require('child_process');
const fs = require('fs');

const repos = [
  'nGubbins/peerwire',
  'nGubbins/ng3-player',
  'nGubbins/urlias-cli',
  'nGubbins/portfolio-site',
  'nGubbins/newgh',
  'nGubbins/tokensplit'
];

function platformLabel(filename) {
  const n = filename.toLowerCase();
  if (n.endsWith('.exe') || n.includes('windows')) return 'Windows';
  if (n.endsWith('.dmg') || n.includes('macos') || n.includes('darwin') || n.includes('mac')) return 'macOS';
  if (n.endsWith('.appimage') || n.includes('linux')) return 'Linux';
  if (n.endsWith('.apk') || n.includes('android')) return 'Android';
  return null;
}

function gh(cmd) {
  return JSON.parse(execSync(`gh api ${cmd}`, { encoding: 'utf8' }));
}

const result = {};

for (const repo of repos) {
  try {
    const repoData = gh(`repos/${repo}`);

    let latestRelease = null;
    try { latestRelease = gh(`repos/${repo}/releases/latest`); } catch {}

    let firstRelease = null;
    try {
      const releases = gh(`"repos/${repo}/releases?per_page=1&direction=asc"`);
      firstRelease = releases[0] || null;
    } catch {}

    result[repo] = {
      description:      repoData.description || '',
      downloads:        latestRelease
                          ? latestRelease.assets
                              .map(a => ({ label: platformLabel(a.name), url: a.browser_download_url }))
                              .filter(d => d.label)
                          : [],
      publishedAt:      latestRelease?.published_at || null,
      firstPublishedAt: firstRelease?.published_at  || null
    };

    console.log(`✓ ${repo} (${result[repo].downloads.length} assets)`);
  } catch (e) {
    console.error(`✗ ${repo}: ${e.message}`);
    result[repo] = { description: '', downloads: [], publishedAt: null, firstPublishedAt: null };
  }
}

fs.writeFileSync('assets/releases.json', JSON.stringify(result, null, 2));
console.log('wrote assets/releases.json');
