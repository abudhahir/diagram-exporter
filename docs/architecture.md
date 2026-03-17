# Architecture

`dex` converts Gliffy diagrams through a three-stage pipeline:

```
Gliffy JSON
    │
    ▼
┌─────────┐
│  Parser │  Gliffy JSON → Intermediate Representation (IR)
└─────────┘
    │
    ▼
┌──────────┐
│ Detector │  IR → DiagramType classification
└──────────┘
    │
    ▼
┌─────────┐
│ Emitter │  IR + DiagramType → target format string
└─────────┘
    │
    ▼
Draw.io XML / Mermaid / PlantUML
```

Each stage is fully decoupled. The Intermediate Representation is the only shared contract between them.

---

## Intermediate Representation (IR)

Defined in `src/ir/types.ts`. All Gliffy-specific details are resolved by the parser; downstream stages never see raw Gliffy data.

```typescript
interface IRDiagram {
  title: string
  type: DiagramType
  nodes: IRNode[]
  edges: IREdge[]
  width: number
  height: number
  background: string
}

interface IRNode {
  id: string
  label: string
  shape: NodeShape
  bounds: IRBounds
  style: IRStyle
}

interface IREdge {
  id: string
  label: string
  sourceId: string
  targetId: string
  waypoints: IRPoint[]
  arrowStart: ArrowType
  arrowEnd: ArrowType
  style: IRStyle
}

interface IRBounds {
  x: number
  y: number
  width: number
  height: number
  rotation?: number
}
```

---

## Parser (`src/parser/parser.ts`)

Two-pass parser over `GliffyDiagram.stage.objects`:

**Pass 1 — Shapes → IRNode:**
- Filters objects where `graphic.type !== 'Line'`
- Maps Gliffy `uid` to `NodeShape` via `src/parser/shape-map.ts`
- Extracts text labels by walking child objects and stripping HTML via `src/parser/label-extractor.ts`
- Reads position/size from `GliffyGraphic` dimensions

**Pass 2 — Lines → IREdge:**
- Filters objects where `graphic.type === 'Line'`
- Resolves `constraints.startConstraint` and `endConstraint` to `sourceId`/`targetId`
- Maps `graphic.Line.controlPath` to absolute waypoint coordinates

**Shape UID mapping (`src/parser/shape-map.ts`):**
Gliffy UIDs are long dotted strings (e.g. `com.gliffy.shape.flowchart.flowchart_v1.default.decision`). The map covers 20+ common shapes. Unknown UIDs fall back to `NodeShape.RECTANGLE`.

---

## Detector (`src/detector/detector.ts`)

Shape-voting classifier. Iterates `diagram.nodes` and tallies shapes against two sets:

| Set | Shapes | Wins if |
|---|---|---|
| `SEQUENCE_SHAPES` | `ACTOR`, `LIFELINE`, `ACTIVATION` | any match |
| `CLASS_SHAPES` | `CLASS_BOX`, `INTERFACE_BOX`, `ENUM_BOX` | any match |

Priority: **SEQUENCE > CLASS_DIAGRAM > FLOWCHART**

FLOWCHART is the unconditional default when no marker shapes are found.

---

## Emitters

Each emitter implements the same interface:

```typescript
interface Emitter {
  emit(diagram: IRDiagram): string
}
```

### Draw.io (`src/emitters/drawio.ts`)

Produces `<mxGraphModel>` XML. Key decisions:

- Root cells `id="0"` and `id="1"` are reserved by Draw.io — all node/edge IDs are prefixed with `s` (e.g. `s1`, `s3`) to avoid collision.
- Style strings use semicolon-separated key=value pairs (e.g. `rounded=1;fillColor=#dae8fc;`). Shape tokens have no trailing semicolon before the join.
- Rotation is written as `rotation=<degrees>` in the style string when non-zero.
- Edges use `<Array as="points">` child elements for waypoints.

### Mermaid (`src/emitters/mermaid.ts`)

Dispatches by `diagram.type`:

| DiagramType | Mermaid syntax |
|---|---|
| `FLOWCHART` | `flowchart TD` with bracket-syntax nodes |
| `SEQUENCE` | `sequenceDiagram` with `->>`/`-->>` messages |
| `CLASS_DIAGRAM` | `classDiagram` with class/relationship syntax |

Node shapes in flowcharts use Mermaid bracket syntax:

| NodeShape | Mermaid bracket |
|---|---|
| RECTANGLE | `[label]` |
| DIAMOND | `{label}` |
| CIRCLE | `((label))` |
| CYLINDER | `[(label)]` |
| PARALLELOGRAM | `[/label/]` |
| TERMINAL | `([label])` |
| Default | `[label]` |

Node IDs are sanitised via `sanitizeId()` (prefixed with `n`, non-alphanumeric replaced with `_`).

### PlantUML (`src/emitters/plantuml.ts`)

Wrapped in `@startuml` / `@enduml`. Dispatches by `diagram.type`:

| DiagramType | PlantUML construct |
|---|---|
| `FLOWCHART` | `:label;` activity nodes + arrows |
| `SEQUENCE` | `participant` declarations + `->` messages |
| `CLASS_DIAGRAM` | `class "Label" as nId` + `n1 --> n2` relationships |

The `as nId` alias is required on class declarations so that edge references can resolve unambiguously.

---

## Public API (`src/index.ts`)

```typescript
export function convert(
  input: string,         // raw Gliffy JSON string
  format: OutputFormat,  // 'drawio' | 'mermaid' | 'plantuml'
  options?: ConvertOptions
): ConvertResult
```

The library has no `fs` dependency — file reading is intentionally left to the caller (or the CLI layer). This keeps the library compatible with browser bundlers.

---

## CLI (`src/cli.ts`)

Built on [commander.js](https://github.com/tj/commander.js/). Responsibilities:

- Read the input file from disk (or stdin for `-`)
- Forward raw JSON to `convert()`
- Write `result.output` to stdout or an output file

The CLI is the only layer in the codebase that touches the filesystem.
