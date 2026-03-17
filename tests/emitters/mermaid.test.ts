import { describe, it, expect } from 'vitest'
import { MermaidEmitter } from '../../src/emitters/mermaid'
import { DiagramType, NodeShape, ArrowType } from '../../src/ir/types'
import type { IRDiagram, IRNode, IREdge } from '../../src/ir/types'

const baseStyle = { fillColor: '#fff', strokeColor: '#000', fontColor: '#000', strokeWidth: 1, dashed: false, opacity: 100, fontSize: 12 }
const baseBounds = { x: 0, y: 0, width: 100, height: 60, rotation: 0 }

function makeNode(id: string, shape: NodeShape, label: string): IRNode {
  return { id, shape, label, style: baseStyle, bounds: baseBounds, children: [], groupIds: [] }
}

function makeEdge(id: string, sourceId: string, targetId: string, label = '', dashed = false): IREdge {
  return { id, sourceId, targetId, label, style: { ...baseStyle, dashed }, startArrow: ArrowType.NONE, endArrow: ArrowType.OPEN, waypoints: [], sourceX: 0.5, sourceY: 1, targetX: 0.5, targetY: 0 }
}

describe('MermaidEmitter — flowchart', () => {
  const emitter = new MermaidEmitter()

  it('emits flowchart TD header', () => {
    const diagram: IRDiagram = { title: 'T', type: DiagramType.FLOWCHART, nodes: [], edges: [], width: 800, height: 600, background: '#fff' }
    expect(emitter.emit(diagram)).toContain('flowchart TD')
  })

  it('emits RECTANGLE node with square brackets', () => {
    const diagram: IRDiagram = { title: 'T', type: DiagramType.FLOWCHART, nodes: [makeNode('1', NodeShape.RECTANGLE, 'Do Something')], edges: [], width: 800, height: 600, background: '#fff' }
    expect(emitter.emit(diagram)).toContain('[Do Something]')
  })

  it('emits DIAMOND node with curly braces', () => {
    const diagram: IRDiagram = { title: 'T', type: DiagramType.FLOWCHART, nodes: [makeNode('1', NodeShape.DIAMOND, 'Is Valid?')], edges: [], width: 800, height: 600, background: '#fff' }
    expect(emitter.emit(diagram)).toContain('{Is Valid?}')
  })

  it('emits CIRCLE node with double parentheses', () => {
    const diagram: IRDiagram = { title: 'T', type: DiagramType.FLOWCHART, nodes: [makeNode('1', NodeShape.CIRCLE, 'End')], edges: [], width: 800, height: 600, background: '#fff' }
    expect(emitter.emit(diagram)).toContain('((End))')
  })

  it('emits CYLINDER node with database syntax', () => {
    const diagram: IRDiagram = { title: 'T', type: DiagramType.FLOWCHART, nodes: [makeNode('1', NodeShape.CYLINDER, 'DB')], edges: [], width: 800, height: 600, background: '#fff' }
    expect(emitter.emit(diagram)).toContain('[(DB)]')
  })

  it('emits an edge with arrow', () => {
    const nodes = [makeNode('1', NodeShape.RECTANGLE, 'A'), makeNode('2', NodeShape.RECTANGLE, 'B')]
    const edges = [makeEdge('3', '1', '2')]
    const diagram: IRDiagram = { title: 'T', type: DiagramType.FLOWCHART, nodes, edges, width: 800, height: 600, background: '#fff' }
    const output = emitter.emit(diagram)
    expect(output).toContain('-->')
    expect(output).toContain('n1')
    expect(output).toContain('n2')
  })

  it('emits a dashed edge', () => {
    const nodes = [makeNode('1', NodeShape.RECTANGLE, 'A'), makeNode('2', NodeShape.RECTANGLE, 'B')]
    const edges = [makeEdge('3', '1', '2', '', true)]
    const diagram: IRDiagram = { title: 'T', type: DiagramType.FLOWCHART, nodes, edges, width: 800, height: 600, background: '#fff' }
    expect(emitter.emit(diagram)).toContain('-.->')
  })

  it('emits edge label', () => {
    const nodes = [makeNode('1', NodeShape.RECTANGLE, 'A'), makeNode('2', NodeShape.RECTANGLE, 'B')]
    const edges = [makeEdge('3', '1', '2', 'yes')]
    const diagram: IRDiagram = { title: 'T', type: DiagramType.FLOWCHART, nodes, edges, width: 800, height: 600, background: '#fff' }
    expect(emitter.emit(diagram)).toContain('|yes|')
  })
})

describe('MermaidEmitter — sequence', () => {
  const emitter = new MermaidEmitter()

  it('emits sequenceDiagram header', () => {
    const diagram: IRDiagram = { title: 'T', type: DiagramType.SEQUENCE, nodes: [makeNode('1', NodeShape.LIFELINE, 'Alice')], edges: [], width: 800, height: 600, background: '#fff' }
    expect(emitter.emit(diagram)).toContain('sequenceDiagram')
  })

  it('emits participant for LIFELINE nodes', () => {
    const diagram: IRDiagram = { title: 'T', type: DiagramType.SEQUENCE, nodes: [makeNode('1', NodeShape.LIFELINE, 'Alice')], edges: [], width: 800, height: 600, background: '#fff' }
    expect(emitter.emit(diagram)).toContain('participant Alice')
  })

  it('emits actor for ACTOR nodes', () => {
    const diagram: IRDiagram = { title: 'T', type: DiagramType.SEQUENCE, nodes: [makeNode('1', NodeShape.ACTOR, 'User')], edges: [], width: 800, height: 600, background: '#fff' }
    expect(emitter.emit(diagram)).toContain('actor User')
  })

  it('emits message arrow between participants', () => {
    const nodes = [makeNode('1', NodeShape.LIFELINE, 'Alice'), makeNode('2', NodeShape.LIFELINE, 'Bob')]
    const edges = [makeEdge('3', '1', '2', 'hello')]
    const diagram: IRDiagram = { title: 'T', type: DiagramType.SEQUENCE, nodes, edges, width: 800, height: 600, background: '#fff' }
    const output = emitter.emit(diagram)
    expect(output).toContain('Alice ->> Bob: hello')
  })
})

describe('MermaidEmitter — class diagram', () => {
  const emitter = new MermaidEmitter()

  it('emits classDiagram header', () => {
    const diagram: IRDiagram = { title: 'T', type: DiagramType.CLASS_DIAGRAM, nodes: [makeNode('1', NodeShape.CLASS_BOX, 'Animal')], edges: [], width: 800, height: 600, background: '#fff' }
    expect(emitter.emit(diagram)).toContain('classDiagram')
  })

  it('emits class declaration', () => {
    const diagram: IRDiagram = { title: 'T', type: DiagramType.CLASS_DIAGRAM, nodes: [makeNode('1', NodeShape.CLASS_BOX, 'Animal')], edges: [], width: 800, height: 600, background: '#fff' }
    expect(emitter.emit(diagram)).toContain('class Animal')
  })

  it('emits relationship between classes', () => {
    const nodes = [makeNode('1', NodeShape.CLASS_BOX, 'Animal'), makeNode('2', NodeShape.CLASS_BOX, 'Dog')]
    const edges = [makeEdge('3', '1', '2', 'extends')]
    const diagram: IRDiagram = { title: 'T', type: DiagramType.CLASS_DIAGRAM, nodes, edges, width: 800, height: 600, background: '#fff' }
    const output = emitter.emit(diagram)
    expect(output).toContain('Animal --> Dog')
    expect(output).toContain(': extends')
  })
})
