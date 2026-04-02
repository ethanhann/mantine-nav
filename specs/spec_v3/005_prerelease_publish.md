# Spec v3 005: Pre-release Publishing Pipeline -- GitHub Actions Automation

## Category
Infrastructure

## Status
Draft

## Summary
Create a GitHub Actions workflow that automates pre-release publishing of
`@ethanhann/mantine-nav` to GitHub Packages. Define versioning strategy, release
triggers, and consumer setup documentation.

## Motivation
The v2 retrospective identified "Publish first pre-release to GitHub Packages"
as a next step. The package is configured for GitHub Packages (`publishConfig`
in `package.json`) but no version has been published. Automated publishing
ensures consistent, reproducible releases and enables consumers to start
integrating early.

## Versioning Strategy

### Pre-release Tags

Follow semver pre-release conventions:

```
0.2.0-beta.1   # First beta
0.2.0-beta.2   # Bug fix in beta
0.2.0-rc.1     # Release candidate
0.2.0           # Stable release
```

### Version Bumping

Use npm's built-in version commands:

```bash
# Patch pre-release bump (0.2.0-beta.1 -> 0.2.0-beta.2)
npm version prerelease --preid=beta

# Minor pre-release (0.1.0 -> 0.2.0-beta.1)
npm version preminor --preid=beta

# Promote to stable (0.2.0-beta.3 -> 0.2.0)
npm version minor
```

### When to Publish

| Trigger | Version Type | Tag |
|---------|-------------|-----|
| Push to `main` | `beta` pre-release | `beta` |
| Manual workflow dispatch | Configurable | Configurable |
| Git tag `v*` | Stable release | `latest` |

## GitHub Actions Workflow

### Pre-release on Main Push

```yaml
# .github/workflows/publish-prerelease.yml
name: Publish Pre-release

on:
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'package.json'

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      packages: write

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: 'https://npm.pkg.github.com'
          cache: 'npm'

      - run: npm ci

      - name: Run tests
        run: npm run test:run

      - name: Build
        run: npm run build

      - name: Build Storybook
        run: npx storybook build

      - name: Bump pre-release version
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          npm version prerelease --preid=beta --no-git-tag-version
          VERSION=$(node -p "require('./package.json').version")
          echo "VERSION=$VERSION" >> $GITHUB_ENV

      - name: Publish to GitHub Packages
        run: npm publish --tag beta
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Commit version bump
        run: |
          git add package.json package-lock.json
          git commit -m "chore: bump version to ${{ env.VERSION }}"
          git push
```

### Stable Release on Tag

```yaml
# .github/workflows/publish-stable.yml
name: Publish Stable Release

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      packages: write

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: 'https://npm.pkg.github.com'
          cache: 'npm'

      - run: npm ci
      - run: npm run test:run
      - run: npm run build

      - name: Publish to GitHub Packages
        run: npm publish --tag latest
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          generate_release_notes: true
```

### Manual Dispatch

```yaml
# .github/workflows/publish-manual.yml
name: Publish (Manual)

on:
  workflow_dispatch:
    inputs:
      version_type:
        description: 'Version bump type'
        required: true
        type: choice
        options:
          - prerelease
          - prepatch
          - preminor
          - patch
          - minor
      preid:
        description: 'Pre-release identifier (beta, rc, alpha)'
        required: false
        default: 'beta'
      tag:
        description: 'npm dist-tag'
        required: false
        default: 'beta'

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      packages: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: 'https://npm.pkg.github.com'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:run
      - run: npm run build
      - run: npm version ${{ inputs.version_type }} --preid=${{ inputs.preid }} --no-git-tag-version
      - run: npm publish --tag ${{ inputs.tag }}
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Consumer Setup

### .npmrc Configuration

Consumers need to configure their `.npmrc` to resolve `@ethanhann` packages
from GitHub Packages:

```ini
# .npmrc
@ethanhann:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

### Installation

```bash
# Install latest beta
npm install @ethanhann/mantine-nav@beta

# Install specific version
npm install @ethanhann/mantine-nav@0.2.0-beta.1

# Install stable (when available)
npm install @ethanhann/mantine-nav
```

## Build Verification Checklist

Before any publish, the workflow must pass:

1. `npm run test:run` -- All unit + integration tests
2. `npm run build` -- Vite library build (ESM + CJS)
3. `npx storybook build` -- Storybook compiles
4. Package contents check -- `npm pack --dry-run` lists expected files

## Package Contents

Verify the published package includes only necessary files:

```
dist/
  index.js          # ESM
  index.cjs         # CJS
  index.d.ts        # TypeScript declarations
  style.css         # Bundled styles (if any)
README.md
package.json
LICENSE
```

Files excluded (via `.npmignore`):

```
src/
stories/
specs/spec_v2/
specs/spec_v3/
.storybook/
*.test.*
__integration__/
```

## Dependencies
- **Spec v3 001** -- CSS consolidation (publish the finalized styles)
- **Spec v3 004** -- Visual regression (CI should include Chromatic before publish)
- Existing `package.json` `publishConfig` for GitHub Packages

## Testing Criteria
- [ ] Pre-release workflow triggers on push to `main`
- [ ] Version is bumped automatically with `beta` preid
- [ ] Package publishes to GitHub Packages successfully
- [ ] Consumer can install via `npm install @ethanhann/mantine-nav@beta`
- [ ] Consumer can import and use components after install
- [ ] Manual dispatch workflow works with all version type options
- [ ] Stable release workflow triggers on `v*` tag
- [ ] GitHub Release is created with auto-generated notes
- [ ] `npm pack --dry-run` shows only expected files
- [ ] CI fails and blocks publish if tests fail

## Open Questions
- Should we use Changesets (`@changesets/cli`) for more structured versioning
  and changelogs, or is npm version sufficient for a single-package repo?
- Should the pre-release auto-publish on every `main` push, or only on manual
  dispatch? Auto-publish is simpler but could produce many versions.
- Do we need a separate npm dist-tag for release candidates (`rc`) vs betas?
