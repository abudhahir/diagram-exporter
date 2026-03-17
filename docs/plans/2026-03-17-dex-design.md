# dex — Gliffy Diagram Conversion Library: Design Document

**Date:** 2026-03-17
**Status:** Validated

---

## Overview

`dex` (diagram-exporter) is a TypeScript library and CLI tool that converts Gliffy `.gliffy` diagram files into Draw.io XML, Mermaid, and PlantUML formats. It accepts either a local file path or a raw Gliffy JSON string as input.

---

## Decisions Log

| Decision | Choice | Rationale |
|---|---|---|
| Language | TypeScript/Node.js | Runs in browser and Node; ecosystem alignment with `convert2mermaid` |
| Delivery | NPM library + CLI (`dex`) | Library for programmatic use; CLI for one-off conversions at no extra cost |
| Output formats (v1) | Draw.io XML, Mermaid, PlantUML | Visio deferred; these three cover the primary use cases |
| Diagram types (text targets) | Flowchart, Sequence, Class Diagram | Covers ~80% of real-world Gliffy files; extensible via IR |
| Input | File path or raw JSON string | Composable API; no filesystem dependency for library consumers |

---

## Architecture

The library follows a 3-stage pipeline:

```mermaid
flowchart LR
    A[Input\nfile path or JSON string] --> B[Parser]
    B --> C[Intermediate Representation]
    C --> D[Detector\ndiagram type]
    D --> E[Emitter]
    E --> F1[Draw.io XML]
    E --> F2[Mermaid]
    E --> F3[PlantUML]
```

---

## Package Structure

```
src/
  parser/         # Gliffy JSON → IR
  ir/             # IR type definitions
  detector/       # Diagram type inference from shape UIDs
  emitters/
    drawio.ts     # IR → Draw.io XML
    mermaid.ts    # IR → Mermaid text
    plantuml.ts   # IR → PlantUML text
  cli.ts          # CLI entry point (commander.js)
  index.ts        # Public library API

tests/
  fixtures/       # Sample .gliffy files (flowchart, sequence, class)
  parser/
  emitters/

dist/             # Compiled output
docs/
  plans/          # Design documents
```

---

## Intermediate Representation (IR)

The IR is a typed graph model that decouples parsing from emission. All Gliffy-specific details (UIDs, px/py constraints, controlPath) are fully resolved during parsing — nothing Gliffy-specific leaks into the IR.

```mermaid
classDiagram
    class IRDiagram {
        +string title
        +IRNode[] nodes
        +IREdge[] edges
        +DiagramType type
        +number width
        +number height
        +string background
    }
    class IRNode {
        +string id
        +NodeShape shape
        +string label
        +IRStyle style
        +IRBounds bounds
        +IRNode[] children
        +string[] groupIds
    }
    class IREdge {
        +string id
        +string sourceId
        +string targetId
        +string label
        +IRStyle style
        +ArrowType startArrow
        +ArrowType endArrow
        +IRPoint[] waypoints
        +number sourceX
        +number sourceY
        +number targetX
        +number targetY
    }
    class IRStyle {
        +string fillColor
        +string strokeColor
        +string fontColor
        +number strokeWidth
        +boolean dashed
        +number opacity
        +number fontSize
    }
    class IRBounds {
        +number x
        +number y
        +number width
        +number height
        +number rotation
    }
    IRDiagram --> IRNode
    IRDiagram --> IREdge
    IRNode --> IRStyle
    IRNode --> IRBounds
    IREdge --> IRStyle
```

**Key enums:**

- `DiagramType`: `FLOWCHART | SEQUENCE | CLASS_DIAGRAM | UNKNOWN`
- `NodeShape`: `RECTANGLE | DIAMOND | CIRCLE | CYLINDER | PARALLELOGRAM | TERMINAL | DOCUMENT | ACTOR | LIFELINE | CLASS_BOX | INTERFACE_BOX | ENUM_BOX | ...`

---

## Parser Layer

Transforms raw Gliffy JSON into the IR in two passes:

```mermaid
flowchart TD
    A[Raw Gliffy JSON string] --> B[JSON.parse + schema validation]
    B --> C[Pass 1: Build node map\nid → IRNode]
    C --> D[Pass 2: Resolve edges\nconstraints → sourceId/targetId]
    D --> E[Resolve connections\npx/py → entryX/entryY]
    E --> F[Strip HTML from labels\nspan tags → plain text]
    F --> G[IRDiagram]

    H[(shape-map.ts\nUID → NodeShape)] --> C
```

**Key responsibilities:**

- **Shape UID mapping** (`shape-map.ts`): static lookup table mapping Gliffy UIDs (e.g. `com.gliffy.shape.flowchart.flowchart_v1.default.decision`) → `NodeShape.DIAMOND`. Ported from draw.io's `gliffyTranslation.properties`.
- **Label extraction**: strips HTML tags, extracts plain text and basic style hints (font size, bold, color).
- **Connection resolution**: `constraints.startConstraint.nodeId` → `IREdge.sourceId`; `px`/`py` values → normalised `sourceX`/`sourceY` (0.0–1.0).

**Entry point:**
```typescript
parse(input: string | GliffyJSON): IRDiagram
```

