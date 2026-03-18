# Gliffy diagram conversion library: technical research and format specifications

**A comprehensive Gliffy-to-{Mermaid, PlantUML, Draw.io, Visio} conversion library is feasible today, and the single most valuable starting point is draw.io's open-source Java Gliffy importer — a production-tested codebase with a complete shape-mapping table covering hundreds of Gliffy UIDs.** No existing tool converts Gliffy directly to Mermaid, PlantUML, or Visio, making this an unserved need. The core challenge is that Gliffy stores absolute pixel positions and rich styling, while Mermaid and PlantUML rely on auto-layout — meaning spatial fidelity will be lost for text-based targets but fully preserved for Draw.io XML and Visio VSDX output. Below is the full technical specification for each format involved.

---

## 1. Gliffy file format: a flat JSON object model with typed graphics

Gliffy files use the MIME type `application/gliffy+json` and are pure JSON documents. Two major versions exist: **v1.x** (Confluence Server/Data Center, older Gliffy Online) and **v2.0** (Confluence Cloud, latest Gliffy Online). Both share the same internal object model — the differences are top-level metadata only.

### Top-level structure

```json
{
  "contentType": "application/gliffy+json",
  "version": "1.3",
  "metadata": { "title": "untitled", "revision": 0 },
  "embeddedResources": { "index": 0, "resources": [] },
  "stage": { ... }
}
```

In v2.0, `title`, `revision`, `defaultPage`, `lastSerialized`, and a `libraries` array (listing loaded shape libraries like `com.gliffy.libraries.flowchart.flowchart_v1.default`) move to the top level. A legacy XML format predating 2012 also exists but is rarely encountered.

### The stage object

The `stage` is the canvas container. Key fields include `background` (hex color), `width`/`height` (pixels), `nodeIndex` (auto-incrementing ID counter), `maxWidth`/`maxHeight`, grid/snap settings, print configuration, `layers` (array of layer definitions), and most critically, **`objects`** — the flat array of all top-level diagram elements. The coordinate origin is the top-left corner; all measurements are in pixels.

### GliffyObject: the universal element type

Every diagram element — shapes, lines, text, images, groups — is a **GliffyObject** with a uniform structure:

| Field | Type | Purpose |
|-------|------|---------|
| `id` | integer | Unique numeric ID within the diagram |
| `uid` | string/null | Shape type identifier in reverse-domain notation (e.g., `com.gliffy.shape.flowchart.flowchart_v1.default.decision`). Null for child text labels. |
| `x`, `y` | float | Position of the object's top-left corner (relative to parent for children) |
| `width`, `height` | float | Bounding box dimensions in pixels |
| `rotation` | float | Rotation in degrees |
| `order` | int/string | Z-order; `"auto"` for children |
| `graphic` | object | Visual representation (typed union — see below) |
| `children` | array/null | Child GliffyObjects (text labels inside shapes, group members) |
| `constraints` | object/null | Connection constraint data for lines/connectors |
| `linkMap` | array | Hyperlinks |
| `layerId` | string | Layer membership |

### Graphic types (the typed union pattern)

The `graphic` field contains a `type` string and a corresponding nested object:

**Shape** (`type: "Shape"`): Used for all closed shapes. Contains `tid` (stencil/template ID like `com.gliffy.stencil.rectangle.basic_v1`), `strokeWidth`, `strokeColor`, `fillColor`, `gradient`, `dropShadow`, `opacity`, and `dashStyle`.

**Line** (`type: "Line"`): Used for all edges/connectors. Contains `strokeWidth`, `strokeColor`, `dashStyle`, **`startArrow`/`endArrow`** (integer codes: 0=none, 1=open, 2=filled, etc.), `ortho` (boolean for right-angle routing), `interpolationType` ("linear"/"bezier"), `cornerRadius`, and critically **`controlPath`** — an array of `[x, y]` control points relative to the line's position.

