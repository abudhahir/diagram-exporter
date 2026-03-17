# dex — Gliffy Diagram Exporter

Convert [Gliffy](https://www.gliffy.com/) `.gliffy` files to **Draw.io XML**, **Mermaid**, or **PlantUML**.

Available as a CLI tool and a TypeScript/Node.js library.

## Quick Start

```bash
npm install -g @cleveloper/dex
dex diagram.gliffy -f mermaid
```

## Documentation

| Guide | Description |
|---|---|
| [CLI Usage](docs/cli-usage.md) | All CLI flags, examples, and piping |
| [Library Usage](docs/library-usage.md) | API reference and TypeScript examples |
| [Local Setup](docs/local-setup.md) | Development environment, build, tests |
| [Publishing](docs/publishing.md) | npm release process and versioning |
| [Architecture](docs/architecture.md) | Pipeline, IR model, emitter design |

## Supported Formats

| Input | Output |
|---|---|
| `.gliffy` file or raw JSON | Draw.io XML, Mermaid, PlantUML |

Diagram types detected automatically: **flowchart**, **sequence**, **class diagram**.

## License

MIT