---

## Detector Layer

Classifies the diagram type by scoring node shapes against known categories:

```mermaid
flowchart TD
    A[IRDiagram] --> B[Extract all NodeShapes\nfrom nodes]
    B --> C{Shape voting\nby category}
    C -->|flowchart shapes > threshold| D[FLOWCHART]
    C -->|lifeline / activation shapes present| E[SEQUENCE]
    C -->|class box shapes present| F[CLASS_DIAGRAM]
    C -->|no clear winner| G[UNKNOWN\nfallback to FLOWCHART]
```

**Category scoring table:**

| Category | Triggering shapes |
|---|---|
| `FLOWCHART` | `PROCESS`, `DECISION`, `TERMINAL`, `DOCUMENT`, `CYLINDER`, `PARALLELOGRAM` |
| `SEQUENCE` | `LIFELINE`, `ACTIVATION`, `ACTOR` |
| `CLASS_DIAGRAM` | `CLASS_BOX`, `INTERFACE_BOX`, `ENUM_BOX` |

Fallback to `FLOWCHART` when no category scores above minimum threshold (2 nodes).

**Entry point:**
```typescript
detect(diagram: IRDiagram): DiagramType
```

---

## Emitters

All three emitters implement a common interface:

```mermaid
classDiagram
    class Emitter {
        <<interface>>
        +emit(diagram: IRDiagram) string
    }
    class DrawioEmitter {
        +emit(diagram: IRDiagram) string
        -buildVertex(node: IRNode) string
        -buildEdge(edge: IREdge) string
        -buildStyle(style: IRStyle) string
    }
    class MermaidEmitter {
        +emit(diagram: IRDiagram) string
        -emitFlowchart(diagram: IRDiagram) string
        -emitSequence(diagram: IRDiagram) string
        -emitClassDiagram(diagram: IRDiagram) string
        -shapeToSyntax(shape: NodeShape) string
    }
    class PlantUMLEmitter {
        +emit(diagram: IRDiagram) string
        -emitFlowchart(diagram: IRDiagram) string
        -emitSequence(diagram: IRDiagram) string
        -emitClassDiagram(diagram: IRDiagram) string
        -buildSkinparams(style: IRStyle) string
    }
    Emitter <|.. DrawioEmitter
    Emitter <|.. MermaidEmitter
    Emitter <|.. PlantUMLEmitter
```

**Per-emitter responsibilities:**

- **DrawioEmitter**: Direct coordinate passthrough (`IRBounds` → `mxGeometry`), style string construction, waypoints → `<Array as="points">`. Full spatial fidelity preserved.
- **MermaidEmitter**: Dispatches by `DiagramType`. Maps `NodeShape` to bracket syntax (`DIAMOND` → `{label}`, `CIRCLE` → `((label))`). Layout discarded.
- **PlantUMLEmitter**: Same dispatch pattern. Uses `skinparam` for style hints. Derives direction hints from `IRBounds` spatial relationships.

---

## Public API

```typescript
convert(
  input: string,
  format: 'drawio' | 'mermaid' | 'plantuml',
  options?: ConvertOptions
): ConvertResult

interface ConvertOptions {
  diagramType?: DiagramType  // override auto-detection
  stripStyles?: boolean      // emit topology only, no colors/fonts
}

interface ConvertResult {
  output: string             // converted diagram text or XML
  format: OutputFormat
  detectedType: DiagramType
  warnings: string[]         // e.g. "3 shapes could not be mapped"
}
```

---

## CLI

```
dex <input> [options]

Arguments:
  input                   Path to .gliffy file or - for stdin

Options:
  -f, --format <format>   Output format: drawio | mermaid | plantuml
  -o, --output <file>     Output file (default: stdout)
  -t, --type <type>       Override diagram type detection
  --no-styles             Strip styles from output
  -h, --help
```

**Examples:**
```bash
dex diagram.gliffy -f mermaid -o diagram.md
cat diagram.gliffy | dex - -f drawio > diagram.xml
dex diagram.gliffy -f plantuml --no-styles
```

---

## Testing Strategy

```mermaid
flowchart TD
    A[Test Suite] --> B[Unit Tests]
    A --> C[Integration Tests]
    A --> D[Fixture Tests]

    B --> B1[Parser: Gliffy JSON → IR\nper shape type, per graphic type]
    B --> B2[Detector: shape voting logic\nedge cases and fallbacks]
    B --> B3[Emitters: IR → output\nper diagram type per format]

    C --> C1[Full pipeline tests\nparse → detect → emit]

    D --> D1[Real .gliffy fixture files\nflowchart · sequence · class diagram]
    D --> D2[Snapshot tests\noutput locked to known-good files]
```

**Stack:** `vitest` + snapshot testing.

**Key unit test cases:**

| Layer | Test case |
|---|---|
| Parser | Unknown UID falls back to `RECTANGLE` without throwing |
| Parser | HTML label `<b>Hello</b>` → plain text `Hello` |
| Detector | Mixed shapes → majority wins |
| Detector | 1-node diagram → falls back to `FLOWCHART` |
| Mermaid | `DECISION` node → `{label}` syntax |
| Draw.io | Edge waypoints → `<Array as="points">` |