**Text** (`type: "Text"`): Stores content as **HTML with inline CSS** in the `html` field (e.g., `<p style="text-align:center;"><span style="font-size: 14px; color: rgb(0,0,0);">Label</span></p>`). Also has `valign`, `overflow`, `vposition`/`hposition` for label placement, padding values, and `lineTValue` (0.0–1.0 position along a line for edge labels).

**Image** (`type: "Image"`), **SVG** (`type: "Svg"`), and **Mindmap** (`type: "Mindmap"`) types also exist.

### Connection constraints

Lines reference their source and target nodes via the `constraints` object, which contains `startConstraint` and `endConstraint` sub-objects. Each holds a `nodeId` (integer referencing a shape's `id`) and **`px`/`py`** values (0.0–1.0 proportional positions on the connected shape's bounding box — e.g., `px=0.5, py=1.0` means bottom-center).

### Shape library system and diagram types

**There is no structural difference between diagram types in the file format.** All diagrams — flowcharts, UML class diagrams, ER diagrams, network topologies, BPMN, wireframes — use identical JSON structures. The diagram type is determined solely by which shape UIDs are used. Shape UIDs follow the pattern `com.gliffy.shape.{category}.{version}.{subcategory}.{shape}`. Major categories include:

- **Basic** (`basic.basic_v1.default`): rectangle, circle, diamond, triangle, star, cylinder, arrows
- **Flowchart** (`flowchart.flowchart_v1.default`): process, decision, terminal, document, database, delay, subroutine, and ~25 more
- **UML v2** (`uml.uml_v2`): class/interface/abstract_class/enumeration (class diagrams), lifeline/activation/frame (sequence), action/decision/fork_join/initial_state/final_state (activity)
- **ERD** (`erd.erd_v1.default`): entity, weak_entity, attribute, key_attribute, relationship
- **Network** (`network.network_v3/v4`): server, workstation, router, switch, firewall, cloud
- **BPMN** (`bpmn`): events, tasks, gateways
- **AWS/Azure/Kubernetes**: Hundreds of cloud service icons (`glib.aws_v3.*`, `glib.azure_v1.*`, `glib.kubernetes_v1.*`)
- **Swimlanes** (`swimlanes.swimlanes_v1.default`): horizontal/vertical pools and lanes
- **UI/Wireframe** (`ui.ui_v3`): form controls, containers, navigation elements

The draw.io codebase contains a **`gliffyTranslation.properties`** file that maps hundreds of these UIDs to draw.io styles — this is the essential Rosetta Stone for any converter.

---

## 2. Mermaid syntax: 25 diagram types with auto-layout and limited styling

Mermaid (v11.13.0) supports **25 diagram types**, each declared with a keyword. The format is entirely text-based with **no absolute positioning** — all layout is computed by the Dagre or ELK layout engine.

### Key diagram types and syntax patterns

**Flowcharts** (`flowchart TD`/`LR`/`BT`/`RL`): Nodes defined with shape brackets (`A[Rectangle]`, `A{Diamond}`, `A((Circle))`, `A[(Cylinder)]`), plus 40+ shapes via the expanded `A@{ shape: cloud }` syntax (v11.3.0+). Edges use arrow notation (`A --> B`, `A -.-> B` dotted, `A ==> B` thick). Subgraphs enable grouping. Per-node styling via `style A fill:#f9f,stroke:#333` and `classDef`/`linkStyle` directives.

**Sequence diagrams** (`sequenceDiagram`): Participants/actors with aliases, message arrows (`->>`, `-->>`, `-x`, `-)`), activation/deactivation, `loop`/`alt`/`par`/`opt`/`critical`/`break` control structures, notes, autonumbering, and participant boxing. Always flows left-to-right, top-to-bottom.

**Class diagrams** (`classDiagram`): Classes with fields/methods (visibility markers `+`/`-`/`#`/`~`), relationships (`<|--` inheritance, `*--` composition, `o--` aggregation, `..>` dependency), cardinality labels, namespaces, and annotations like `<<Interface>>`.

**ER diagrams** (`erDiagram`): Crow's foot notation with cardinality markers (`||--|{`, `}o--o|`), entity attributes with PK/FK/UK designators, and relationship labels.

