#!/usr/bin/env node
/**
 * Generates the SVG assets for the profile README.
 *
 * Everything here is data-driven so the artwork can be adjusted without
 * hand-editing a few thousand lines of SVG. Run with:
 *
 *   node tools/build-assets.mjs
 *
 * Output:
 *   assets/boot.svg        animated boot header (the signature visual)
 *   assets/workstation.svg system profile panel
 *   assets/divider.svg     section rule
 *
 * GitHub strips inline <svg> from Markdown, so these are referenced with
 * <img>. A browser renders an SVG referenced that way as its own document,
 * which means the CSS animations below run while <script> never executes.
 */
import { writeFile, mkdir } from "node:fs/promises";

const OUT = new URL("../assets/", import.meta.url);
await mkdir(OUT, { recursive: true });

const C = {
	bg: "#0a0e13",
	surface: "#0f141b",
	line: "#1d2733",
	lineHi: "#2b3947",
	fg: "#e8eef4",
	dim: "#9fb0c0",
	mute: "#63758a",
	accent: "#4ee6a8",
	accentDim: "#246b4e",
};

const MONO = "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace";

const esc = (s) =>
	String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// A block font, drawn as pixels rather than glyphs. Each letter is seven
// rows of five cells; "." is empty and "#" is filled. Five rows is too coarse
// to read diagonals, so the set is seven tall.
const PIXEL_FONT = {
	A: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
	N: ["##..#", "##..#", "#.#.#", "#.#.#", "#..##", "#..##", "#..##"],
	S: [".####", "#....", "#....", ".###.", "....#", "....#", "####."],
	H: ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
	">": ["#....", "##...", "###..", "##...", "#....", ".....", "....."],
};

const escXml = (s) => esc(s);

function wordmark(word, { x, y, pixel = 15, gap = 2 }) {
	// Returns the filled pixel rectangles for a word, in reading order.
	const cell = pixel + gap;
	const rects = [];
	let cursor = x;
	let index = 0;
	for (const letter of word) {
		const rows = PIXEL_FONT[letter];
		rows.forEach((row, ry) => {
			[...row].forEach((ch, rx) => {
				if (ch !== "#") return;
				rects.push({
					x: cursor + rx * cell,
					y: y + ry * cell,
					size: pixel,
					letterIndex: index,
					order: index,
				});
			});
		});
		cursor += 5 * cell + gap;
		index += 1;
	}
	return rects;
}

function wordmarkWidth(word, { pixel = 15, gap = 2 }) {
	const cell = pixel + gap;
	return word.length * 5 * cell + (word.length - 1) * gap;
}
/* ------------------------------------------------------------------ boot */

