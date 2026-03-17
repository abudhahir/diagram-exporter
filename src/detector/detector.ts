import { IRDiagram, DiagramType, NodeShape } from '../ir/types'

const FLOWCHART_SHAPES = new Set([
  NodeShape.RECTANGLE,
  NodeShape.DIAMOND,
  NodeShape.TERMINAL,
  NodeShape.DOCUMENT,
  NodeShape.CYLINDER,
  NodeShape.PARALLELOGRAM,
])

const SEQUENCE_SHAPES = new Set([
  NodeShape.LIFELINE,
  NodeShape.ACTIVATION,
  NodeShape.ACTOR,
])

const CLASS_SHAPES = new Set([
  NodeShape.CLASS_BOX,
  NodeShape.INTERFACE_BOX,
  NodeShape.ENUM_BOX,
])

export function detect(diagram: IRDiagram): DiagramType {
  let sequenceScore = 0
  let classScore = 0

  for (const node of diagram.nodes) {
    if (SEQUENCE_SHAPES.has(node.shape)) sequenceScore++
    else if (CLASS_SHAPES.has(node.shape)) classScore++
  }

  // Sequence and class are specific — a single marker is sufficient
  if (sequenceScore >= 1) return DiagramType.SEQUENCE
  if (classScore >= 1) return DiagramType.CLASS_DIAGRAM
  // Flowchart is the default
  return DiagramType.FLOWCHART
}
