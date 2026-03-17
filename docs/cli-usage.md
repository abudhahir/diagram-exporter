# CLI Usage

`dex` is the command-line interface for converting Gliffy diagrams to other formats.

## Installation

```bash
npm install -g @cleveloper/dex
```

## Syntax

```
dex <input> -f <format> [options]
```

## Arguments

| Argument | Description |
|---|---|
| `<input>` | Path to a `.gliffy` file, or `-` to read from stdin |

## Options

| Flag | Description |
|---|---|
| `-f, --format <format>` | **Required.** Output format: `drawio`, `mermaid`, or `plantuml` |
| `-o, --output <file>` | Write output to a file instead of stdout |
| `-t, --type <type>` | Override automatic diagram type detection: `FLOWCHART`, `SEQUENCE`, `CLASS_DIAGRAM` |
| `-V, --version` | Print version number |
| `-h, --help` | Display help |

## Examples

**Convert to Mermaid and print to terminal:**
```bash
dex diagram.gliffy -f mermaid
```

**Convert to Draw.io XML and save to file:**
```bash
dex diagram.gliffy -f drawio -o diagram.drawio
```

**Convert to PlantUML:**
```bash
dex diagram.gliffy -f plantuml
```

**Override diagram type detection:**
```bash
dex diagram.gliffy -f mermaid -t SEQUENCE
```

**Read from stdin (pipe):**
```bash
cat diagram.gliffy | dex - -f mermaid
```

**Pipe output to clipboard (macOS):**
```bash
dex diagram.gliffy -f mermaid | pbcopy
```

## Output Formats

### Draw.io XML (`drawio`)
Produces an XML file compatible with [draw.io](https://app.diagrams.net/). Open the `.drawio` file directly in the app or import via File → Import.

### Mermaid (`mermaid`)
Produces a [Mermaid](https://mermaid.js.org/) diagram definition. Paste into any Mermaid-compatible renderer — GitHub Markdown, Notion, Mermaid Live Editor, etc.

### PlantUML (`plantuml`)
Produces a [PlantUML](https://plantuml.com/) diagram definition wrapped in `@startuml` / `@enduml`. Render with the PlantUML CLI, VS Code extension, or online server.

## Diagram Type Detection

`dex` automatically classifies diagrams as `FLOWCHART`, `SEQUENCE`, or `CLASS_DIAGRAM` based on the shapes present in the Gliffy file. Use `--type` to override if the result is incorrect.
