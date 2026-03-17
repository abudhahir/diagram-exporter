# dex — Gliffy Diagram Exporter

Convert [Gliffy](https://www.gliffy.com/) `.gliffy` diagram files to **Draw.io XML**, **Mermaid**, or **PlantUML**.

Available as both a **CLI tool** and a **TypeScript/Node.js library**.

---

## Supported Conversions

| Input | Output Formats |
|---|---|
| `.gliffy` file or raw Gliffy JSON | Draw.io XML, Mermaid, PlantUML |

**Diagram types detected automatically:**

| Type | Detection |
|---|---|
| Flowchart | Default; process, decision, terminal, document shapes |
| Sequence diagram | Lifeline, activation, actor shapes |
| Class diagram | Class box, interface box, enum box shapes |

---

## Installation

### As a CLI tool

```bash
npm install -g dex
```

### As a library

```bash
npm install dex
```

---

## Getting Started

### CLI

```bash
# Convert to Mermaid
dex diagram.gliffy -f mermaid

# Convert to Draw.io XML and save to file
dex diagram.gliffy -f drawio -o diagram.xml

# Convert to PlantUML
dex diagram.gliffy -f plantuml -o diagram.puml

# Read from stdin
cat diagram.gliffy | dex - -f mermaid

# Override auto-detected diagram type
dex diagram.gliffy -f mermaid -t SEQUENCE
```

**CLI reference:**

```
dex <input> [options]

Arguments:
  input                   Path to .gliffy file, or - to read from stdin

Options:
  -f, --format <format>   Output format: drawio | mermaid | plantuml  (required)
  -o, --output <file>     Write output to file instead of stdout
  -t, --type <type>       Override diagram type: FLOWCHART | SEQUENCE | CLASS_DIAGRAM
  -h, --help              Show help
  -V, --version           Show version
```

---

### Library

```typescript
import { convert, DiagramType } from 'dex'
import * as fs from 'fs'

const rawJson = fs.readFileSync('diagram.gliffy', 'utf-8')

// Auto-detect diagram type
const result = convert(rawJson, 'mermaid')
console.log(result.output)
console.log(result.detectedType) // e.g. DiagramType.FLOWCHART

// Override diagram type
const result2 = convert(rawJson, 'drawio', {
  diagramType: DiagramType.SEQUENCE,
})
```

**API:**

```typescript
convert(
  input: string,              // Raw Gliffy JSON string
  format: 'drawio' | 'mermaid' | 'plantuml',
  options?: {
    diagramType?: DiagramType // Override auto-detection
  }
): {
  output: string              // Converted diagram text or XML
  format: OutputFormat
  detectedType: DiagramType
  warnings: string[]
}
```

> The library accepts **raw JSON strings only** — no filesystem access. File reading is the caller's responsibility. This keeps the library browser-compatible.

---

## Development

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
git clone https://github.com/abudhahir/diagram-exporter.git
cd diagram-exporter
npm install
```

### Run tests

```bash
npm test
```

### Run in watch mode

```bash
npm run test:watch
```

### Build

```bash
npm run build
# Output: dist/
```

### Run CLI locally (without building)

```bash
npm run dev -- diagram.gliffy -f mermaid
```

---

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
```

---

## Architecture

The conversion pipeline has three stages:

```
Input (.gliffy file or JSON string)
  ↓
Parser         — Gliffy JSON → Intermediate Representation (IR)
  ↓
Detector       — Classifies diagram type by shape voting
  ↓
Emitter        — IR → Draw.io XML / Mermaid / PlantUML
```

The IR is fully decoupled from Gliffy internals. No Gliffy-specific UIDs, px/py constraints, or controlPath values leak past the parser layer.

---

## License

MIT
