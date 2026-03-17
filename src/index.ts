import * as fs from 'fs'
import * as path from 'path'
import { parse } from './parser/parser'
import { detect } from './detector/detector'
import { DrawioEmitter } from './emitters/drawio'
import { MermaidEmitter } from './emitters/mermaid'
import { PlantUMLEmitter } from './emitters/plantuml'
import { DiagramType } from './ir/types'
import type { IRDiagram } from './ir/types'

export type OutputFormat = 'drawio' | 'mermaid' | 'plantuml'

export interface ConvertOptions {
  diagramType?: DiagramType
  stripStyles?: boolean
}

export interface ConvertResult {
  output: string
  format: OutputFormat
  detectedType: DiagramType
  warnings: string[]
}

export function convert(
  input: string,
  format: OutputFormat,
  options: ConvertOptions = {}
): ConvertResult {
  const isJson = input.trimStart().startsWith('{')
  const rawJson = isJson ? input : fs.readFileSync(path.resolve(input), 'utf-8')

  const diagram: IRDiagram = parse(rawJson)
  const detectedType = options.diagramType ?? detect(diagram)
  diagram.type = detectedType

  let output: string
  switch (format) {
    case 'drawio':
      output = new DrawioEmitter().emit(diagram)
      break
    case 'mermaid':
      output = new MermaidEmitter().emit(diagram)
      break
    case 'plantuml':
      output = new PlantUMLEmitter().emit(diagram)
      break
    default:
      throw new Error(`Unknown format: ${format as string}`)
  }

  return { output, format, detectedType, warnings: [] }
}

export { DiagramType }
export type { IRDiagram }
