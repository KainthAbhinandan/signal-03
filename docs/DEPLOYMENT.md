# Free hosting on Cloudflare Pages

This project is a static Vite application. Cloudflare Pages publishes the contents of `dist/`; there is no server, database, player login, API key or paid add-on required. All runtime JavaScript, CSS and the favicon are local build output. Symbols and audio are generated in the browser; fonts use the operating system.

## Deployment status

Prepared locally on 29 October 2026. No authenticated Cloudflare connector, Wrangler login or Cloudflare token was found in the available environment. This project also has no Git remote. No public deployment or public URL is claimed. Complete the following owner-account setup to publish; players will not need either a GitHub or Cloudflare account.

## 1. Verify the production build

Use Node from `.node-version` (24.14.0) and npm. From the `signal-03` directory:

```sh
npm ci
npm run verify
npm run preview
```

`verify` runs strict type checking, all unit tests, and `npm run build`. Open `http://127.0.0.1:4173`, play a spin, change sound settings, reset credits, and inspect desktop/mobile layouts. Check the bottom-right version against `node -p "require('./package.json').version"`. The production site must have no development preview controls or debug getter.

Do not upload source files or `node_modules` as the site. The output is `dist/`. Keep `package-lock.json` committed so builds resolve the pinned dependency graph. Build dependencies must be installed too; do not set `NPM_CONFIG_PRODUCTION=true` or omit dev dependencies for the build.

## 2. Put the project on GitHub

Create an empty GitHub repository, for example `signal-03`, in an account you control. Either public or private is supported; the game can be public independently of the source repository. Do not initialize that repository with extra files when following the commands below.

Run these commands **inside the local `signal-03` folder**, not in its parent ChatGPT project mirror. Replace `YOUR_GITHUB_USERNAME` and the repository name with your actual values:

```sh
git init -b main
git add .
git commit -m "chore: prepare SIGNAL 03 portfolio preview"
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/signal-03.git
git push -u origin main
```

These instructions assume a new repository. If you already imported the project into Git, use its existing remote and production branch. `.gitignore` excludes `node_modules/` and `dist/`; Cloudflare rebuilds from the tracked source. Include `.node-version`, package.json, package-lock.json, Vite/TypeScript configuration, index.html, src/ and public/.

## 3. Connect GitHub to Cloudflare Pages Free

1. Sign in to your Cloudflare account and use the **Free** plan. A paid domain is optional; the supplied `pages.dev` address is sufficient.
2. Open **Workers & Pages → Create application → Pages → Connect to Git**. Choose the Pages Git integration rather than the Worker creation flow.
3. Select GitHub. Install/authorize Cloudflare's GitHub application for the repository you intend to deploy. Select that repository and begin setup.
4. Choose an available project name and production branch `main` (or the actual branch you use).
5. Set **Framework preset: None**. Enter **Build command: `npm run build`** and **Build output directory: `dist`** explicitly. Do not leave the command empty and do not use a Worker deploy command.
6. Set the root directory for your repository layout. If the repository contains package.json directly, leave the root directory blank. If the repository contains a `signal-03/` subfolder with package.json inside it, set **Root directory: `signal-03`**. The `dist` output is relative to this selected root.
7. Use the current Pages build image. The committed `.node-version` selects the verified Node release. Remove any conflicting `NODE_VERSION` override, or set that override to match the file. No game environment variables, secrets, API keys or bindings are needed.
8. Select **Save and Deploy**. Inspect the build log: dependency installation and `npm run build` must finish successfully. Cloudflare will show the actual public HTTPS address on completion; copy it from the dashboard.

The setup follows Cloudflare's [Git integration guide](https://developers.cloudflare.com/pages/get-started/git-integration/) and [build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/). Node selection is documented under [build image overrides](https://developers.cloudflare.com/pages/configuration/build-image/). No Cloudflare Vite plugin, Wrangler configuration or Pages Functions are needed for this static app.

## 4. Verify the actual public URL

