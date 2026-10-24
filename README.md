<!-- boot header -->
<img alt="Terminal boot sequence for ANSH SINGH — full-stack and agentic AI engineer building tools for AI coding agents" src="https://raw.githubusercontent.com/ANSHSINGH050404/ANSHSINGH050404/main/assets/boot.svg" width="100%">

<img src="https://raw.githubusercontent.com/ANSHSINGH050404/ANSHSINGH050404/main/assets/divider.svg" width="100%">

## `$ about`

<img alt="System profile: full-stack and agentic AI engineer focused on AI agents, developer tooling and backend systems. 19 merged pull requests upstream. TypeScript 77 percent. Next.js, React, PostgreSQL, Redis, Docker, Trigger.dev." src="https://raw.githubusercontent.com/ANSHSINGH050404/ANSHSINGH050404/main/assets/workstation.svg" width="100%">

I build the layer underneath the AI product — the browser automation, the job queues, the streaming APIs, the auth, the schema. The parts that decide whether a demo becomes a system.

Three rules I actually work by:

> **Make it observable.** An agent run you cannot replay is a bug you cannot debug.
>
> **Own the boring layer.** Queues, schemas, retries, auth. That is where systems fail, not in the model.
>
> **Automate the second run.** The first run teaches you what to automate.

## `$ ls ./projects`

### 01 · `browseflow`

**Visual AI browser automation.**

A React Flow canvas where `Open URL`, `Act`, `Extract`, `Observe`, `Agent`, `HTTP`, `Wait`, `Condition` and email nodes are wired into a graph, then executed on Trigger.dev workers with live run status and Browserbase session replay. Stagehand drives the browser, Liveblocks keeps the canvas in sync for multiplayer editing, Clerk handles auth and org billing, and Neon + Drizzle persist the graph.

`Next.js 16` · `React 19` · `Trigger.dev` · `Stagehand` · `Browserbase` · `Liveblocks` · `Clerk` · `Neon` · `Drizzle` · `Sentry`

