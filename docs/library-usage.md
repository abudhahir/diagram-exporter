# Library Usage

## Installation

```bash
npm install dex
```

## Quick Start

```typescript
import { convert } from 'dex'
import * as fs from 'fs'

const rawJson = fs.readFileSync('diagram.gliffy', 'utf-8')
const result = convert(rawJson, 'mermaid')

console.log(result.output)       // Mermaid diagram text
console.log(result.detectedType) // e.g. "FLOWCHART"
```

## API

### `convert(input, format, options?)`

```typescript
convert(
  input: string,
  format: 'drawio' | 'mermaid' | 'plantuml',
  options?: ConvertOptions
): ConvertResult
```

**Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `input` | `string` | Raw Gliffy JSON string |
| `format` | `'drawio' \| 'mermaid' \| 'plantuml'` | Target output format |
| `options.diagramType` | `DiagramType` (optional) | Override auto-detection |

**Returns:**

```typescript
interface ConvertResult {
  output: string        // Converted diagram text or XML
  format: OutputFormat
  detectedType: DiagramType
  warnings: string[]
}
```

> The library accepts **raw JSON strings only** — no filesystem access.
> File reading is the caller's responsibility. This keeps the library browser-compatible.

## Examples

### Convert to Draw.io XML

```typescript
import { convert } from 'dex'
import * as fs from 'fs'

const json = fs.readFileSync('diagram.gliffy', 'utf-8')
const result = convert(json, 'drawio')

fs.writeFileSync('diagram.xml', result.output, 'utf-8')
```

### Override diagram type

```typescript
import { convert, DiagramType } from 'dex'

const result = convert(json, 'plantuml', {
  diagramType: DiagramType.SEQUENCE,
})
```

### Handle warnings

```typescript
const result = convert(json, 'mermaid')

if (result.warnings.length > 0) {
  console.warn('Conversion warnings:', result.warnings)
}
```

### Use in browser (via bundler)

The library has no Node.js dependencies — pass raw JSON obtained from a file input or API response:

```typescript
import { convert } from 'dex'

async function handleFile(file: File) {
  const json = await file.text()
  const result = convert(json, 'mermaid')
  return result.output
}
```

## Exported Types

```typescript
import type { ConvertOptions, ConvertResult, OutputFormat, IRDiagram } from 'dex'
import { DiagramType } from 'dex'
```

| Export | Kind | Description |
|---|---|---|
| `convert` | function | Main conversion entry point |
| `DiagramType` | enum | `FLOWCHART \| SEQUENCE \| CLASS_DIAGRAM \| UNKNOWN` |
| `ConvertOptions` | interface | Options for `convert()` |
| `ConvertResult` | interface | Return type of `convert()` |
| `OutputFormat` | type | `'drawio' \| 'mermaid' \| 'plantuml'` |
| `IRDiagram` | interface | Intermediate Representation type |
