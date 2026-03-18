# Getting Started with `@cleveloper/dex`

This guide walks you through everything you need to start converting Gliffy diagrams using `dex` — from installing Node.js to running your first conversion.

---

## What is dex?

`dex` is a tool that reads Gliffy `.gliffy` diagram files and converts them into other formats:

- **Draw.io XML** — open in [diagrams.net](https://app.diagrams.net/) (also known as draw.io)
- **Mermaid** — paste directly into GitHub Markdown, Notion, or the [Mermaid Live Editor](https://mermaid.live/)
- **PlantUML** — render with the PlantUML CLI, a VS Code extension, or the [online server](https://www.plantuml.com/plantuml/uml/)

You can use `dex` in two ways:

- **As a CLI tool** — run it from your terminal to convert files directly, no programming required
- **As a Node.js/TypeScript library** — call it from your own code to automate conversions

---

## Prerequisites — What You Need Installed

`dex` runs on Node.js. Node.js is a runtime that lets you execute JavaScript outside of a browser — it also comes with `npm`, the package manager used to install `dex`.

**Required:** Node.js version 18 or higher.
Download page: [https://nodejs.org](https://nodejs.org)

### Verify your installation

Open a terminal and run:

```bash
node --version
```

```bash
npm --version
```

If both commands return version numbers (e.g. `v20.11.0` and `10.2.4`), you are ready to proceed.

### If Node.js is not installed

**Option 1 — Download the installer directly:**
Go to [https://nodejs.org](https://nodejs.org) and download the LTS (Long-Term Support) release. Run the installer and follow the prompts. The installer adds both `node` and `npm` to your PATH automatically.

**Option 2 — Use nvm (recommended if you manage multiple projects):**
`nvm` (Node Version Manager) lets you install and switch between Node.js versions without touching your system installation.

```bash
# Install nvm (macOS / Linux)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Restart your terminal, then install Node.js 20 LTS
nvm install 20
nvm use 20
```

Windows users can use [nvm-windows](https://github.com/coreybutler/nvm-windows) instead.

---

## Path A — Using as a CLI Tool

Use this path if you want to convert `.gliffy` files from your terminal without writing any code.

### Step 1: Install dex globally

The `-g` flag installs the package globally, which makes the `dex` command available in your terminal from any directory.

```bash
npm install -g @cleveloper/dex
```

### Step 2: Verify the installation

```bash
dex --version
```

This should print the installed version number (e.g. `0.1.0`). If you see `command not found`, close and reopen your terminal and try again — the PATH update sometimes requires a fresh shell session.

### Step 3: Convert your first file

Run a conversion and print the result to your terminal. The `-f` flag specifies the output format.

```bash
dex mydiagram.gliffy -f mermaid
```

The converted Mermaid diagram definition will be printed directly to stdout. This is useful for quickly previewing what the output looks like before deciding what to do with it.

Supported values for `-f` are: `mermaid`, `drawio`, `plantuml`.

### Step 4: Save the output to a file

Use `-o` to write the result to a file instead of printing it. This is the typical workflow when you want to keep the converted file.

```bash
dex mydiagram.gliffy -f drawio -o mydiagram.drawio
```

```bash
dex mydiagram.gliffy -f plantuml -o mydiagram.puml
```

### Step 5: What to do with the output

**Draw.io XML (`.drawio`):**
Open [https://app.diagrams.net/](https://app.diagrams.net/), then go to **File → Import from → Device** and select your `.drawio` file. The diagram will render immediately. You can also open the file directly in the diagrams.net desktop app.

**Mermaid:**
Paste the output into any Mermaid-compatible renderer:
- GitHub Markdown — wrap it in a fenced code block tagged `mermaid`
- [Mermaid Live Editor](https://mermaid.live/) — paste directly into the editor panel
- Notion — use the `/Mermaid` block

**PlantUML:**
The output includes `@startuml` and `@enduml` markers. Paste it into:
- The [PlantUML online server](https://www.plantuml.com/plantuml/uml/)
- The [PlantUML VS Code extension](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml)
- The PlantUML CLI: `java -jar plantuml.jar mydiagram.puml`

---

## Path B — Using as a Node.js/TypeScript Library

Use this path if you want to call `dex` from your own Node.js or TypeScript code — for example, to automate batch conversions or integrate diagram conversion into a build pipeline.

### Step 1: Create a new project folder and initialise it

```bash
mkdir my-project
cd my-project
npm init -y
```

`npm init -y` creates a `package.json` file with default values. This file tracks your project's dependencies. The `-y` flag skips the interactive prompts.

### Step 2: Install dex as a dependency

```bash
npm install @cleveloper/dex
```

This installs `@cleveloper/dex` locally into `node_modules/` and records it in `package.json`. Unlike the global install in Path A, this makes the library available only within this project.

### Step 3: Create a conversion script

Create a file called `convert.js` in your project folder with the following content:

```javascript
const { readFileSync } = require('fs')
const { convert } = require('@cleveloper/dex')

// Read the raw Gliffy file as a string
const raw = readFileSync('mydiagram.gliffy', 'utf-8')

// Convert to Mermaid format
const result = convert(raw, 'mermaid')

// Print the converted output
console.log(result.output)
```

The `convert` function accepts:
1. The raw `.gliffy` file content as a string
2. The target format: `'mermaid'`, `'drawio'`, or `'plantuml'`

It returns an object with:
- `result.output` — the converted diagram string
- `result.detectedType` — the diagram type that was detected or used
- `result.warnings` — an array of non-fatal issues (empty if everything is clean)

### Step 4: Run the script

Make sure `mydiagram.gliffy` is in the same folder, then:

```bash
node convert.js
```

The Mermaid diagram definition will print to your terminal. To save to a file, pipe the output:

```bash
node convert.js > mydiagram.mmd
```

Or modify the script to write the file directly:

```javascript
const { readFileSync, writeFileSync } = require('fs')
const { convert } = require('@cleveloper/dex')

const raw = readFileSync('mydiagram.gliffy', 'utf-8')
const result = convert(raw, 'drawio')

writeFileSync('mydiagram.drawio', result.output)
console.log('Conversion complete. Diagram type detected:', result.detectedType)
```

### Step 5: TypeScript example

If you are working in a TypeScript project, use `import` syntax. The package ships with type definitions, so you get full IDE autocompletion and type checking with no extra setup.

```typescript
import { readFileSync, writeFileSync } from 'fs'
import { convert, DiagramType } from '@cleveloper/dex'
import type { ConvertResult } from '@cleveloper/dex'

const raw: string = readFileSync('mydiagram.gliffy', 'utf-8')

const result: ConvertResult = convert(raw, 'mermaid')

console.log(result.output)
console.log(result.detectedType)  // e.g. DiagramType.FLOWCHART
console.log(result.warnings)      // [] if no issues
```

To override automatic diagram type detection (useful when `dex` misclassifies a diagram):

```typescript
import { convert, DiagramType } from '@cleveloper/dex'

const result = convert(raw, 'plantuml', {
  diagramType: DiagramType.SEQUENCE,
})
```

Available `DiagramType` values: `FLOWCHART`, `SEQUENCE`, `CLASS_DIAGRAM`, `UNKNOWN`.

---

## Where to Go Next

| Document | What it covers |
|---|---|
| [docs/cli-usage.md](./cli-usage.md) | All CLI flags, stdin piping, and format-specific examples |
| [docs/library-usage.md](./library-usage.md) | Full TypeScript API reference — all types, parameters, and return values |
| [docs/local-setup.md](./local-setup.md) | How to clone and run the project locally for contributing |
| [docs/publishing.md](./publishing.md) | How to build and publish the package to npm |
