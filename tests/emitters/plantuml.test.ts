import { describe, it, expect } from 'vitest'
import { PlantUMLEmitter } from '../../src/emitters/plantuml'
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

describe('PlantUMLEmitter — flowchart', () => {
  const emitter = new PlantUMLEmitter()

  it('wraps output in @startuml / @enduml', () => {
    const diagram: IRDiagram = { title: 'T', type: DiagramType.FLOWCHART, nodes: [], edges: [], width: 800, height: 600, background: '#fff' }
    const output = emitter.emit(diagram)
    expect(output).toContain('@startuml')
    expect(output).toContain('@enduml')
  })

  it('emits rectangle for RECTANGLE node', () => {
    const diagram: IRDiagram = { title: 'T', type: DiagramType.FLOWCHART, nodes: [makeNode('1', NodeShape.RECTANGLE, 'Process')], edges: [], width: 800, height: 600, background: '#fff' }
    expect(emitter.emit(diagram)).toContain('rectangle')
    expect(emitter.emit(diagram)).toContain('"Process"')
  })

  it('emits database for CYLINDER node', () => {
    const diagram: IRDiagram = { title: 'T', type: DiagramType.FLOWCHART, nodes: [makeNode('1', NodeShape.CYLINDER, 'DB')], edges: [], width: 800, height: 600, background: '#fff' }
    expect(emitter.emit(diagram)).toContain('database')
  })

  it('emits --> for solid edge', () => {
    const nodes = [makeNode('1', NodeShape.RECTANGLE, 'A'), makeNode('2', NodeShape.RECTANGLE, 'B')]
    const diagram: IRDiagram = { title: 'T', type: DiagramType.FLOWCHART, nodes, edges: [makeEdge('3', '1', '2')], width: 800, height: 600, background: '#fff' }
    expect(emitter.emit(diagram)).toContain('-->')
  })

  it('emits ..> for dashed edge', () => {
    const nodes = [makeNode('1', NodeShape.RECTANGLE, 'A'), makeNode('2', NodeShape.RECTANGLE, 'B')]
    const diagram: IRDiagram = { title: 'T', type: DiagramType.FLOWCHART, nodes, edges: [makeEdge('3', '1', '2', '', true)], width: 800, height: 600, background: '#fff' }
    expect(emitter.emit(diagram)).toContain('..>')
  })

  it('emits edge label', () => {
    const nodes = [makeNode('1', NodeShape.RECTANGLE, 'A'), makeNode('2', NodeShape.RECTANGLE, 'B')]
    const diagram: IRDiagram = { title: 'T', type: DiagramType.FLOWCHART, nodes, edges: [makeEdge('3', '1', '2', 'calls')], width: 800, height: 600, background: '#fff' }
    expect(emitter.emit(diagram)).toContain(': calls')
  })
})

describe('PlantUMLEmitter — sequence', () => {
  const emitter = new PlantUMLEmitter()

  it('emits participant for LIFELINE', () => {
    const diagram: IRDiagram = { title: 'T', type: DiagramType.SEQUENCE, nodes: [makeNode('1', NodeShape.LIFELINE, 'Alice')], edges: [], width: 800, height: 600, background: '#fff' }
    expect(emitter.emit(diagram)).toContain('participant "Alice"')
  })

  it('emits actor for ACTOR', () => {
    const diagram: IRDiagram = { title: 'T', type: DiagramType.SEQUENCE, nodes: [makeNode('1', NodeShape.ACTOR, 'User')], edges: [], width: 800, height: 600, background: '#fff' }
    expect(emitter.emit(diagram)).toContain('actor "User"')
  })

  it('emits message arrow', () => {
    const nodes = [makeNode('1', NodeShape.LIFELINE, 'Alice'), makeNode('2', NodeShape.LIFELINE, 'Bob')]
    const edges = [makeEdge('3', '1', '2', 'request')]
    const diagram: IRDiagram = { title: 'T', type: DiagramType.SEQUENCE, nodes, edges, width: 800, height: 600, background: '#fff' }
    const output = emitter.emit(diagram)
    expect(output).toContain('n1 -> n2')
    expect(output).toContain(': request')
  })
})

describe('PlantUMLEmitter — class diagram', () => {
  const emitter = new PlantUMLEmitter()

  it('emits class keyword for CLASS_BOX', () => {
    const diagram: IRDiagram = { title: 'T', type: DiagramType.CLASS_DIAGRAM, nodes: [makeNode('1', NodeShape.CLASS_BOX, 'Animal')], edges: [], width: 800, height: 600, background: '#fff' }
    expect(emitter.emit(diagram)).toContain('class "Animal" as n1')
  })

  it('emits interface keyword for INTERFACE_BOX', () => {
    const diagram: IRDiagram = { title: 'T', type: DiagramType.CLASS_DIAGRAM, nodes: [makeNode('1', NodeShape.INTERFACE_BOX, 'Runnable')], edges: [], width: 800, height: 600, background: '#fff' }
    expect(emitter.emit(diagram)).toContain('interface "Runnable" as n1')
  })

  it('emits enum keyword for ENUM_BOX', () => {
    const diagram: IRDiagram = { title: 'T', type: DiagramType.CLASS_DIAGRAM, nodes: [makeNode('1', NodeShape.ENUM_BOX, 'Status')], edges: [], width: 800, height: 600, background: '#fff' }
    expect(emitter.emit(diagram)).toContain('enum "Status" as n1')
  })

  it('emits relationship arrow', () => {
    const nodes = [makeNode('1', NodeShape.CLASS_BOX, 'Animal'), makeNode('2', NodeShape.CLASS_BOX, 'Dog')]
    const edges = [makeEdge('3', '1', '2')]
    const diagram: IRDiagram = { title: 'T', type: DiagramType.CLASS_DIAGRAM, nodes, edges, width: 800, height: 600, background: '#fff' }
    expect(emitter.emit(diagram)).toContain('n1 --> n2')
  })
})
