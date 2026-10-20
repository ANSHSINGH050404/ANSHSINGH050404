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

## Optional: exact counts with a personal access token

The generator works without any setup — the workflow's built-in `GITHUB_TOKEN`
is enough to read public data.

That token and a personal access token resolve GitHub's search index
differently, though: the same query reported 175 pull requests with a PAT and
168 with the Actions token. The generator publishes the higher of the two
values, so it never shrinks the numbers on its own. To get exact counts:

1. Create a fine-grained token at <https://github.com/settings/personal-access-tokens/new>
   with **read-only** access to public repositories.
2. Store it as an Actions secret:

   ```bash
   gh secret set PROFILE_TOKEN --repo ANSHSINGH050404/ANSHSINGH050404
   ```

No scopes beyond public read access are needed — the profile repo is public.

## Running the generator locally

```bash
node .github/scripts/update-readme.mjs
```

It needs a token in `PROFILE_TOKEN` or `GITHUB_TOKEN`. With neither set it
exits with an error rather than publishing stale-index numbers.
