export interface GliffyShapeGraphic {
  tid?: string
  strokeWidth?: number
  strokeColor?: string
  fillColor?: string
  opacity?: number
  dashStyle?: string | null
  gradient?: boolean
  dropShadow?: boolean
}

export interface GliffyLineGraphic {
  strokeWidth?: number
  strokeColor?: string
  dashStyle?: string | null
  startArrow?: number
  endArrow?: number
  ortho?: boolean
  controlPath?: Array<[number, number]>
}

export interface GliffyTextGraphic {
  html?: string
  valign?: string
  overflow?: string
  vposition?: string
  hposition?: string
}

export type GliffyGraphicType = 'Shape' | 'Line' | 'Text' | 'Image' | 'Svg' | 'Mindmap'

export interface GliffyGraphic {
  type: GliffyGraphicType
  Shape?: GliffyShapeGraphic
  Line?: GliffyLineGraphic
  Text?: GliffyTextGraphic
}

export interface GliffyConstraintPoint {
  nodeId: number
  px: number
  py: number
}

export interface GliffyConstraints {
  startConstraint?: { StartPositionConstraint: GliffyConstraintPoint }
  endConstraint?: { EndPositionConstraint: GliffyConstraintPoint }
}

export interface GliffyObject {
  id: number
  uid: string | null
  x: number
  y: number
  width: number
  height: number
  rotation: number
  order: number | string
  graphic: GliffyGraphic | null
  children: GliffyObject[] | null
  constraints: GliffyConstraints | null
  layerId?: string
  linkMap?: unknown[]
}

export interface GliffyStage {
  background?: string
  width: number
  height: number
  nodeIndex?: number
  objects: GliffyObject[]
}

export interface GliffyDiagram {
  contentType: string
  version?: string
  metadata?: { title?: string }
  stage: GliffyStage
}
