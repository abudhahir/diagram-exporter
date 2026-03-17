# CLI Usage

## Installation

```bash
npm install -g dex
```

## Basic Usage

```bash
# Convert to Mermaid (printed to stdout)
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

## Reference

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

## Output Formats

| Flag | Format | File extension |
|---|---|---|
| `drawio` | Draw.io XML | `.xml` or `.drawio` |
| `mermaid` | Mermaid diagram text | `.md` or `.mmd` |
| `plantuml` | PlantUML text | `.puml` |

## Diagram Type Override

By default `dex` auto-detects the diagram type from the shapes present in the file. Use `-t` to override:

| Value | When to use |
|---|---|
| `FLOWCHART` | Force flowchart syntax |
| `SEQUENCE` | Force sequence diagram syntax |
| `CLASS_DIAGRAM` | Force class diagram syntax |

## Piping Examples

```bash
# Chain into clipboard (macOS)
dex diagram.gliffy -f mermaid | pbcopy

# Batch convert all .gliffy files in a directory
for f in *.gliffy; do
  dex "$f" -f drawio -o "${f%.gliffy}.xml"
done
```