**State diagrams** (`stateDiagram-v2`): States with `[*]` start/end, composite nested states, `<<choice>>`, `<<fork>>`, `<<join>>` pseudo-states, and concurrency dividers.

Other types include **Gantt charts**, **Pie charts**, **Mindmaps** (indentation-based), **Timelines**, **C4 diagrams** (experimental), **Block diagrams** (`block-beta` with column-based grid), **Architecture diagrams** (`architecture-beta` with iconify support), **GitGraph**, **Sankey** (CSV-based), **XY charts**, **Kanban**, **Packet** diagrams, and newer **Radar**/**Treemap**/**Venn** types.

### Styling and configuration

Mermaid offers five themes (`default`, `neutral`, `dark`, `forest`, `base`), where only `base` supports custom `themeVariables` (e.g., `primaryColor`, `lineColor`, `fontFamily`). Inline styling is limited primarily to flowcharts via `style`/`classDef`/`linkStyle`. Configuration via frontmatter YAML or `%%{init: {...}}%%` directives controls theme, layout engine, and per-diagram options.

### Conversion-critical limitations

- **No absolute positioning**: All layout is auto-generated. Gliffy's spatial arrangement cannot be reproduced.
- **No custom shapes**: Only the predefined ~40 flowchart shapes plus diagram-specific shapes are available.
- **No layers, z-ordering, or overlapping elements**: Everything is on a single plane.
- **Limited text formatting**: Markdown strings (bold/italic) within labels, but no mixed fonts/sizes/colors within a single label.
- **Limited edge control**: No waypoints, no manual routing, no bezier control points. Edge labels are auto-positioned.
- **No freeform drawing**: No arbitrary paths or curves.
- **Size limits**: Default 50,000 characters, 500 edges (configurable).
- **Cannot mix diagram types**: Each code block is one type only.
- **Styling varies by diagram type**: Full node/edge styling only in flowcharts; most other types support only theme-level colors.

---

## 3. PlantUML syntax: 25+ diagram types with rich text but auto-layout

PlantUML supports over **25 diagram types** using `@startuml`/`@enduml` markers (or type-specific markers like `@startgantt`, `@startmindmap`, `@startsalt`). It offers significantly richer styling than Mermaid through the **skinparam system** (~540 parameters) and Creole markup, but shares the fundamental auto-layout constraint.

### Major diagram types

**Sequence diagrams**: Eight participant types (participant, actor, boundary, control, entity, database, collections, queue), rich arrow syntax with color (`-[#red]>`), grouping (`alt`/`loop`/`par`/`opt`/`critical`/`break`), notes (left/right/over), activation shorthand (`++`/`--`), dividers, delays, and participant boxing.

**Class diagrams**: Entity types including class, interface, enum, abstract, struct, record. Relationships with full UML notation (`<|--` extension, `*--` composition, `o--` aggregation, `..>` dependency, `<|..` realization). Direction hints (`-left->`, `-up->`), cardinality, packages/namespaces, and the `together {}` keyword for layout influence.

**Activity diagrams** (new syntax): Swimlanes (`|Lane|`), conditionals (`if`/`elseif`/`else`/`endif`), loops (`while`/`repeat`), switch/case, fork/join, and **SDL-style shape endings** (`;` rectangle, `|` action, `>` send signal, `<` receive signal, `/` parallelogram).

**Component/Deployment diagrams**: Rich set of container keywords (`node`, `cloud`, `database`, `folder`, `frame`, `package`, `rectangle`, `queue`, `stack`, `storage`, `artifact`, `card`, `hexagon`, `person`) that can be freely nested.

**ER diagrams**: Both **IE (Information Engineering)** notation with crow's foot symbols (`||--o{`) and **Chen's notation** with explicit relationship entities.

**Network diagrams** (nwdiag): Network topology with address assignments, groups, and limited shapes (`database`, `cloud`).

Other types: **State**, **Timing**, **Use Case**, **Object**, **Gantt**, **Mindmap**, **WBS**, **Wireframe (Salt)**, **JSON/YAML visualization**, **Archimate**, **Math**, and more.

