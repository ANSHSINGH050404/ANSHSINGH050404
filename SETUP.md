# Profile README setup

This repo renders the [GitHub profile README](https://github.com/ANSHSINGH050404).

## Structure

| Path | Purpose |
| --- | --- |
| `README.md` | The profile page. Two regions are machine-generated. |
| `assets/` | Banner, divider, and project icons (hand-authored SVG). |
| `.github/scripts/update-readme.mjs` | Regenerates the marked regions from the GitHub API. |
| `.github/workflows/update-readme.yml` | Runs the generator daily and commits any change. |
| `.github/workflows/snake.yml` | Regenerates the contribution snake into `output`. |

Never edit the content between `<!-- auto:open-source:start -->` and
`<!-- auto:open-source:end -->`, or between `<!-- auto:recent:start -->` and
`<!-- auto:recent:end -->`. The generator overwrites it.

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
