# Profile README setup

This repo renders the [GitHub profile README](https://github.com/ANSHSINGH050404).

## Structure

| Path | Purpose |
| --- | --- |
| `README.md` | The profile page. Two regions are machine-generated. |
| `assets/boot.svg` | Animated boot header — the signature visual. Generated. |
| `assets/workstation.svg` | System profile panel. Generated. |
| `assets/divider.svg` | Section rule. Generated. |
| `assets/tracekit-demo.gif` | Real recorded agent run. Built by `tools/render_demo_gif.py`. |
| `tools/build-assets.mjs` | Regenerates the three generated SVGs. |
| `tools/validate-assets.py` | Checks the SVGs parse, resolve their own refs, and stay in the viewBox. |
| `.github/scripts/update-readme.mjs` | Regenerates the marked README regions from the GitHub API. |
| `.github/workflows/update-readme.yml` | Runs that generator daily and commits any change. |
| `.github/workflows/snake.yml` | Regenerates the contribution snake into `output`. |

Never edit the content between `<!-- auto:open-source:start -->` and
`<!-- auto:open-source:end -->`, or between `<!-- auto:recent:start -->` and
`<!-- auto:recent:end -->`. The generator overwrites it.

## Regenerating the artwork

```bash
node tools/build-assets.mjs
python tools/validate-assets.py
```

`build-assets.mjs` holds the palette, the pixel block font and the panel
content as data, so the artwork is edited as code rather than as raw SVG.

## How the artwork renders on GitHub

GitHub strips inline `<svg>` out of Markdown, so every asset is referenced with
`<img>` pointing at `raw.githubusercontent.com`. A browser treats such a file as
its own document, which means the CSS animations inside `boot.svg` run, while
`<script>` never executes. The animations use a `prefers-reduced-motion`
media query, so they stop for readers who ask for that.

Each panel draws its own surface rather than relying on the page background,
so it reads the same on the light and the dark GitHub theme.

The page is designed so that every fact shown inside an SVG is also written
out in Markdown. The panels are wide and shrink on a phone, so the text below
them is what stays readable on a small screen.

## Counts cover public work only

The generator counts pull requests and issues in public repositories. A token
with `repo` scope also sees pull requests in private repositories — those are
filtered out, so the published numbers match what a visitor can verify.

That also means **no personal access token is needed**. The workflow's built-in
`GITHUB_TOKEN` cannot see private repositories at all, so both paths agree.

The generator refuses to publish a count that drops by more than 10% from the
previous run, since that means the search API returned an incomplete result
set rather than that the work disappeared.

## Running the generator locally

```bash
node .github/scripts/update-readme.mjs
```

It needs a token in `PROFILE_TOKEN` or `GITHUB_TOKEN`. With neither set it
exits with an error rather than publishing numbers from an unauthenticated
search, which sees fewer results.