### Styling capabilities

PlantUML's **skinparam system** controls 540+ properties including per-element fonts, colors, border thickness, padding, and layout (Nodesep, Ranksep). A newer **CSS-style `<style>` block** is gradually replacing skinparam. **Creole markup** provides bold, italic, underline, strikethrough, colored text (`<color:#red>`), sized text (`<size:18>`), tables, code blocks, and horizontal rules within any label or note. Inline colors on elements (`class MyClass #pink;line:red`) and arrows (`-[#blue,dashed]->`) offer per-element control. The **standard library (stdlib)** provides AWS, Azure, GCP, Kubernetes, C4, and Material icon sets via `!include`.

### Conversion-critical limitations

- **No absolute positioning** (the #1 challenge): PlantUML deliberately rejects pixel-precise layout. Only indirect influence via arrow direction hints, arrow length, `together{}`, hidden links, and `Nodesep`/`Ranksep` parameters.
- **Default image size cap of 4096×4096 pixels** (overridable via `PLANTUML_LIMIT_SIZE`).
- **No custom shape geometry**: Only predefined shapes per diagram type. Custom sprites are monochrome only.
- **No anchor point specification**: Cannot control which side of a shape an arrow connects to (beyond directional hints).
- **Font portability**: Only Helvetica and Courier are guaranteed cross-platform.
- **Orthogonal routing** (`skinparam linetype ortho`) has known issues with label placement.
- **No opacity/alpha support** in standard syntax.

### Advantages over Mermaid for conversion

PlantUML supports **gradient fills**, **per-element colors**, **rich text formatting**, a much larger shape vocabulary (especially for deployment/component diagrams), **direction hints** for layout influence, **notes attached to specific elements**, and a **preprocessing system** (`!define`, `!include`, variables, functions) enabling modular output.

---

## 4. Draw.io XML format: mxCell-based model with semicolon-delimited styles

Draw.io files (`.drawio`/`.xml`) use a well-documented XML format based on the mxGraph library. This is the **highest-fidelity target format** since it supports absolute positioning, arbitrary styling, and the same visual paradigm as Gliffy.

### File structure hierarchy

```xml
<mxfile host="app.diagrams.net" compressed="false">
  <diagram id="page-1" name="Page-1">
    <mxGraphModel dx="946" dy="469" grid="1" gridSize="10"
                  pageWidth="1100" pageHeight="850">
      <root>
        <mxCell id="0"/>                          <!-- Root container (required) -->
        <mxCell id="1" parent="0"/>               <!-- Default layer (required) -->
        <!-- All diagram elements here -->
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

Multiple pages are sibling `<diagram>` elements. The format supports both compressed (Base64-encoded DEFLATE) and uncompressed modes — **converters should generate uncompressed XML** for simplicity. The `<mxGraphModel>` element carries canvas properties: grid settings, page dimensions, background color, math rendering, and global shadow.

### The mxCell element

Every diagram element is an `<mxCell>` with these key attributes:

| Attribute | Description |
|-----------|-------------|
| `id` | Unique string identifier |
| `value` | Label text (supports HTML when `html=1` in style) |
| `style` | Semicolon-delimited `key=value;` style string |
| `vertex="1"` | Marks a shape (mutually exclusive with `edge`) |
| `edge="1"` | Marks a connector |
| `source`/`target` | IDs of connected vertices (edges only) |
| `parent` | ID of parent cell (usually `"1"` for default layer) |

**Vertices** require an `<mxGeometry x="" y="" width="" height="" as="geometry"/>` child. **Edges** require `<mxGeometry relative="1" as="geometry"/>` and optionally contain `<Array as="points">` with `<mxPoint>` waypoints, plus `sourcePoint`/`targetPoint` for unconnected endpoints. Edge label position uses `x` (-1 to 1 along path) and `y` (perpendicular pixel offset).

Cells wrapped in `<object>` (or `<UserObject>`) gain arbitrary key-value metadata attributes — a converter must handle both patterns.

### Style string format

Styles are **semicolon-separated key=value pairs**, case-sensitive, with no spaces: `rounded=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontSize=14;`. A bare token without `=` sets the base shape class (e.g., `ellipse;whiteSpace=wrap;html=1;`).

**Shape identifiers** via `shape=`: Core shapes include `rectangle` (default), `ellipse`, `rhombus`, `triangle`, `hexagon`, `cloud`, `cylinder`, `swimlane`, and dozens of extended shapes (`document`, `process`, `parallelogram`, `trapezoid`, `dataStorage`, `offPageConnector`, `delay`, etc.). Stencil library shapes use `shape=mxgraph.{library}.{shape}` (e.g., `mxgraph.flowchart.decision`, `mxgraph.aws4.lambda`).

**Edge routing** via `edgeStyle=`: `orthogonalEdgeStyle` (right-angle), `segmentEdgeStyle` (manual segments), `elbowEdgeStyle`, `entityRelationEdgeStyle`, or empty (straight). Arrow markers via `startArrow`/`endArrow`: `classic`, `block`, `open`, `oval`, `diamond`, `diamondThin`, `circle`, `cross`, `dash`, `none`, and more. `startFill=0`/`endFill=0` renders open (unfilled) markers.

**Other critical style keys**: `fillColor`/`strokeColor`/`fontColor` (hex or `none`), `strokeWidth`, `fontSize`, `fontFamily`, `fontStyle` (bitmask: 1=bold, 2=italic, 4=underline), `opacity` (0-100), `dashed`/`dashPattern`, `rounded`/`arcSize`, `shadow`, `glass`, `rotation`, `direction` (for 90° rotations), `container` (for groups), connection point offsets (`exitX`/`exitY`/`entryX`/`entryY` as 0.0–1.0 proportional positions).

### Layers, groups, and containers

Additional layers are `<mxCell>` elements with `parent="0"`. Groups use `style="group;"` with child cells referencing the group as `parent`. Containers (visible groups like swimlanes) use `container=1;` in the style string with a `startSize` header height.

### Mapping from Gliffy

This is the **most natural target format**: Gliffy's `x`/`y`/`width`/`height` map directly to `<mxGeometry>`, Gliffy's `constraints` (`px`/`py`) map to `exitX`/`exitY`/`entryX`/`entryY`, line control paths map to `<Array as="points">`, and the `gliffyTranslation.properties` file provides direct UID-to-style mappings.

---

## 5. Visio VSDX format: an OPC ZIP archive of relationship-linked XML files

VSDX is an Open Packaging Convention (OPC/OOXML) ZIP archive containing interlinked XML documents following Microsoft's `[MS-VSDX]` specification. It is the most complex target format but supports full visual fidelity.

### Package contents

```
myfile.vsdx (ZIP)
├── [Content_Types].xml            # MIME type registry
├── _rels/.rels                    # Root relationships → visio/document.xml
├── visio/
│   ├── document.xml               # StyleSheets, FaceNames, DocumentSettings
│   ├── pages/
│   │   ├── pages.xml              # Page index with PageSheet (dimensions, scale)
│   │   ├── page1.xml              # Shape content for page 1
│   │   └── _rels/pages.xml.rels
│   ├── masters/
│   │   ├── masters.xml            # Master shape index
│   │   ├── master1.xml            # Master shape definition
│   │   └── _rels/masters.xml.rels
│   ├── windows.xml                # Editor window state
│   ├── theme/theme1.xml           # DrawingML theme (optional)
│   └── _rels/document.xml.rels
├── docProps/
│   ├── app.xml                    # Application metadata
│   └── core.xml                   # Dublin Core (author, title, dates)
└── media/                         # Embedded images (optional)
```

Every part must be registered in `[Content_Types].xml` with correct MIME types (e.g., `application/vnd.ms-visio.page+xml`) and cross-referenced via `.rels` relationship files. The primary XML namespace is `http://schemas.microsoft.com/office/visio/2012/main`.

### Shape model and Cell elements

Each shape is a `<Shape>` element with attributes `ID` (unique integer), `Type` ("Shape"/"Group"/"Foreign"), and optional `Master` (referencing a master shape for property inheritance). All properties are expressed as generic **`<Cell>` elements** with `N` (name), `V` (value), `F` (formula), and `U` (unit) attributes.

**Positioning** uses a center-pin model (unlike Gliffy's top-left): `PinX`/`PinY` define the rotation pin in **page coordinates** (inches, Y-up from bottom-left origin), `LocPinX`/`LocPinY` define the pin within the shape (usually Width/2, Height/2), and `Width`/`Height` set dimensions. **Connectors** (1D shapes) use `BeginX`/`BeginY`/`EndX`/`EndY` cells.

**Geometry** is defined in `<Section N="Geometry">` with rows typed as `MoveTo`/`RelMoveTo`, `LineTo`/`RelLineTo`, `ArcTo`, `EllipticalArcTo`, `NURBSTo`, or `SplineStart`/`SplineKnot`. Relative variants use 0–1 coordinates within the shape's bounding box.

**Text** uses `<Text>` elements with inline formatting switches (`<cp IX="n"/>` for character runs, `<pp IX="n"/>` for paragraphs) referencing `<Section N="Character">` and `<Section N="Paragraph">` rows. Font size is in **inches** (12pt = 0.1667").

**Connections** are stored in `<Connects>` with `<Connect FromSheet="" FromCell="BeginX" ToSheet="" ToPart="3"/>` elements linking connector shapes to target shapes.

**Styling** uses Cell names: `FillForegnd`/`FillBkgnd` (colors), `FillPattern` (0=none, 1=solid, 2–40=patterns), `LineWeight` (inches), `LineColor`, `LinePattern` (0=none, 1=solid, 2+=dashed), `BeginArrow`/`EndArrow` (0–45 arrowhead types), plus transparency cells `FillForegndTrans`/`FillBkgndTrans` (0–1).

### Minimum viable VSDX

A valid file requires: `[Content_Types].xml`, `_rels/.rels`, `visio/document.xml` (with at least one StyleSheet), `visio/_rels/document.xml.rels`, `visio/pages/pages.xml`, `visio/pages/_rels/pages.xml.rels`, and `visio/pages/page1.xml`. Masters, themes, and docProps are optional but recommended.

### Key pitfalls for generators

**Units are inches** (not pixels) — all coordinates and dimensions need pixel-to-inch conversion (typically 96 DPI). **Y-axis is inverted** compared to Gliffy — Visio's origin is bottom-left with Y-up, while Gliffy uses top-left with Y-down. Shape IDs must be unique integers per page. Formulas with `F` attributes can override values — use `F="No Formula"` to suppress inherited formulas. Geometry paths must be closed for filled shapes.

---

## 6. Existing tools and the conversion landscape

### The critical resource: draw.io's Gliffy importer

The **most important existing codebase** is draw.io's Java-based Gliffy importer at `com.mxgraph.io.gliffy.importer.GliffyDiagramConverter` in the [jgraph/drawio](https://github.com/jgraph/drawio) repository (Apache 2.0 license, ~40.8K stars). It parses Gliffy JSON into a typed object model, maps shape UIDs to draw.io styles using `gliffyTranslation.properties`, handles coordinate transforms, rotation, gradients, constraints, swimlanes, mindmaps, and legacy XML formats. This is production-grade code powering mass migrations for thousands of enterprises. The [languitar/drawio-batch](https://github.com/languitar/drawio-batch) repo extracts this converter into a standalone Java tool.

### No direct Gliffy-to-{Mermaid, PlantUML, Visio} converter exists

After exhaustive searching, **no open-source tool converts .gliffy files directly to Mermaid, PlantUML, or Visio**. This is the gap the proposed library would fill.

### Useful adjacent tools

- **[convert2mermaid](https://github.com/jgreywolf/convert2mermaid)** (TypeScript, 29★): Converts Draw.io, Visio, PlantUML, and Excalidraw to Mermaid. Created by a Mermaid Chart employee. Has Gliffy support planned. Its `drawioParser.ts` and diagram-type generators are directly reusable.
- **[FlowForge](https://github.com/genkinsforge/FlowForge)** (Python): Converts Draw.io to Mermaid, handling compressed XML and multi-page diagrams.
- **[excalidraw-converter](https://github.com/sindrel/excalidraw-converter)** (Go): Converts Excalidraw *to* Gliffy/Draw.io/Mermaid — useful reference for Gliffy JSON writing.
- **[drawpyo](https://pypi.org/project/drawpyo/)** (Python, 383★): Programmatically generates Draw.io files with shapes, edges, and styles.
- **[vsdx](https://pypi.org/project/vsdx/)** (Python, BSD): Reads/writes Visio VSDX files. Best used with template files; supports shape creation, connectors, and Jinja2 templating.
- **[canvas2svg](https://github.com/gliffy/canvas2svg)** (JavaScript): Gliffy's own library for translating Canvas draw commands to SVG.

### Viable conversion architecture

A two-stage pipeline is the most practical approach:

1. **Stage 1 — Parse Gliffy JSON** into an intermediate representation (IR) containing typed nodes, edges, labels, styles, and connection topology. Port the essential logic from draw.io's `GliffyDiagramConverter` and the `gliffyTranslation.properties` shape mapping.

2. **Stage 2 — Emit target formats** from the IR:
   - **Draw.io XML**: Direct mapping of coordinates, styles, and shapes. Highest fidelity. Use `drawpyo` (Python) or generate XML directly (TypeScript).
   - **Visio VSDX**: Coordinate transform (pixels → inches, Y-flip), shape geometry generation, OPC package assembly. Use `vsdx` library (Python) or `jszip` + XML builder (TypeScript).
   - **Mermaid**: Diagram-type detection from shape UIDs → appropriate Mermaid type. Semantic-only conversion (topology, labels, relationships). Spatial layout lost. Leverage `convert2mermaid`'s generators.
   - **PlantUML**: Richer styling preservation than Mermaid via skinparam and inline colors. Direction hints from Gliffy spatial arrangement. Same semantic-conversion approach.

### Python and TypeScript library availability summary

| Task | Python | TypeScript/JS |
|------|--------|---------------|
| Parse .gliffy JSON | `json` stdlib | `JSON.parse` |
| Write Draw.io XML | `drawpyo`, `xml.etree` | Direct XML generation |
| Write VSDX | `vsdx` (dave-howard) | `jszip` + XML builder (no dedicated library) |
| Generate Mermaid text | String templates | `convert2mermaid` generators |
| Generate PlantUML text | String templates | String templates |
| Reference implementation | Port draw.io Java importer | Port draw.io Java importer |

---

## Conclusion: what makes this conversion tractable

Three factors make a comprehensive Gliffy conversion library feasible today. First, **Gliffy's format is uniform** — all diagram types share one JSON object model, so a single parser handles everything. Second, the **draw.io importer is open-source and production-tested**, providing a complete shape-mapping table and proven conversion logic that can be ported to Python or TypeScript. Third, the **target formats span a fidelity spectrum** — Draw.io XML and Visio VSDX can preserve exact positions, dimensions, and styling, while Mermaid and PlantUML necessarily reduce diagrams to their semantic topology.

The core architectural insight is that the converter should produce an **intermediate representation** first — a graph of typed, styled nodes and edges with resolved connections — then emit format-specific output from that IR. The hardest per-format challenges are: for Mermaid, **diagram-type inference** from shape UIDs (mapping flowchart shapes to `flowchart`, UML shapes to `classDiagram`, etc.) and accepting layout loss; for PlantUML, **layout-hint generation** from spatial relationships (converting absolute positions into direction hints and `together{}` groupings); for Draw.io, **style string construction** from the Gliffy shape/style model (largely solved by `gliffyTranslation.properties`); and for Visio, **coordinate system transformation** (pixel-to-inch, Y-axis flip) and OPC package assembly with correct relationship files.