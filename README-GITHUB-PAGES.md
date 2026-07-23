# Drone Policy Comparator - GitHub Pages

This package adds a public static build path for GitHub Pages. It does not use
ChatGPT Sites authentication, workspace access control, or the ChatGPT-hosted
site URL.

## Recommended Setup

1. Create a GitHub repository and upload this source package.
2. In GitHub, open `Settings` > `Pages`.
3. Set `Source` to `GitHub Actions`.
4. Push to the `main` branch, or run the `Deploy GitHub Pages` workflow manually.

The workflow builds the static site into `github-pages-dist` and publishes it to
GitHub Pages.

## Custom Domain

For a custom domain such as `www.drone-x.org`, keep this line in
`.github/workflows/deploy-github-pages.yml`:

```sh
GITHUB_PAGES_BASE=/ npm run build:github-pages
```

Then set the custom domain in `Settings` > `Pages` and configure the DNS record
at your domain provider.

This package already includes `github-pages/CNAME` with:

```text
www.drone-x.org
```

If you use a different domain later, change that file before deploying.

## Local Build

```sh
npm ci
GITHUB_PAGES_BASE=/ npm run build:github-pages
```

The static files will be created in `github-pages-dist`.

## Notes

- The existing ChatGPT Sites build remains available as `npm run build`.
- The public GitHub Pages build uses `npm run build:github-pages`.
- The public build entry is `github-pages/main.tsx`, which renders
  `app/page.tsx` directly as a static React page.
