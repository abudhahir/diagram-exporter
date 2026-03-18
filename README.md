# dex — Gliffy Diagram Exporter

Convert [Gliffy](https://www.gliffy.com/) `.gliffy` files to **Draw.io XML**, **Mermaid**, or **PlantUML**.

Available as a **CLI tool** and a **TypeScript/Node.js library**.

---

## CLI

**Install globally:**

```bash
npm install -g @cleveloper/dex
```

**Convert a diagram:**

```bash
dex diagram.gliffy -f mermaid
dex diagram.gliffy -f drawio -o diagram.drawio
dex diagram.gliffy -f plantuml
```

**Flags:**

| Flag | Description |
|---|---|
| `-f, --format` | **Required.** `drawio`, `mermaid`, or `plantuml` |
| `-o, --output` | Write to file instead of stdout |
| `-t, --type` | Override detection: `FLOWCHART`, `SEQUENCE`, `CLASS_DIAGRAM` |

---

## Library

**Install:**

```bash
npm install @cleveloper/dex
```

**Usage (TypeScript / Node.js):**

```typescript
import { readFileSync } from 'fs'
import { convert } from '@cleveloper/dex'

const raw = readFileSync('diagram.gliffy', 'utf-8')

const result = convert(raw, 'mermaid')
console.log(result.output)
// result.detectedType → DiagramType.FLOWCHART / SEQUENCE / CLASS_DIAGRAM
// result.warnings     → string[]
```

**Override diagram type detection:**

```typescript
import { convert, DiagramType } from '@cleveloper/dex'

const result = convert(raw, 'plantuml', {
  diagramType: DiagramType.SEQUENCE,
})
```

**All exported types:**

```typescript
import type { OutputFormat, ConvertOptions, ConvertResult, IRDiagram } from '@cleveloper/dex'
import { DiagramType } from '@cleveloper/dex'
```

> The library has no `fs` dependency — pass raw JSON strings directly. File reading is the caller's responsibility, keeping the library compatible with browser bundlers.

---

## Supported Formats

| Input | Output formats |
|---|---|
| `.gliffy` file or raw JSON string | Draw.io XML, Mermaid, PlantUML |

Diagram types auto-detected: **flowchart**, **sequence diagram**, **class diagram**.

---

## Documentation

Full guides are in the [`docs/`](docs/) directory (source repo):

| Guide | Description |
|---|---|
| [CLI Usage](docs/cli-usage.md) | All flags, piping, stdin examples |
| [Library Usage](docs/library-usage.md) | Full API reference |
| [Local Setup](docs/local-setup.md) | Dev environment, build, tests, `npm link` |
| [Publishing](docs/publishing.md) | npm release process and versioning |
| [Architecture](docs/architecture.md) | Pipeline, IR model, emitter design |

---

## License

MIT
