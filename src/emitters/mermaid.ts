import { IRDiagram, IRNode, IREdge, DiagramType, NodeShape, ArrowType } from '../ir/types'

function sanitizeId(id: string): string {
  return `n${id.replace(/[^a-zA-Z0-9]/g, '_')}`
}

function sanitizeLabel(label: string): string {
  return label.replace(/"/g, "'").replace(/\n/g, ' ')
}

function nodeShapeToMermaid(shape: NodeShape, label: string): string {
  const l = sanitizeLabel(label) || ' '
  switch (shape) {
    case NodeShape.DIAMOND: return `{${l}}`
    case NodeShape.CIRCLE: return `((${l}))`
    case NodeShape.CYLINDER: return `[(${l})]`
    case NodeShape.TERMINAL: return `([${l}])`
    case NodeShape.DOCUMENT: return `[/${l}\\]`
    case NodeShape.PARALLELOGRAM: return `[/${l}/]`
    default: return `[${l}]`
  }
}

function arrowToMermaid(edge: IREdge): string {
  if (edge.style.dashed) return edge.endArrow === ArrowType.NONE ? '-.-' : '-.->'
  return edge.endArrow === ArrowType.NONE ? '---' : '-->'
}

export class MermaidEmitter {
  emit(diagram: IRDiagram): string {
    switch (diagram.type) {
      case DiagramType.SEQUENCE: return this.emitSequence(diagram)
      case DiagramType.CLASS_DIAGRAM: return this.emitClassDiagram(diagram)
      default: return this.emitFlowchart(diagram)
    }
  }

  private emitFlowchart(diagram: IRDiagram): string {
    const lines: string[] = ['flowchart TD']
    for (const node of diagram.nodes) {
      const id = sanitizeId(node.id)
      lines.push(`  ${id}${nodeShapeToMermaid(node.shape, node.label)}`)
    }
    for (const edge of diagram.edges) {
      if (!edge.sourceId || !edge.targetId) continue
      const src = sanitizeId(edge.sourceId)
      const tgt = sanitizeId(edge.targetId)
      const arrow = arrowToMermaid(edge)
      const label = edge.label ? `|${sanitizeLabel(edge.label)}|` : ''
      lines.push(`  ${src} ${arrow}${label} ${tgt}`)
    }
    return lines.join('\n')
  }

  private emitSequence(diagram: IRDiagram): string {
    const lines: string[] = ['sequenceDiagram']
    for (const node of diagram.nodes) {
      const type = node.shape === NodeShape.ACTOR ? 'actor' : 'participant'
      lines.push(`  ${type} ${sanitizeLabel(node.label) || sanitizeId(node.id)}`)
    }
    for (const edge of diagram.edges) {
      if (!edge.sourceId || !edge.targetId) continue
      const src = diagram.nodes.find(n => n.id === edge.sourceId)
      const tgt = diagram.nodes.find(n => n.id === edge.targetId)
      if (!src || !tgt) continue
      const srcLabel = sanitizeLabel(src.label) || sanitizeId(src.id)
      const tgtLabel = sanitizeLabel(tgt.label) || sanitizeId(tgt.id)
      const arrow = edge.style.dashed ? '-->>' : '->>'
      const label = edge.label || ' '
      lines.push(`  ${srcLabel} ${arrow} ${tgtLabel}: ${sanitizeLabel(label)}`)
    }
    return lines.join('\n')
  }

  private emitClassDiagram(diagram: IRDiagram): string {
    const lines: string[] = ['classDiagram']
    for (const node of diagram.nodes) {
      const name = sanitizeLabel(node.label) || sanitizeId(node.id)
      lines.push(`  class ${name}`)
    }
    for (const edge of diagram.edges) {
      if (!edge.sourceId || !edge.targetId) continue
      const src = diagram.nodes.find(n => n.id === edge.sourceId)
      const tgt = diagram.nodes.find(n => n.id === edge.targetId)
      if (!src || !tgt) continue
      const srcName = sanitizeLabel(src.label) || sanitizeId(src.id)
      const tgtName = sanitizeLabel(tgt.label) || sanitizeId(tgt.id)
      const label = edge.label ? ` : ${sanitizeLabel(edge.label)}` : ''
      lines.push(`  ${srcName} --> ${tgtName}${label}`)
    }
    return lines.join('\n')
  }
}
