# Library Usage

`@cleveloper/dex` is available as a Node.js/TypeScript library with a single entry-point function.

## Installation

```bash
npm install @cleveloper/dex
```

## API

### `convert(input, format, options?)`

```typescript
import { convert } from '@cleveloper/dex'

const result = convert(input, format, options)
```

#### Parameters

| Parameter | Type | Description |
|---|---|---|
| `input` | `string` | Raw Gliffy JSON string (file reading is the caller's responsibility) |
| `format` | `'drawio' \| 'mermaid' \| 'plantuml'` | Target output format |
| `options` | `ConvertOptions` (optional) | Conversion options (see below) |

#### `ConvertOptions`

| Property | Type | Description |
|---|---|---|
| `diagramType` | `DiagramType` (optional) | Override automatic diagram type detection |

#### `ConvertResult`

| Property | Type | Description |
|---|---|---|
| `output` | `string` | Converted diagram string in the requested format |
| `format` | `OutputFormat` | The format used |
| `detectedType` | `DiagramType` | Diagram type that was used (detected or overridden) |
| `warnings` | `string[]` | Non-fatal issues encountered during conversion |

### `DiagramType` enum

```typescript
import { DiagramType } from '@cleveloper/dex'

DiagramType.FLOWCHART     // flowchart / general diagram
DiagramType.SEQUENCE      // sequence / interaction diagram
DiagramType.CLASS_DIAGRAM // UML class diagram
DiagramType.UNKNOWN       // unclassified
```

## Examples

### Basic conversion

```typescript
import { readFileSync } from 'fs'
import { convert } from '@cleveloper/dex'

const raw = readFileSync('diagram.gliffy', 'utf-8')
const result = convert(raw, 'mermaid')
console.log(result.output)
```

### Convert to Draw.io XML

```typescript
import { readFileSync, writeFileSync } from 'fs'
import { convert } from '@cleveloper/dex'

const raw = readFileSync('diagram.gliffy', 'utf-8')
const result = convert(raw, 'drawio')
writeFileSync('diagram.drawio', result.output)
```

### Override diagram type detection

```typescript
import { convert, DiagramType } from '@cleveloper/dex'

const result = convert(raw, 'plantuml', {
  diagramType: DiagramType.SEQUENCE,
})
```

### Inspect result metadata

```typescript
const result = convert(raw, 'mermaid')

console.log(result.detectedType)  // e.g. DiagramType.FLOWCHART
console.log(result.warnings)      // [] if no issues
```

## TypeScript types

All public types are exported from the package root:

```typescript
import type {
  OutputFormat,
  ConvertOptions,
  ConvertResult,
  IRDiagram,
} from '@cleveloper/dex'

import { DiagramType } from '@cleveloper/dex'
```

## Notes

- `convert()` accepts only raw JSON strings — it does not read files. Use `fs.readFileSync` in your calling code.
- The library has no Node.js `fs` dependency, making it compatible with browser bundlers.
- The only runtime dependency is `commander` (used by the CLI, not the library core).
