# Local Setup

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | 18 or higher | Required |
| npm | 9 or higher | Bundled with Node.js |
| TypeScript | 5.x | Installed as devDependency |

## Clone and install

```bash
git clone https://github.com/abudhahir/diagram-exporter.git
cd diagram-exporter
npm install
```

## Build

Compiles TypeScript to `dist/` and marks the CLI binary as executable:

```bash
npm run build
```

Output:

```
dist/
  cli.js       ← executable CLI binary
  index.js     ← library entry point
  index.d.ts   ← TypeScript declarations
  ...
```

## Run tests

```bash
npm test
```

Runs all 99 tests using [vitest](https://vitest.dev/) in run (non-watch) mode.

```bash
npm run test:watch
```

Runs tests in watch mode — re-runs on file changes during development.

## Use the CLI during development (without installing globally)

```bash
npm run dev -- <input> -f <format>
```

This runs `src/cli.ts` directly via `tsx` (no build step needed):

```bash
npm run dev -- tests/fixtures/flowchart.gliffy -f mermaid
```

## Install the CLI globally from local source

Build first, then link:

```bash
npm run build
npm link
```

After linking, `dex` resolves to your local build:

```bash
dex --version
```

To unlink when done:

```bash
npm unlink -g @cleveloper/dex
```

## Project structure

```
src/
  ir/
    types.ts              ← Intermediate Representation types
  parser/
    gliffy-types.ts       ← Gliffy JSON TypeScript interfaces
    shape-map.ts          ← Gliffy shape UID → NodeShape mapping
    label-extractor.ts    ← HTML tag stripper for Gliffy labels
    parser.ts             ← Two-pass Gliffy JSON → IR parser
  detector/
    detector.ts           ← Shape-voting diagram type classifier
  emitters/
    helpers.ts            ← Shared sanitizeId / sanitizeLabel
    drawio.ts             ← IR → Draw.io XML emitter
    mermaid.ts            ← IR → Mermaid emitter
    plantuml.ts           ← IR → PlantUML emitter
  cli.ts                  ← dex CLI (commander.js)
  index.ts                ← Public library API

tests/
  fixtures/               ← .gliffy test fixture files
  parser/                 ← Parser unit tests
  detector/               ← Detector unit tests
  emitters/               ← Emitter unit tests
  ir/                     ← IR types tests
  snapshot.test.ts        ← Regression snapshots (fixture × format)
  index.test.ts           ← Public API tests
  cli.test.ts             ← CLI end-to-end tests

docs/
  plans/                  ← Design and implementation plans
  cli-usage.md
  library-usage.md
  local-setup.md  ← you are here
  publishing.md
  architecture.md
```

## Adding a new test fixture

1. Place the `.gliffy` file in `tests/fixtures/`
2. Add a new row to the snapshot test matrix in `tests/snapshot.test.ts`
3. Run `npm test -- --update-snapshots` to generate baseline snapshots
4. Commit both the fixture file and the updated `.snap` file

## Regenerating snapshots

If an emitter change intentionally alters output:

```bash
npm test -- --update-snapshots
```

Review the diff in `tests/__snapshots__/snapshot.test.ts.snap` before committing.
