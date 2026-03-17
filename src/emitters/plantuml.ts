import { IRDiagram, IRNode, IREdge, DiagramType, NodeShape } from '../ir/types'

function sanitizeId(id: string): string {
  return `n${id.replace(/[^a-zA-Z0-9]/g, '_')}`
}

function sanitizeLabel(label: string): string {
  return label.replace(/"/g, "'")
}

export class PlantUMLEmitter {
  emit(diagram: IRDiagram): string {
    switch (diagram.type) {
      case DiagramType.SEQUENCE: return this.emitSequence(diagram)
      case DiagramType.CLASS_DIAGRAM: return this.emitClassDiagram(diagram)
      default: return this.emitFlowchart(diagram)
    }
  }

  private emitFlowchart(diagram: IRDiagram): string {
    const lines: string[] = ['@startuml', '!pragma layout smetana']
    for (const node of diagram.nodes) {
      const id = sanitizeId(node.id)
      const label = sanitizeLabel(node.label) || id
      switch (node.shape) {
        case NodeShape.CYLINDER:
          lines.push(`database ${id} as "${label}"`)
          break
        case NodeShape.DIAMOND:
          lines.push(`diamond ${id} as "${label}"`)
          break
        default:
          lines.push(`rectangle ${id} as "${label}"`)
      }
    }
    for (const edge of diagram.edges) {
      if (!edge.sourceId || !edge.targetId) continue
      const src = sanitizeId(edge.sourceId)
      const tgt = sanitizeId(edge.targetId)
      const arrow = edge.style.dashed ? '..>' : '-->'
      const label = edge.label ? ` : ${sanitizeLabel(edge.label)}` : ''
      lines.push(`${src} ${arrow} ${tgt}${label}`)
    }
    lines.push('@enduml')
    return lines.join('\n')
  }

  private emitSequence(diagram: IRDiagram): string {
    const lines: string[] = ['@startuml']
    for (const node of diagram.nodes) {
      const id = sanitizeId(node.id)
      const label = sanitizeLabel(node.label) || id
      const type = node.shape === NodeShape.ACTOR ? 'actor' : 'participant'
      lines.push(`${type} "${label}" as ${id}`)
    }
    for (const edge of diagram.edges) {
      if (!edge.sourceId || !edge.targetId) continue
      const src = sanitizeId(edge.sourceId)
      const tgt = sanitizeId(edge.targetId)
      const arrow = edge.style.dashed ? '-->' : '->'
      const label = edge.label ? ` : ${sanitizeLabel(edge.label)}` : ''
      lines.push(`${src} ${arrow} ${tgt}${label}`)
    }
    lines.push('@enduml')
    return lines.join('\n')
  }

  private emitClassDiagram(diagram: IRDiagram): string {
    const lines: string[] = ['@startuml']
    for (const node of diagram.nodes) {
      const id = sanitizeId(node.id)
      const label = sanitizeLabel(node.label) || id
      const keyword =
        node.shape === NodeShape.INTERFACE_BOX ? 'interface'
        : node.shape === NodeShape.ENUM_BOX ? 'enum'
        : 'class'
      lines.push(`${keyword} "${label}"`)
    }
    for (const edge of diagram.edges) {
      if (!edge.sourceId || !edge.targetId) continue
      const src = sanitizeId(edge.sourceId)
      const tgt = sanitizeId(edge.targetId)
      const label = edge.label ? ` : ${sanitizeLabel(edge.label)}` : ''
      lines.push(`${src} --> ${tgt}${label}`)
    }
    lines.push('@enduml')
    return lines.join('\n')
  }
}