[live demo](https://browseflow-wine.vercel.app) · [source](https://github.com/ANSHSINGH050404/Browseflow-AI-browser-workflows)

### 02 · `voicevue`

**AI voice interview practice.**

Vapi handles real-time speech while Gemini generates the questions, and a Next.js App Router front end drives the practice, library, results and leaderboard flows. Auth is JWT over MongoDB, with Supabase client utilities alongside.

`Next.js` · `Gemini` · `Vapi` · `MongoDB` · `Supabase` · `JWT` · `Tailwind` · `Radix` · `Framer Motion`

[live demo](https://voicevue-ai.vercel.app) · [source](https://github.com/ANSHSINGH050404/voicevue-ai)

### 03 · `codeglow`

**Turn code into images that look worth sharing.**

Type or paste code onto a canvas, choose a syntax theme, one of five monospace fonts, a background and a glow, then export a PNG at 1–4x, an SVG or a JPEG. Shiki highlights while you type, a share link reopens an exact snippet for anyone, and a gallery of remixable starting points sits at `/gallery`. PostHog tracks the funnel; Bun runs the unit tests.

`Next.js 16` · `React 19` · `Shiki` · `Tailwind v4` · `Radix` · `Zustand` · `html-to-image` · `Bun`

[live demo](https://codeglow-kappa.vercel.app) · [source](https://github.com/ANSHSINGH050404/CodeGlow)

<details>
<summary>▸ replay a real coding-agent run</summary>

<img alt="Tracekit recording an AI coding agent run — every tool call, command and file diff, replayable in a local viewer" src="https://raw.githubusercontent.com/ANSHSINGH050404/ANSHSINGH050404/main/assets/tracekit-demo.gif" width="100%">

A real recorded session from [Tracekit](https://github.com/ANSHSINGH050404/Tracekit) — every tool call, command and file diff, replayable in a local viewer. No account, no database, no network calls.

</details>

## `$ git log --author=@me --merges`

<!-- auto:open-source:start -->
179 pull requests and 80 issues authored — 19 merged into 5 upstream projects, 21 more open across 15 projects.

| Upstream project | Merged | Open | Latest |
| --- | ---: | ---: | --- |
| [The-Boring-Education/TBE-Web](https://github.com/The-Boring-Education/TBE-Web) | 7 | 2 | 2026-08-24 |
| [novuhq/novu](https://github.com/novuhq/novu) | 6 | 0 | 2026-08-02 |
| [fleetbase/fleetbase](https://github.com/fleetbase/fleetbase) | 3 | 0 | 2026-09-16 |
| [pingdotgg/t3code](https://github.com/pingdotgg/t3code) | 2 | 0 | 2026-10-12 |
| [anomalyco/opencode](https://github.com/anomalyco/opencode) | 1 | 0 | 2026-10-22 |
| [firecrawl/firecrawl](https://github.com/firecrawl/firecrawl) | 0 | 5 | 2026-07-19 |
| [bug0inc/qa-agent](https://github.com/bug0inc/qa-agent) | 0 | 3 | 2026-07-16 |
| [meteor/meteor](https://github.com/meteor/meteor) | 0 | 3 | 2026-02-23 |
| [c2siorg/Codelabz](https://github.com/c2siorg/Codelabz) | 0 | 2 | 2026-02-23 |
| [TerseAI/durable-actors](https://github.com/TerseAI/durable-actors) | 0 | 1 | 2026-10-07 |
| [directus/directus](https://github.com/directus/directus) | 0 | 1 | 2026-10-01 |
| [superloglabs/superlog](https://github.com/superloglabs/superlog) | 0 | 1 | 2026-09-18 |
| [danielwh2/springline](https://github.com/danielwh2/springline) | 0 | 1 | 2026-09-11 |
| [thewhitewolf09/ArcMart](https://github.com/thewhitewolf09/ArcMart) | 0 | 1 | 2026-09-02 |
| [gumloop/gumloop-js](https://github.com/gumloop/gumloop-js) | 0 | 1 | 2026-04-17 |
<!-- auto:open-source:end -->

Merged upstream, newest first:

| commit | upstream | what it fixed |
| --- | --- | --- |
| [`c93aaae371`](https://github.com/anomalyco/opencode/commit/c93aaae37157d785f76a8e9a9243a6560e286468) | [anomalyco/opencode#51536](https://github.com/anomalyco/opencode/pull/51536) | `fix(tui)` — degrade when `fs.watch` fails |
| [`4a90c1cf5d`](https://github.com/pingdotgg/t3code/commit/4a90c1cf5db5f25893827643fb32d3304dddcdd9) | [pingdotgg/t3code#15293](https://github.com/pingdotgg/t3code/pull/15293) | `fix(web)` — keep queued threads subscribed |
| [`abd4314197`](https://github.com/fleetbase/fleetbase/commit/abd4314197282041b0959baaf545d584a0d572ac) | [fleetbase/fleetbase#658](https://github.com/fleetbase/fleetbase/pull/658) | `fix(auth)` — guard 2FA against messageless errors |
| [`df0a5171a9`](https://github.com/The-Boring-Education/TBE-Web/commit/df0a5171a98a2d24dc37bce91aadb587aed30d2d) | [TBE-Web#1207](https://github.com/The-Boring-Education/TBE-Web/pull/1207) | `fix(platform)` — keep DSA questions current |
| [`038321cca2`](https://github.com/novuhq/novu/commit/038321cca264b6599553be4ee476b268acc837a8) | [novuhq/novu#12184](https://github.com/novuhq/novu/pull/12184) | `fix(app-generic)` — await BullMQ enqueue |
| [`c651019baa`](https://github.com/novuhq/novu/commit/c651019baa93f56099d84b2c2a82cfc01233b924) | [novuhq/novu#12097](https://github.com/novuhq/novu/pull/12097) | `chore(api-service)` — log errors, do not swallow |
| [`0a29f0fb80`](https://github.com/novuhq/novu/commit/0a29f0fb801eb3a6e8647668c50f442a8d360262) | [novuhq/novu#12095](https://github.com/novuhq/novu/pull/12095) | `fix(worker)` — drop the async Promise executor |
| [`315bdfd550`](https://github.com/novuhq/novu/commit/315bdfd550cfbefc2996a9d04bcb672329d197c3) | [novuhq/novu#12079](https://github.com/novuhq/novu/pull/12079) | `fix` — disable connector dropdown while generating |
| [`2b008c9b1f`](https://github.com/novuhq/novu/commit/2b008c9b1fe947a3f2564eac862d0dccd1dedf36) | [novuhq/novu#12068](https://github.com/novuhq/novu/pull/12068) | `fix(api,dashboard)` — cap agent id length, avoid 414 |
| [`f31a13411d`](https://github.com/novuhq/novu/commit/f31a13411dd401993a2a1189506313c2e02d20ee) | [novuhq/novu#12019](https://github.com/novuhq/novu/pull/12019) | `docs` — fix platform spelling on the homepage |

## `$ ls ./recent`

<!-- auto:recent:start -->
| Project | Last push | Description |
| --- | --- | --- |
| [movieinsight](https://github.com/ANSHSINGH050404/movieinsight) | 2026-10-24 | MovieInsight — movie discovery, details, and recommendation insights. |
| [PathForge-guidance_for_freshers](https://github.com/ANSHSINGH050404/PathForge-guidance_for_freshers) | 2026-10-24 | PathForge — career and learning guidance for freshers entering tech. |
| [portfolio](https://github.com/ANSHSINGH050404/portfolio) | 2026-10-20 | Personal portfolio of ANSH SINGH — full-stack & agentic AI engineer (Next.js + TypeScript). |
| [Tracekit](https://github.com/ANSHSINGH050404/Tracekit) | 2026-10-20 | Record, inspect, and compare AI coding agent runs locally. No account, no database, no network calls. |
| [sheet2json](https://github.com/ANSHSINGH050404/sheet2json) | 2026-10-08 | Turn Google Sheets into JSON APIs and shareable live tables with a read-only data assistant. |
| [Virtual-Trader](https://github.com/ANSHSINGH050404/Virtual-Trader) | 2026-09-20 | Paper trading platform |
<!-- auto:recent:end -->

## `$ cat stack.txt`

TypeScript is 77% of the 15.1 MB of code across 207 owned repositories, and 138 of those repositories are TypeScript. Everything else below is what the projects above actually needed:

| area | what ships with it |
| --- | --- |
| product | Next.js 16 · React 19 · Tailwind · Radix / Base UI · Zustand · Shiki |
| backend | Hono · Express · WebSocket · BullMQ · Prisma · Drizzle |
| data | PostgreSQL · Neon · MongoDB · Redis · LibSQL |
| ai | Gemini · OpenAI · Anthropic · Vercel AI SDK · LangGraph · Stagehand |
| platform | Vercel · Docker · GitHub Actions · Trigger.dev · Liveblocks · Clerk · Sentry · OpenTelemetry |
| languages | TypeScript · JavaScript · Go · Python · Kotlin |

## `$ contact --all`

- **GitHub** — [github.com/ANSHSINGH050404](https://github.com/ANSHSINGH050404)
- **Portfolio** — [anshdev-tau.vercel.app](https://anshdev-tau.vercel.app)
- **X** — [@AnshSin18258375](https://x.com/AnshSin18258375)

Open to maintainer roles in developer tooling, and to open-source collaboration.
