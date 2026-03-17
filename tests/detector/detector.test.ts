import { describe, it, expect } from 'vitest'
import { detect } from '../../src/detector/detector'
import { DiagramType, NodeShape } from '../../src/ir/types'
import type { IRDiagram, IRNode } from '../../src/ir/types'

function makeNode(shape: NodeShape, id = '1'): IRNode {
  return {
    id,
    shape,
    label: '',
    style: { fillColor: '#fff', strokeColor: '#000', fontColor: '#000', strokeWidth: 1, dashed: false, opacity: 100, fontSize: 12 },
    bounds: { x: 0, y: 0, width: 100, height: 60, rotation: 0 },
    children: [],
    groupIds: [],
  }
}

function makeDiagram(nodes: IRNode[]): IRDiagram {
  return {
    title: 'Test',
    type: DiagramType.UNKNOWN,
    nodes,
    edges: [],
    width: 800,
    height: 600,
    background: '#ffffff',
  }
}

describe('detect', () => {
  it('classifies diagram with 2+ flowchart shapes as FLOWCHART', () => {
    const diagram = makeDiagram([
      makeNode(NodeShape.RECTANGLE, '1'),
      makeNode(NodeShape.DIAMOND, '2'),
    ])
    expect(detect(diagram)).toBe(DiagramType.FLOWCHART)
  })

  it('classifies diagram with TERMINAL shapes as FLOWCHART', () => {
    const diagram = makeDiagram([
      makeNode(NodeShape.TERMINAL, '1'),
      makeNode(NodeShape.RECTANGLE, '2'),
    ])
    expect(detect(diagram)).toBe(DiagramType.FLOWCHART)
  })

  it('classifies diagram with LIFELINE as SEQUENCE even if only 1 node', () => {
    const diagram = makeDiagram([makeNode(NodeShape.LIFELINE, '1')])
    expect(detect(diagram)).toBe(DiagramType.SEQUENCE)
  })

  it('classifies diagram with ACTOR as SEQUENCE', () => {
    const diagram = makeDiagram([
      makeNode(NodeShape.ACTOR, '1'),
      makeNode(NodeShape.LIFELINE, '2'),
    ])
    expect(detect(diagram)).toBe(DiagramType.SEQUENCE)
  })

  it('classifies diagram with CLASS_BOX as CLASS_DIAGRAM', () => {
    const diagram = makeDiagram([
      makeNode(NodeShape.CLASS_BOX, '1'),
      makeNode(NodeShape.CLASS_BOX, '2'),
    ])
    expect(detect(diagram)).toBe(DiagramType.CLASS_DIAGRAM)
  })

  it('classifies INTERFACE_BOX as CLASS_DIAGRAM', () => {
    const diagram = makeDiagram([makeNode(NodeShape.INTERFACE_BOX, '1')])
    expect(detect(diagram)).toBe(DiagramType.CLASS_DIAGRAM)
  })

  it('SEQUENCE wins over FLOWCHART when lifeline present', () => {
    const diagram = makeDiagram([
      makeNode(NodeShape.RECTANGLE, '1'),
      makeNode(NodeShape.RECTANGLE, '2'),
      makeNode(NodeShape.LIFELINE, '3'),
    ])
    expect(detect(diagram)).toBe(DiagramType.SEQUENCE)
  })

  it('SEQUENCE wins over CLASS_DIAGRAM when both markers present', () => {
    const diagram = makeDiagram([
      makeNode(NodeShape.CLASS_BOX, '1'),
      makeNode(NodeShape.LIFELINE, '2'),
    ])
    expect(detect(diagram)).toBe(DiagramType.SEQUENCE)
  })

  it('falls back to FLOWCHART for empty diagram', () => {
    const diagram = makeDiagram([])
    expect(detect(diagram)).toBe(DiagramType.FLOWCHART)
  })

  it('falls back to FLOWCHART for single unrecognised shape', () => {
    const diagram = makeDiagram([makeNode(NodeShape.CIRCLE, '1')])
    expect(detect(diagram)).toBe(DiagramType.FLOWCHART)
  })
})
