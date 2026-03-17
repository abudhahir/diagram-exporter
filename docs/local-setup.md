# Local Setup

## Prerequisites

| Tool | Minimum version | Check |
|---|---|---|
| Node.js | 18.x | `node --version` |
| npm | 9.x | `npm --version` |
| Git | any | `git --version` |

## Clone and Install

```bash
git clone https://github.com/abudhahir/diagram-exporter.git
cd diagram-exporter
npm install
```

## Run Tests

```bash
# Run all tests once
npm test

# Run in watch mode (re-runs on file change)
npm run test:watch
```

Expected output:

```
 Test Files  11 passed (11)
      Tests  99 passed (99)
```

## Build

Compiles TypeScript to `dist/`:

```bash
npm run build
```

Output:

```
dist/
  index.js        # Library entry point
  index.d.ts      # Type declarations
  cli.js          # CLI entry point
  ...
```

## Run the CLI Locally (Without Building)

Use `tsx` to run the CLI directly from source:

```bash
npm run dev -- path/to/diagram.gliffy -f mermaid
```

This is equivalent to running the compiled `dex` command but reads directly from `src/`.

## Link the CLI Globally (for Testing)

To test the `dex` command as if it were installed globally:

```bash
npm run build
npm link
```

Then use it anywhere:

```bash
dex diagram.gliffy -f mermaid
```

To unlink when done:

```bash
npm unlink -g dex
```

## Update Snapshots

Snapshot tests lock the output of all 3 fixtures × 3 formats. If you change an emitter and the output changes intentionally, update the snapshots:

```bash
npx vitest run --update-snapshots
```

Review the diff before committing.

## Project Structure

```
src/
  ir/             # Intermediate Representation type definitions
  parser/         # Gliffy JSON → IR (shape map, label extractor, two-pass parser)
  detector/       # Diagram type inference from node shapes
  emitters/
    drawio.ts     # IR → Draw.io XML
    mermaid.ts    # IR → Mermaid
    plantuml.ts   # IR → PlantUML
    helpers.ts    # Shared ID/label sanitisation
  cli.ts          # CLI entry point (commander.js)
  index.ts        # Public library API

tests/
  fixtures/       # Sample .gliffy files (flowchart, sequence, class diagram)
  parser/
  detector/
  emitters/
  snapshot.test.ts  # Regression snapshots: 3 fixtures × 3 formats

docs/
  plans/          # Design documents and implementation plans
```

## Architecture Overview

See [architecture.md](./architecture.md) for a detailed breakdown of the conversion pipeline and IR model.
