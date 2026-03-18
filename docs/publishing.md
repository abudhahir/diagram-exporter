# Publishing `@cleveloper/dex` to npm

This guide walks through every step required to publish `@cleveloper/dex` to the npm registry, from creating an account to verifying the published package. It is written for developers who have never published an npm package before.

---

## 1. Create an npm account

Before you can publish anything to npm, you need a free account on the npm registry.

1. Go to [https://www.npmjs.com/signup](https://www.npmjs.com/signup)
2. Fill in your chosen **username**, **email address**, and **password**
3. Submit the form — npm will send a verification email to the address you provided
4. Open that email and click the verification link (check your spam folder if it does not arrive within a few minutes)

Your username is public and becomes part of the URL for any packages you publish. Choose something you are comfortable with being visible.

---

## 2. Create the @cleveloper organisation

A **scoped npm organisation** lets you group packages under a shared namespace, for example `@cleveloper/dex`. The `@cleveloper` prefix in the package name is that scope. To publish under it, the `cleveloper` organisation must exist on npm and your account must be a member.

1. Go to [https://www.npmjs.com/org/create](https://www.npmjs.com/org/create)
2. Enter `cleveloper` as the organisation name — this must match the scope in `package.json` exactly
3. Select the **Free** plan; it is sufficient for public packages
4. Complete the creation flow — your account is automatically added as an owner

If the organisation already exists, ask the current owner to add your account as a member with publish rights via the organisation settings on npmjs.com.

---

## 3. Log in to npm on your machine

Publishing requires your local npm CLI to be authenticated with your npm account. The commands `npm login` and `npm adduser` do the same thing — both start an interactive login session.

```bash
npm login
```

You will be prompted to fill in the following:

- **Username** — your npmjs.com username
- **Password** — your npmjs.com password
- **Email** — the email address registered to your npm account
- **One-time password** — if you have 2FA enabled on your account, open your authenticator app and enter the current OTP code when prompted

After completing the prompts, verify that authentication succeeded:

```bash
npm whoami
```

This command prints your npm username. If it prints your username, your machine is authenticated and ready to publish. If it prints nothing or returns an error, run `npm login` again.

---

## 4. Pre-publish checklist

Before publishing, confirm the following are true. Skipping these steps is a common source of publishing mistakes that are difficult to undo once a version is on the registry.

**All tests pass:**

```bash
npm test
```

**Build is clean and up to date** — the `dist/` directory must reflect the current source:

```bash
npm run build
```

**Check what will be included in the published package** — this is a dry run and does NOT publish anything:

```bash
npm pack --dry-run
```

Review the file list that is printed. You should see only files from `dist/` and `README.md`. If you see files from `src/`, `tests/`, or `docs/`, the `files` field in `package.json` is misconfigured. Only `dist/` and `README.md` should be shipped to consumers.

**Version is correct** — open `package.json` and confirm the `version` field reflects what you intend to publish. See the versioning section below before bumping.

---

## 5. Versioning

`@cleveloper/dex` follows [Semantic Versioning](https://semver.org/), written as `MAJOR.MINOR.PATCH`. Each number communicates the nature of the change to anyone depending on the package.

| Change type | Example | Command |
|---|---|---|
| Bug fix (no API changes) | 0.1.0 → 0.1.1 | `npm version patch` |
| New feature (no breaking changes) | 0.1.0 → 0.2.0 | `npm version minor` |
| Breaking API change | 0.1.0 → 1.0.0 | `npm version major` |

Running any of these commands does three things automatically:

1. Updates the `version` field in `package.json`
2. Creates a git commit recording the version bump
3. Creates a git tag (e.g. `v0.1.1`) pointing to that commit

This means you do not need to manually edit `package.json` or run `git tag` yourself.

---

## 6. First publish

The very first time you publish this package to npm, run:

```bash
npm publish --access public
```

The `--access public` flag is required on the first publish because `@cleveloper/dex` is a **scoped package**. npm treats scoped packages as private by default, which requires a paid plan. The `--access public` flag explicitly overrides this and makes the package publicly installable.

After the first publish, the `publishConfig.access=public` field in `package.json` handles this automatically, so you will not need to include the flag again on subsequent publishes.

---

## 7. Subsequent publishes

For every release after the first:

```bash
npm version patch    # or: npm version minor / npm version major
npm publish
git push origin main --tags
```

The `git push origin main --tags` step sends the version tag created by `npm version` to GitHub. This keeps the GitHub repository in sync with what is on the registry and makes it possible to trace any published version back to an exact commit.

---

## 8. Verify the publish

After publishing, confirm the package is live on the registry:

```bash
npm info @cleveloper/dex
```

This prints the package metadata as npm sees it, including the version, description, and dist-tags. You can also view the package page in a browser:

[https://www.npmjs.com/package/@cleveloper/dex](https://www.npmjs.com/package/@cleveloper/dex)

To confirm the package installs and runs correctly from the registry:

```bash
npm install -g @cleveloper/dex
dex --version
```

If `dex --version` prints the version number you just published, the release is complete.

---

## 9. Common errors and how to fix them

| Error | Cause | Fix |
|---|---|---|
| `ENEEDAUTH: need auth` | Not logged in | Run `npm login` then `npm whoami` to confirm authentication |
| `403 Forbidden` on publish | Wrong org, or account is not a member with publish rights | Check `npm whoami` matches a member of the `@cleveloper` org on npmjs.com |
| `E402 Payment Required` | Attempting to publish a scoped package without marking it public | Add `--access public` to the publish command, or add `"publishConfig": { "access": "public" }` to `package.json` |
| `E409 Conflict / cannot publish over existing version` | That version number already exists on the registry | Bump the version first with `npm version patch` (or `minor`/`major`) |
| `npm whoami` returns nothing or an error | Login session has expired | Run `npm login` again |

**A note on Two-Factor Authentication:** If you have 2FA enabled on your npm account, you will be prompted for an OTP code both when logging in and when running `npm publish`. This is expected behaviour. Open your authenticator app and enter the code shown at the time of the prompt. Enabling 2FA on your npm account is strongly recommended as it prevents unauthorised publishes even if your password is compromised.

---

## 10. Automated publishing with GitHub Actions (optional)

To publish automatically whenever a version tag is pushed to GitHub, create the following workflow file at `.github/workflows/publish.yml`:

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

This workflow triggers on any tag matching `v*` (e.g. `v0.1.1`). It installs dependencies, runs tests, builds the project, and publishes to npm using an automation token.

To set up the token:

1. Go to [https://www.npmjs.com/settings/tokens](https://www.npmjs.com/settings/tokens) and generate a new **Automation** token (automation tokens bypass 2FA prompts, which is required for CI environments)
2. In your GitHub repository, go to **Settings → Secrets and variables → Actions**
3. Create a new secret named `NPM_TOKEN` and paste the token value

With this in place, running `npm version patch && git push origin main --tags` locally is all that is needed to trigger a full publish pipeline.
