import { describe, it, expect } from 'vitest'
import { parse } from '../../src/parser/parser'
import { NodeShape, DiagramType, ArrowType } from '../../src/ir/types'
import singleShape from './fixtures/single-shape.json'
import shapeWithEdge from './fixtures/shape-with-edge.json'

describe('parse — nodes', () => {
  it('parses a single shape node from a Gliffy object', () => {
    const diagram = parse(singleShape)
    expect(diagram.nodes).toHaveLength(1)
    expect(diagram.edges).toHaveLength(0)
  })

  it('maps diagram metadata correctly', () => {
    const diagram = parse(singleShape)
    expect(diagram.title).toBe('Test Diagram')
    expect(diagram.width).toBe(800)
    expect(diagram.height).toBe(600)
    expect(diagram.background).toBe('#ffffff')
    expect(diagram.type).toBe(DiagramType.UNKNOWN)
  })

  it('maps shape properties to IR node', () => {
    const diagram = parse(singleShape)
    const node = diagram.nodes[0]
    expect(node.id).toBe('1')
    expect(node.shape).toBe(NodeShape.RECTANGLE)
    expect(node.label).toBe('Do Something')
    expect(node.bounds.x).toBe(100)
    expect(node.bounds.y).toBe(50)
    expect(node.bounds.width).toBe(120)
    expect(node.bounds.height).toBe(60)
    expect(node.bounds.rotation).toBe(0)
  })

  it('maps style from Shape graphic', () => {
    const diagram = parse(singleShape)
    const node = diagram.nodes[0]
    expect(node.style.strokeWidth).toBe(2)
    expect(node.style.strokeColor).toBe('#ff0000')
    expect(node.style.fillColor).toBe('#dae8fc')
    expect(node.style.opacity).toBe(80)
    expect(node.style.dashed).toBe(false)
  })

  it('accepts a raw JSON string as input', () => {
    const diagram = parse(JSON.stringify(singleShape))
    expect(diagram.nodes).toHaveLength(1)
  })

  it('ignores child Text objects — they are not standalone nodes', () => {
    const diagram = parse(singleShape)
    expect(diagram.nodes.find(n => n.id === '2')).toBeUndefined()
  })
})

describe('parse — edges', () => {
  it('parses a line as an IREdge', () => {
    const diagram = parse(shapeWithEdge)
    expect(diagram.nodes).toHaveLength(2)
    expect(diagram.edges).toHaveLength(1)
  })

  it('resolves edge sourceId and targetId from constraints', () => {
    const diagram = parse(shapeWithEdge)
    const edge = diagram.edges[0]
    expect(edge.sourceId).toBe('1')
    expect(edge.targetId).toBe('3')
  })

  it('maps edge arrow types', () => {
    const diagram = parse(shapeWithEdge)
    const edge = diagram.edges[0]
    expect(edge.startArrow).toBe(ArrowType.NONE)
    expect(edge.endArrow).toBe(ArrowType.OPEN)
  })

  it('maps edge px/py connection points', () => {
    const diagram = parse(shapeWithEdge)
    const edge = diagram.edges[0]
    expect(edge.sourceX).toBe(0.5)
    expect(edge.sourceY).toBe(1.0)
    expect(edge.targetX).toBe(0.5)
    expect(edge.targetY).toBe(0.0)
  })

  it('extracts edge label from child Text object', () => {
    const diagram = parse(shapeWithEdge)
    const edge = diagram.edges[0]
    expect(edge.label).toBe('yes')
  })

  it('maps controlPath to waypoints with absolute coordinates', () => {
    const diagram = parse(shapeWithEdge)
    const edge = diagram.edges[0]
    // controlPath [[0,0],[0,90]] + obj position x=160, y=110
    expect(edge.waypoints).toHaveLength(2)
    expect(edge.waypoints[0]).toEqual({ x: 160, y: 110 })
    expect(edge.waypoints[1]).toEqual({ x: 160, y: 200 })
  })

  it('sets null sourceId/targetId when no constraints', () => {
    const noConstraints = {
      ...shapeWithEdge,
      stage: {
        ...shapeWithEdge.stage,
        objects: [{ ...shapeWithEdge.stage.objects[2], constraints: null }]
      }
    }
    const diagram = parse(noConstraints)
    const edge = diagram.edges[0]
    expect(edge.sourceId).toBeNull()
    expect(edge.targetId).toBeNull()
  })
})
