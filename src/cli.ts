import { Command } from 'commander'
import * as fs from 'fs'
import { convert } from './index'
import type { OutputFormat } from './index'
import { DiagramType } from './ir/types'

const program = new Command()

program
  .name('dex')
  .description('Convert Gliffy diagrams to Draw.io, Mermaid, or PlantUML')
  .version('0.1.0')
  .argument('<input>', 'Path to .gliffy file or - for stdin')
  .requiredOption('-f, --format <format>', 'Output format: drawio | mermaid | plantuml')
  .option('-o, --output <file>', 'Output file (default: stdout)')
  .option('-t, --type <type>', 'Override diagram type detection')
  .action((
    input: string,
    options: { format: OutputFormat; output?: string; type?: string }
  ) => {
    const rawInput = input === '-'
      ? fs.readFileSync('/dev/stdin', 'utf-8')
      : input

    const result = convert(rawInput, options.format, {
      diagramType: options.type as DiagramType | undefined,
    })

    if (options.output) {
      fs.writeFileSync(options.output, result.output, 'utf-8')
    } else {
      process.stdout.write(result.output + '\n')
    }
  })

program.parse()
