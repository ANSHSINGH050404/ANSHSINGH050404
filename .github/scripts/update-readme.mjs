#!/usr/bin/env node
/**
 * Regenerates the auto-generated sections of README.md from the GitHub API.
 *
 * README.md marks the generated regions with:
 *   <!-- auto:open-source:start --> ... <!-- auto:open-source:end -->
 *   <!-- auto:recent:start -->     ... <!-- auto:recent:end -->
 *
 * Everything between the markers is replaced wholesale on each run. The script
 * exits 0 without touching README.md when the API returns nothing usable, so a
 * transient API failure can never blank out a section.
 *
 * Auth: prefers PROFILE_TOKEN (a personal access token), falls back to the
 * Actions GITHUB_TOKEN. Both work against public resources, but they resolve
 * the GitHub search index differently — the Actions token reports fewer pull
 * requests for the same query. Add a read-only PAT as the `PROFILE_TOKEN`
 * secret for exact counts; without it the script keeps the highest count it
 * has ever published instead of publishing a smaller one.
 */

const LOGIN = process.env.PROFILE_LOGIN || "ANSHSINGH050404";
const TOKEN = process.env.PROFILE_TOKEN || process.env.GITHUB_TOKEN;
const README_PATH = "README.md";

if (!TOKEN) {
	// Unauthenticated search hits a different, staler index and silently
	// reports lower counts (168 instead of 175 here). Fail loudly instead.
	console.error(
		"no token found: set PROFILE_TOKEN or GITHUB_TOKEN before running this script"
	);
	process.exit(1);
}

const API = "https://api.github.com";
const HEADERS = {
	Accept: "application/vnd.github+json",
	"X-GitHub-Api-Version": "2022-11-28",
	"User-Agent": "profile-readme-updater",
	...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
};

async function gh(path, attempt = 0) {
	const res = await fetch(`${API}${path}`, { headers: HEADERS });

	// The search API allows 30 requests/minute. Back off and retry instead of
	// failing the run when the limit is hit.
	if (res.status === 403 || res.status === 429) {
		const retryAfter = Number(res.headers.get("retry-after") ?? 0);
		const waitMs = retryAfter > 0 ? retryAfter * 1000 : 2000 * 2 ** attempt;
		if (attempt < 4) {
			console.log(`rate limited, retrying in ${waitMs}ms`);
			await new Promise((resolve) => setTimeout(resolve, waitMs));
			return gh(path, attempt + 1);
		}
	}

	if (!res.ok) {
		throw new Error(`GET ${path} -> ${res.status} ${res.statusText}`);
	}
	return res.json();
}

/** Paged search across issues+PRs. `cap` bounds the number of pages read. */
async function search(query, cap = 10) {
	const items = [];
	let total = 0;
	for (let page = 1; page <= cap; page += 1) {
		const data = await gh(
			`/search/issues?q=${encodeURIComponent(query)}&per_page=100&page=${page}`
		);
		// The search index is eventually consistent, so the reported total can
		// shift between pages. Keep the highest value seen.
		total = Math.max(total, data.total_count);
		items.push(...data.items);
		if (data.items.length < 100 || items.length >= total) {
			break;
		}
	}
	return { items, total };
}

/** All repositories the profile owns, excluding forks. */
async function ownedRepos() {
	const repos = [];
	for (let page = 1; page <= 4; page += 1) {
		const batch = await gh(
			`/users/${LOGIN}/repos?affiliation=owner&sort=pushed&per_page=100&page=${page}`
		);
		repos.push(...batch);
		if (batch.length < 100) {
			break;
		}
	}
	return repos.filter((repo) => !repo.fork);
}

/** Collapse a repo description into one safe markdown table cell. */
function cell(value, limit = 120) {
	const text = String(value ?? "")
		.replace(/\s+/g, " ")
		.replace(/\|/g, "\\|")
		.trim();
	if (text.length <= limit) {
		return text;
	}
	const cut = text.slice(0, limit);
	const lastSpace = cut.lastIndexOf(" ");
	return `${cut.slice(0, lastSpace > limit * 0.6 ? lastSpace : limit)}…`;
}

function shortDate(iso) {
	return iso ? iso.slice(0, 10) : "—";
}

/**
 * Read the counters already published in README.md.
 *
 * The Actions GITHUB_TOKEN and a personal access token resolve the GitHub
 * search index differently: the same query returned 175 pull requests with a
 * PAT and 168 with the Actions token. Taking the maximum of the stored and the
 * freshly computed value stops the bot from silently shrinking the profile when
 * it runs without a dedicated token.
 */
function readExistingCounts(content) {
	const match = content.match(
		/(\d+) pull requests and (\d+) issues authored — (\d+) merged into (\d+) upstream projects, (\d+) more open across (\d+) projects\./
	);
	if (!match) {
		return null;
	}
	return {
		prs: Number(match[1]),
		issues: Number(match[2]),
		merged: Number(match[3]),
		mergedRepos: Number(match[4]),
		open: Number(match[5]),
		projects: Number(match[6]),
	};
}

