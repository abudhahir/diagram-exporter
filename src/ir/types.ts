export enum DiagramType {
  FLOWCHART = 'FLOWCHART',
  SEQUENCE = 'SEQUENCE',
  CLASS_DIAGRAM = 'CLASS_DIAGRAM',
  UNKNOWN = 'UNKNOWN',
}

export enum NodeShape {
  RECTANGLE = 'RECTANGLE',
  DIAMOND = 'DIAMOND',
  CIRCLE = 'CIRCLE',
  CYLINDER = 'CYLINDER',
  PARALLELOGRAM = 'PARALLELOGRAM',
  TERMINAL = 'TERMINAL',
  DOCUMENT = 'DOCUMENT',
  ACTOR = 'ACTOR',
  LIFELINE = 'LIFELINE',
  ACTIVATION = 'ACTIVATION',
  CLASS_BOX = 'CLASS_BOX',
  INTERFACE_BOX = 'INTERFACE_BOX',
  ENUM_BOX = 'ENUM_BOX',
}

export enum ArrowType {
  NONE = 'NONE',
  OPEN = 'OPEN',
  FILLED = 'FILLED',
}

export interface IRStyle {
  fillColor: string
  strokeColor: string
  fontColor: string
  strokeWidth: number
  dashed: boolean
  opacity: number
  fontSize: number
}

export interface IRBounds {
  x: number
  y: number
  width: number
  height: number
  rotation: number
}

export interface IRPoint {
  x: number
  y: number
}

export interface IRNode {
  id: string
  shape: NodeShape
  label: string
  style: IRStyle
  bounds: IRBounds
  children: IRNode[]
  groupIds: string[]
}

export interface IREdge {
  id: string
  sourceId: string | null
  targetId: string | null
  label: string
  style: IRStyle
  startArrow: ArrowType
  endArrow: ArrowType
  waypoints: IRPoint[]
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
}

export interface IRDiagram {
  title: string
  type: DiagramType
  nodes: IRNode[]
  edges: IREdge[]
  width: number
  height: number
  background: string
}
