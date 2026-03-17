# Publishing to npm

This document covers how to publish `@cleveloper/dex` to the npm registry.

## Prerequisites

1. An npm account at [npmjs.com](https://www.npmjs.com/)
2. Access to the `@cleveloper` npm organisation (or ability to create it)
3. Logged in via the npm CLI:
   ```bash
   npm login
   ```

## First-time: create the npm organisation

If `@cleveloper` does not yet exist on npm:

1. Go to [npmjs.com/org/create](https://www.npmjs.com/org/create)
2. Create organisation `cleveloper`
3. Ensure the account used for publishing is a member with publish rights

## Pre-publish checklist

Before every publish, verify the following:

- [ ] All tests pass: `npm test`
- [ ] Build is clean: `npm run build`
- [ ] `package.json` version has been bumped (see versioning below)
- [ ] `CHANGELOG` or release notes updated (if maintained)
- [ ] No sensitive files in the package (check `files` field or `.npmignore`)

## Limit published files

Add a `files` field to `package.json` to include only what consumers need:

```json
"files": [
  "dist/",
  "README.md"
]
```

This excludes `src/`, `tests/`, `docs/`, and config files from the published tarball. Verify what will be published without actually publishing:

```bash
npm pack --dry-run
```

## Versioning

`dex` follows [Semantic Versioning](https://semver.org/):

| Change | Version bump | Command |
|---|---|---|
| Backwards-compatible bug fixes | patch | `npm version patch` |
| New backwards-compatible features | minor | `npm version minor` |
| Breaking API changes | major | `npm version major` |

These commands update `package.json`, create a git commit, and tag the release.

## Publish

**First publish (public scoped package):**

```bash
npm publish --access public
```

The `--access public` flag is required for scoped packages on the first publish. Subsequent publishes do not need it (npm remembers the access level).

**Subsequent publishes:**

```bash
npm version patch   # or minor / major
npm publish
```

**Push the version tag to GitHub:**

```bash
git push origin main --tags
```

## Verify the published package

After publishing, confirm it is available on the registry:

```bash
npm info @cleveloper/dex
```

Test a clean install:

```bash
npm install -g @cleveloper/dex
dex --version
```

## Unpublish / deprecate

Unpublishing is only allowed within 72 hours of publish and only if no other package depends on it. Prefer deprecation instead:

```bash
npm deprecate @cleveloper/dex@"<1.0.0" "Use 1.0.0 or later"
```

## Automated publishing (optional)

To publish automatically on GitHub tag push, create `.github/workflows/publish.yml`:

```yaml
name: Publish to npm

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm test
      - run: npm run build
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Store your npm token as a GitHub Actions secret named `NPM_TOKEN`.
