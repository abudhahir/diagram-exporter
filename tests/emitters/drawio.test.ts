import { describe, it, expect } from 'vitest'
import { DrawioEmitter } from '../../src/emitters/drawio'
import { DiagramType, NodeShape, ArrowType } from '../../src/ir/types'
import type { IRDiagram } from '../../src/ir/types'

const simpleDiagram: IRDiagram = {
  title: 'My Diagram',
  type: DiagramType.FLOWCHART,
  width: 800,
  height: 600,
  background: '#ffffff',
  nodes: [
    {
      id: '1',
      shape: NodeShape.RECTANGLE,
      label: 'Start',
      style: { fillColor: '#dae8fc', strokeColor: '#6c8ebf', fontColor: '#000000', strokeWidth: 1, dashed: false, opacity: 100, fontSize: 12 },
      bounds: { x: 100, y: 50, width: 120, height: 60, rotation: 0 },
      children: [],
      groupIds: [],
    },
    {
      id: '2',
      shape: NodeShape.DIAMOND,
      label: 'Decision?',
      style: { fillColor: '#fff2cc', strokeColor: '#d6b656', fontColor: '#000000', strokeWidth: 1, dashed: false, opacity: 100, fontSize: 12 },
      bounds: { x: 100, y: 200, width: 120, height: 80, rotation: 0 },
      children: [],
      groupIds: [],
    },
  ],
  edges: [
    {
      id: '3',
      sourceId: '1',
      targetId: '2',
      label: 'yes',
      style: { fillColor: '#ffffff', strokeColor: '#555555', fontColor: '#000000', strokeWidth: 1, dashed: false, opacity: 100, fontSize: 12 },
      startArrow: ArrowType.NONE,
      endArrow: ArrowType.OPEN,
      waypoints: [],
      sourceX: 0.5, sourceY: 1.0,
      targetX: 0.5, targetY: 0.0,
    },
  ],
}

describe('DrawioEmitter', () => {
  const emitter = new DrawioEmitter()

  it('emits valid XML starting with mxfile', () => {
    const output = emitter.emit(simpleDiagram)
    expect(output).toContain('<mxfile')
    expect(output).toContain('</mxfile>')
  })

  it('includes a diagram element with the title', () => {
    const output = emitter.emit(simpleDiagram)
    expect(output).toContain('name="My Diagram"')
  })

  it('emits an mxCell for each node', () => {
    const output = emitter.emit(simpleDiagram)
    expect(output).toContain('id="s1"')
    expect(output).toContain('id="s2"')
  })

  it('emits node labels as value attributes', () => {
    const output = emitter.emit(simpleDiagram)
    expect(output).toContain('value="Start"')
    expect(output).toContain('value="Decision?"')
  })

  it('emits mxGeometry with correct coordinates for nodes', () => {
    const output = emitter.emit(simpleDiagram)
    expect(output).toContain('x="100" y="50" width="120" height="60"')
  })

  it('emits edge mxCell with source and target', () => {
    const output = emitter.emit(simpleDiagram)
    expect(output).toContain('source="s1"')
    expect(output).toContain('target="s2"')
  })

  it('emits edge label', () => {
    const output = emitter.emit(simpleDiagram)
    expect(output).toContain('value="yes"')
  })

  it('emits waypoints as Array element', () => {
    const withWaypoints: IRDiagram = {
      ...simpleDiagram,
      edges: [{
        ...simpleDiagram.edges[0],
        waypoints: [{ x: 150, y: 150 }],
      }],
    }
    const output = emitter.emit(withWaypoints)
    expect(output).toContain('<Array as="points">')
    expect(output).toContain('x="150" y="150"')
  })

  it('escapes XML special characters in labels', () => {
    const withSpecialChars: IRDiagram = {
      ...simpleDiagram,
      nodes: [{ ...simpleDiagram.nodes[0], label: 'A & B <test>' }],
      edges: [],
    }
    const output = emitter.emit(withSpecialChars)
    expect(output).toContain('value="A &amp; B &lt;test&gt;"')
  })
})