function buildOpenSource(mergedPrs, openPrs, counts) {
	const byRepo = new Map();

	const track = (pr, isMerged) => {
		const fullName = pr.repository_url.replace("https://api.github.com/repos/", "");
		if (fullName.startsWith(`${LOGIN}/`)) {
			return; // own repositories are covered by the work section
		}
		const entry = byRepo.get(fullName) ?? { merged: 0, open: 0, latest: null };
		if (isMerged) {
			entry.merged += 1;
		} else {
			entry.open += 1;
		}
		const stamp = isMerged ? pr.pull_request.merged_at : pr.created_at;
		if (stamp && (!entry.latest || stamp > entry.latest)) {
			entry.latest = stamp;
		}
		byRepo.set(fullName, entry);
	};

	for (const pr of mergedPrs) {
		track(pr, true);
	}
	for (const pr of openPrs) {
		track(pr, false);
	}

	const all = [...byRepo.entries()].filter(([, v]) => v.merged + v.open > 0);
	if (all.length === 0) {
		return null;
	}

	// Totals are computed over every upstream repo, not just the rows shown.
	const upstreamMerged = all.reduce((sum, [, v]) => sum + v.merged, 0);
	const upstreamOpen = all.reduce((sum, [, v]) => sum + v.open, 0);
	const mergedRepos = all.filter(([, v]) => v.merged > 0).length;

	// Merged work is the stronger signal, so it sorts first.
	const rows = all
		.sort((a, b) => b[1].merged - a[1].merged || b[1].open - a[1].open)
		.slice(0, 20);

	const published = {
		prs: Math.max(counts.prs, counts.storedPrs ?? 0),
		issues: Math.max(counts.issues, counts.storedIssues ?? 0),
		merged: Math.max(upstreamMerged, counts.storedMerged ?? 0),
		mergedRepos: Math.max(mergedRepos, counts.storedMergedRepos ?? 0),
		open: Math.max(upstreamOpen, counts.storedOpen ?? 0),
		projects: Math.max(all.length, counts.storedProjects ?? 0),
	};

	const lines = [];
	lines.push(
		`${published.prs} pull requests and ${published.issues} issues authored — ${published.merged} merged into ${published.mergedRepos} upstream projects, ${published.open} more open across ${published.projects} projects.`,
		"",
		"| Upstream project | Merged | Open | Latest |",
		"| --- | ---: | ---: | --- |"
	);

	for (const [fullName, v] of rows) {
		lines.push(
			`| [${fullName}](https://github.com/${fullName}) | ${v.merged} | ${v.open} | ${shortDate(v.latest)} |`
		);
	}

	return lines.join("\n");
}

function buildRecent(repos) {
	const rows = repos
		.filter((repo) => repo.name !== LOGIN)
		.sort((a, b) => (b.pushed_at ?? "").localeCompare(a.pushed_at ?? ""))
		.slice(0, 6);

	if (rows.length === 0) {
		return null;
	}

	// The date column carries no break opportunities, so placing it before the
	// long description stops the date from wrapping onto two lines.
	const lines = ["| Project | Last push | Description |", "| --- | --- | --- |"];
	for (const repo of rows) {
		lines.push(
			`| [${repo.name}](https://github.com/${repo.full_name}) | ${shortDate(repo.pushed_at)} | ${cell(repo.description) || "—"} |`
		);
	}
	return lines.join("\n");
}

/** Replace everything between `start` and `end` markers. Returns null if absent. */
function replaceRegion(content, name, body) {
	const start = `<!-- auto:${name}:start -->`;
	const end = `<!-- auto:${name}:end -->`;
	const startIndex = content.indexOf(start);
	const endIndex = content.indexOf(end);
	if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
		throw new Error(`missing markers for region "${name}" in ${README_PATH}`);
	}
	const before = content.slice(0, startIndex + start.length);
	const after = content.slice(endIndex);
	return `${before}\n${body}\n${after}`;
}

async function main() {
	const { readFile, writeFile } = await import("node:fs/promises");

	const original = await readFile(README_PATH, "utf8");
	const stored = readExistingCounts(original);

	// One search covers every PR state, so merged/open are derived from the
	// payload instead of costing three separate searches.
	const [prs, issues, repos] = await Promise.all([
		search(`author:${LOGIN} type:pr`),
		search(`author:${LOGIN} type:issue`),
		ownedRepos(),
	]);

	const mergedPrs = prs.items.filter((pr) => pr.pull_request?.merged_at);
	const openPrs = prs.items.filter((pr) => pr.state === "open");

	if (mergedPrs.length === 0 && openPrs.length === 0) {
		console.log("no pull request data available; leaving README.md unchanged");
		return;
	}

	const openSource = buildOpenSource(mergedPrs, openPrs, {
		prs: prs.total,
		issues: issues.total,
		storedPrs: stored?.prs,
		storedIssues: stored?.issues,
		storedMerged: stored?.merged,
		storedMergedRepos: stored?.mergedRepos,
		storedOpen: stored?.open,
		storedProjects: stored?.projects,
	});
	const recent = buildRecent(repos);

	if (!openSource || !recent) {
		console.log("generated section was empty; leaving README.md unchanged");
		return;
	}

	let updated = replaceRegion(original, "open-source", openSource);
	updated = replaceRegion(updated, "recent", recent);

	if (updated === original) {
		console.log("README.md already up to date");
		return;
	}

	await writeFile(README_PATH, updated, "utf8");
	console.log("README.md updated");
}

main().catch((error) => {
	console.error(`update-readme failed: ${error.message}`);
	process.exitCode = 1;
});
