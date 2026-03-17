import { describe, it, expect } from 'vitest'
import { DiagramType, NodeShape, ArrowType } from '../../src/ir/types'

describe('IR types', () => {
  it('DiagramType enum has expected values', () => {
    expect(DiagramType.FLOWCHART).toBe('FLOWCHART')
    expect(DiagramType.SEQUENCE).toBe('SEQUENCE')
    expect(DiagramType.CLASS_DIAGRAM).toBe('CLASS_DIAGRAM')
    expect(DiagramType.UNKNOWN).toBe('UNKNOWN')
  })

  it('NodeShape enum includes all required shapes', () => {
    expect(NodeShape.RECTANGLE).toBe('RECTANGLE')
    expect(NodeShape.DIAMOND).toBe('DIAMOND')
    expect(NodeShape.CIRCLE).toBe('CIRCLE')
    expect(NodeShape.CYLINDER).toBe('CYLINDER')
    expect(NodeShape.TERMINAL).toBe('TERMINAL')
    expect(NodeShape.DOCUMENT).toBe('DOCUMENT')
    expect(NodeShape.LIFELINE).toBe('LIFELINE')
    expect(NodeShape.ACTOR).toBe('ACTOR')
    expect(NodeShape.CLASS_BOX).toBe('CLASS_BOX')
  })

  it('ArrowType enum has expected values', () => {
    expect(ArrowType.NONE).toBe('NONE')
    expect(ArrowType.OPEN).toBe('OPEN')
    expect(ArrowType.FILLED).toBe('FILLED')
  })
})
