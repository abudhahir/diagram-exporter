# Publishing to npm

## Prerequisites

- npm account at [npmjs.com](https://www.npmjs.com/)
- Logged in locally: `npm whoami` (if not: `npm login`)
- All tests passing: `npm test`
- Clean working tree: `git status`

## Pre-publish Checklist

1. **Update version** in `package.json` following [semver](https://semver.org/):

   | Change type | Version bump | Example |
   |---|---|---|
   | Bug fix | patch | `0.1.0` → `0.1.1` |
   | New feature (backwards compatible) | minor | `0.1.0` → `0.2.0` |
   | Breaking change | major | `0.1.0` → `1.0.0` |

2. **Run tests:**

   ```bash
   npm test
   ```

3. **Build:**

   ```bash
   npm run build
   ```

4. **Inspect what will be published:**

   ```bash
   npm pack --dry-run
   ```

   Confirm only `dist/`, `package.json`, and `README.md` are included. The `src/`, `tests/`, and `docs/` directories should **not** be published.

5. **Add a `.npmignore`** if needed to exclude non-essential files:

   ```
   src/
   tests/
   docs/
   .worktrees/
   tsconfig*.json
   vitest.config.ts
   ```

## Publishing

### First-time publish

```bash
npm publish --access public
```

> Use `--access public` for scoped packages (e.g. `@yourname/dex`). For unscoped packages it defaults to public.

### Subsequent releases

```bash
# Bump version (patch / minor / major)
npm version patch

# This automatically:
# - Updates version in package.json
# - Creates a git commit: "v0.1.1"
# - Creates a git tag: "v0.1.1"

# Build and publish
npm run build && npm publish

# Push commit and tag to remote
git push && git push --tags
```

## Verify the Published Package

After publishing, verify the package is live:

```bash
npm info dex
```

Test install in a separate directory:

```bash
mkdir /tmp/dex-test && cd /tmp/dex-test
npm init -y
npm install dex
npx dex --version
```

## Scoped Packages (Optional)

To publish under an npm username or org scope (e.g. `@abudhahir/dex`):

1. Update `package.json`:

   ```json
   {
     "name": "@abudhahir/dex"
   }
   ```

2. Update the `bin` reference if changed, then publish:

   ```bash
   npm publish --access public
   ```

## Unpublishing / Deprecating

To deprecate a version (preferred over unpublishing):

```bash
npm deprecate dex@0.1.0 "Use 0.2.0 instead"
```

To unpublish within 72 hours of publish (npm policy):

```bash
npm unpublish dex@0.1.0
```