function bootSvg() {
	const W = 1000;
	const H = 330;
	// "ANSH" in block pixels, then a mint caret so the lockup reads as a
	// shell prompt waiting for input.
	const word = "ANSH>";
	const px = 13;
	const gap = 2;
	const markX = 44;
	const markY = 66;
	const rects = wordmark(word, { x: markX, y: markY, pixel: px, gap });
	const caretLetter = 4; // the trailing ">"
	const markW = wordmarkWidth(word, { pixel: px, gap });

	// Boot log. Each entry is a prompt line and its output.
	const log = [
		["$ uname -o", "agentic-ai-engineer"],
		["$ cat ./focus", "ai agents · developer tooling · backend systems"],
		["$ gh pr list --author @me --state merged", "19 merged upstream · 21 open · 5 projects"],
		["$ ls ./shipped", "browseflow  voicevue  codeglow"],
	];

	const logX = 470;
	const logY = 80;
	const lineH = 24;
	const fs = 13.5;

	let logOut = "";
	let delay = 0.3;
	log.forEach(([prompt, output], i) => {
		const y = logY + i * lineH * 2;
		logOut += `    <text x="${logX}" y="${y}" class="lg" style="animation-delay:${delay}s" font-family="${MONO}" font-size="${fs}" fill="${C.accent}">${escXml(prompt)}</text>\n`;
		delay += 0.16;
		logOut += `    <text x="${logX}" y="${y + lineH}" class="lg" style="animation-delay:${delay}s" font-family="${MONO}" font-size="${fs}" fill="${C.dim}">${escXml(output)}</text>\n`;
		delay += 0.16;
	});
	const cursorX = logX;
	const cursorY = logY + log.length * lineH * 2 - 1;
	const cursorDelay = delay + 0.1;

	// Pixels: staggered assembly, one after another.
	const pixels = rects
		.map((r, i) => {
			const isAccent = r.letterIndex === caretLetter;
			const d = 0.35 + i * 0.014;
			return `    <rect x="${r.x}" y="${r.y}" width="${r.size}" height="${r.size}" rx="2" fill="${isAccent ? C.accent : C.fg}" class="px" style="animation-delay:${d.toFixed(3)}s"${isAccent ? ' filter="url(#glow)"' : ""}/>`;
		})
		.join("\n");

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Terminal boot sequence for ANSH SINGH, full-stack and agentic AI engineer. 19 merged pull requests upstream. Browseflow, VoiceVue and CodeGlow.">
  <title>ANSH SINGH — boot sequence</title>
  <defs>
    <clipPath id="panel"><rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="14"/></clipPath>
    <linearGradient id="scan" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${C.accent}" stop-opacity="0"/>
      <stop offset="50%" stop-color="${C.accent}" stop-opacity="0.07"/>
      <stop offset="100%" stop-color="${C.accent}" stop-opacity="0"/>
    </linearGradient>
    <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="5" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <style>
      .px { opacity: 0; animation: fade .34s cubic-bezier(.2,.8,.2,1) forwards; }
      .lg { opacity: 0; animation: fade .4s ease-out forwards; }
      .cur { animation: blink 1.05s steps(1,end) infinite; }
      .scan { animation: sweep 7s linear infinite; }
      .flick { animation: flicker 5s ease-in-out infinite; }
      @keyframes fade { from { opacity: 0 } to { opacity: 1 } }
      @keyframes blink { 0%,49% { opacity: 1 } 50%,100% { opacity: 0 } }
      @keyframes sweep { 0% { transform: translateY(-90px) } 100% { transform: translateY(${H + 40}px) } }
      @keyframes flicker { 0%,100% { opacity: 1 } 42% { opacity: 1 } 44% { opacity: .93 } 46% { opacity: 1 } 71% { opacity: 1 } 73% { opacity: .96 } 75% { opacity: 1 } }
      @media (prefers-reduced-motion: reduce) {
        .px, .lg { opacity: 1; animation: none; }
        .cur { opacity: 1; animation: none; }
        .scan, .flick { animation: none; }
      }
    </style>
  </defs>

  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="14" fill="${C.bg}" stroke="${C.line}"/>
  <g clip-path="url(#panel)">
    <rect x="0" y="0" width="${W}" height="36" fill="${C.surface}"/>
    <line x1="0" y1="36" x2="${W}" y2="36" stroke="${C.line}" stroke-width="1"/>
    <rect class="scan" x="0" y="0" width="${W}" height="90" fill="url(#scan)"/>
  </g>

  <circle cx="26" cy="18" r="5" fill="${C.lineHi}"/>
  <circle cx="44" cy="18" r="5" fill="${C.line}"/>
  <circle cx="62" cy="18" r="5" fill="${C.line}"/>
  <text x="88" y="23" font-family="${MONO}" font-size="12" fill="${C.mute}">ansh@workstation: ~/profile</text>

  <g class="flick">
${pixels}

    <line x1="${markX}" y1="208" x2="${markX + markW}" y2="208" stroke="${C.line}" stroke-width="1"/>
    <text x="${markX}" y="242" font-family="${MONO}" font-size="23" font-weight="700" letter-spacing="5.5" fill="${C.fg}">ANSH SINGH</text>
    <text x="${markX}" y="268" font-family="${MONO}" font-size="13" fill="${C.dim}">full-stack &amp; agentic ai engineer</text>
    <text x="${markX}" y="290" font-family="${MONO}" font-size="13" fill="${C.mute}">building tools for ai coding agents</text>

${logOut}  </g>

  <rect class="cur" x="${cursorX}" y="${cursorY - 12}" width="8" height="15" fill="${C.accent}"/>
</svg>
`;
}

/* ------------------------------------------------------------ workstation */

function workstationSvg() {
	const W = 1000;
	const H = 300;

	const cells = [
		["role", "Full-stack & agentic AI engineer"],
		["focus", "AI agents · developer tooling · backend systems"],
		["upstream", "19 merged PRs · 21 open · 5 projects"],
		["shipped", "Browseflow · VoiceVue · CodeGlow"],
		["languages", "TypeScript 77% · JavaScript · Go · Python · Kotlin"],
		["data", "PostgreSQL · Redis · MongoDB · LibSQL"],
		["runtime", "Next.js · React · Node · Bun · Hono · Express"],
		["platform", "Vercel · Docker · Trigger.dev · Liveblocks · Clerk"],
	];

	const colX = [40, 520];
	const rowY = [76, 132, 188, 244];
	const cellW = 440;
	const fs = 13.5;

	let body = "";
	cells.forEach(([label, value], i) => {
		const x = colX[i % 2];
		const y = rowY[Math.floor(i / 2)];
		body += `  <text x="${x}" y="${y}" font-family="${MONO}" font-size="10.5" letter-spacing="1.8" fill="${C.accent}">${label.toUpperCase()}</text>\n`;
		body += `  <text x="${x}" y="${y + 22}" font-family="${MONO}" font-size="${fs}" fill="${C.fg}">${escXml(value)}</text>\n`;
		body += `  <line x1="${x}" y1="${y + 34}" x2="${x + cellW}" y2="${y + 34}" stroke="${C.line}" stroke-width="1"/>\n`;
	});

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="System profile: full-stack and agentic AI engineer focused on AI agents, developer tooling and backend systems. 19 merged pull requests. TypeScript 77 percent. Next.js, React, PostgreSQL, Redis, Docker, Trigger.dev.">
  <title>System profile</title>
  <defs>
    <clipPath id="panel"><rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="14"/></clipPath>
  </defs>

  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="14" fill="${C.bg}" stroke="${C.line}"/>
  <g clip-path="url(#panel)">
    <rect x="0" y="0" width="${W}" height="36" fill="${C.surface}"/>
    <line x1="0" y1="36" x2="${W}" y2="36" stroke="${C.line}" stroke-width="1"/>
  </g>
  <circle cx="26" cy="18" r="5" fill="${C.lineHi}"/>
  <circle cx="44" cy="18" r="5" fill="${C.line}"/>
  <circle cx="62" cy="18" r="5" fill="${C.line}"/>
  <text x="88" y="23" font-family="${MONO}" font-size="12" fill="${C.mute}">ansh@workstation: ~/profile --system</text>

${body}</svg>
`;
}

/* --------------------------------------------------------------- divider */

function dividerSvg() {
	const W = 1200;
	const H = 26;
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="presentation">
  <defs>
    <linearGradient id="rule" x1="0" y1="0" x2="${W}" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${C.accent}" stop-opacity="0.55"/>
      <stop offset="22%" stop-color="${C.accent}" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="${C.accent}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect x="0" y="12" width="${W}" height="1" fill="url(#rule)"/>
  <rect x="0" y="9" width="7" height="7" rx="1" fill="${C.accent}" opacity="0.8"/>
</svg>
`;
}

const outputs = {
	"boot.svg": bootSvg(),
	"workstation.svg": workstationSvg(),
	"divider.svg": dividerSvg(),
};

for (const [name, body] of Object.entries(outputs)) {
	await writeFile(new URL(name, OUT), body, "utf8");
	console.log(`wrote assets/${name} (${body.length} bytes)`);
}