The address will resemble `https://YOUR-PAGES-PROJECT.pages.dev/`; that is a placeholder, not a deployed URL from this task.

1. Open the real dashboard-provided URL in a signed-out/private browser window. The machine and SPIN must appear without player authentication or a key prompt. Leave Cloudflare Access protection off for the public production game.
2. Scroll to the footer and compare its version to the package.json in the deployed Git commit. Check its accessible label, `Game version` followed by that version. Include the footer in release screenshots.
3. Play one spin; rapid presses must not overlap. Confirm a text result appears, credits settle, and reset works when idle. Activate mute/volume and make sure audio failure cannot block play.
4. Check desktop, 390px and 320px portrait widths. The version must remain visible at the bottom-right, with no horizontal overflow or overlap with audio/Field notes controls. Check keyboard focus and the OS reduced-motion setting.
5. Reload the page and inspect the browser console/network panel. HTML, hashed JS/CSS and favicon should load successfully from this deployment origin. No runtime API or third-party asset request should be required. Production must contain no forced-result panel or `window.__signalDebug`.
6. Record the public URL, deployed Git commit, package version, date and checks in the release notes. Only then describe the public deployment as verified.

## Free-tier scope

Cloudflare documents free, unlimited **static asset requests**; this build does not invoke Functions. See [Pages pricing](https://developers.cloudflare.com/pages/functions/pricing/). Current Free-plan limits include 500 builds per month, one concurrent build, 20,000 files per site and 25 MiB per file; see [Pages limits](https://developers.cloudflare.com/pages/platform/limits/). This small static build fits that model. Those published limits can change, so check the linked pages before release. Paid plans, custom-domain purchases and paid integrations are unnecessary here.

## Updates, versioning and rollback

package.json is the single source of truth for the game's version. Vite reads it in vite.config.ts and replaces `__GAME_VERSION__` at build time. The footer's visible value and accessible label use the same constant. No version environment variable or separate hard-coded UI string exists. package-lock.json mirrors package metadata and is updated by npm.

For fixes and small polish, use `npm version patch --no-git-tag-version`. For an added feature, use `npm version minor --no-git-tag-version`. Use `npm version 1.0.0 --no-git-tag-version` when the first complete portfolio release is ready. Update CHANGELOG.md with a short dated entry, run `npm run verify`, commit the package files and changes, then push the production branch. Git integration rebuilds and publishes that commit. A package change alone cannot update an already built site; it needs a new build and deployment.

Tag the verified release commit in Git if useful for matching reports to code. Do not edit version strings manually in the footer or reuse a published version for different source. Cloudflare branch previews are useful for reviewing the next change before publishing it. If a release breaks, use Pages' deployment rollback to the previous successful production deployment; the old built footer version is restored with that code. Fix the issue in a new patch release.

## Player bug reports

Keep reports reproducible without accounts or telemetry. Ask players to copy the footer label and supply:

```text
Game version: [copy from bottom-right footer]
Page URL:
Date/time and timezone:
Browser/version and device:
Steps to reproduce:
Expected behavior:
Actual behavior (include settled symbols/credits if relevant):
Screenshot: [full page with footer version visible, or a second footer screenshot]
```

For a cropped reel screenshot, include the footer version separately. Screenshots from before version labeling are historical and cannot identify a release; new release captures should include the label. No automated player data collection is added.

## Troubleshooting

- **package.json not found / no dist:** correct the root directory and use the exact build settings above.
- **Node/engine error:** confirm `.node-version` is committed in the chosen root and no older dashboard override wins. The browser verification development dependency also requires Node 24.
- **Build succeeds, blank site:** serve `dist`, inspect script responses/console, and confirm Vite's relative base is retained. Do not open the HTML with a file URL.
- **Old footer version:** check the production branch and deployed commit, wait for the new deployment to succeed, then hard-refresh. This project installs no service worker. Rolled-back deployments correctly show their older version.
- **Graphics unavailable:** use a WebGL-capable browser/device and the built-in reload recovery UI. This is separate from Cloudflare deployment configuration.
