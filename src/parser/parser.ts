import { IRDiagram, IRNode, IREdge, IRStyle, DiagramType, ArrowType } from '../ir/types'
import { GliffyDiagram, GliffyObject, GliffyGraphic } from './gliffy-types'
import { mapUidToShape } from './shape-map'
import { extractLabel } from './label-extractor'

const DEFAULT_STYLE: IRStyle = {
  fillColor: '#ffffff',
  strokeColor: '#000000',
  fontColor: '#000000',
  strokeWidth: 1,
  dashed: false,
  opacity: 100,
  fontSize: 12,
}

function parseShapeStyle(graphic: GliffyGraphic): IRStyle {
  const s = graphic.Shape ?? {}
  return {
    fillColor: s.fillColor ?? DEFAULT_STYLE.fillColor,
    strokeColor: s.strokeColor ?? DEFAULT_STYLE.strokeColor,
    fontColor: DEFAULT_STYLE.fontColor,
    strokeWidth: s.strokeWidth ?? DEFAULT_STYLE.strokeWidth,
    dashed: !!s.dashStyle,
    opacity: s.opacity ?? DEFAULT_STYLE.opacity,
    fontSize: DEFAULT_STYLE.fontSize,
  }
}

function parseLineStyle(graphic: GliffyGraphic): IRStyle {
  const l = graphic.Line ?? {}
  return {
    ...DEFAULT_STYLE,
    strokeColor: l.strokeColor ?? DEFAULT_STYLE.strokeColor,
    strokeWidth: l.strokeWidth ?? DEFAULT_STYLE.strokeWidth,
    dashed: !!l.dashStyle,
  }
}

function extractTextLabel(obj: GliffyObject): string {
  if (obj.children) {
    for (const child of obj.children) {
      if (child.graphic?.type === 'Text' && child.graphic.Text?.html) {
        return extractLabel(child.graphic.Text.html)
      }
    }
  }
  if (obj.graphic?.type === 'Text' && obj.graphic.Text?.html) {
    return extractLabel(obj.graphic.Text.html)
  }
  return ''
}

function mapArrow(code: number | undefined): ArrowType {
  switch (code) {
    case 0: return ArrowType.NONE
    case 1: return ArrowType.OPEN
    case 2: return ArrowType.FILLED
    default: return ArrowType.NONE
  }
}

export function parse(input: string | GliffyDiagram): IRDiagram {
  const diagram: GliffyDiagram =
    typeof input === 'string' ? (JSON.parse(input) as GliffyDiagram) : input

  const stage = diagram.stage
  const nodeMap = new Map<number, IRNode>()
  const nodes: IRNode[] = []
  const edges: IREdge[] = []

  // Pass 1: shapes → nodes
  for (const obj of stage.objects) {
    if (!obj.graphic || obj.graphic.type !== 'Shape') continue
    const node: IRNode = {
      id: String(obj.id),
      shape: mapUidToShape(obj.uid),
      label: extractTextLabel(obj),
      style: parseShapeStyle(obj.graphic),
      bounds: {
        x: obj.x,
        y: obj.y,
        width: obj.width,
        height: obj.height,
        rotation: obj.rotation ?? 0,
      },
      children: [],
      groupIds: [],
    }
    nodeMap.set(obj.id, node)
    nodes.push(node)
  }

  // Pass 2: lines → edges
  for (const obj of stage.objects) {
    if (!obj.graphic || obj.graphic.type !== 'Line') continue
    const line = obj.graphic.Line ?? {}
    const constraints = obj.constraints

    const sourceConstraint = constraints?.startConstraint?.StartPositionConstraint
    const targetConstraint = constraints?.endConstraint?.EndPositionConstraint

    const edge: IREdge = {
      id: String(obj.id),
      sourceId: sourceConstraint ? String(sourceConstraint.nodeId) : null,
      targetId: targetConstraint ? String(targetConstraint.nodeId) : null,
      label: extractTextLabel(obj),
      style: parseLineStyle(obj.graphic),
      startArrow: mapArrow(line.startArrow),
      endArrow: mapArrow(line.endArrow),
      waypoints: (line.controlPath ?? []).map(([x, y]) => ({ x: obj.x + x, y: obj.y + y })),
      sourceX: sourceConstraint?.px ?? 0.5,
      sourceY: sourceConstraint?.py ?? 0.5,
      targetX: targetConstraint?.px ?? 0.5,
      targetY: targetConstraint?.py ?? 0.5,
    }
    edges.push(edge)
  }

  return {
    title: diagram.metadata?.title ?? 'Untitled',
    type: DiagramType.UNKNOWN,
    nodes,
    edges,
    width: stage.width,
    height: stage.height,
    background: stage.background ?? '#ffffff',
  }
}
