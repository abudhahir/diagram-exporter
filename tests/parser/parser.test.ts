import { describe, it, expect } from 'vitest'
import { parse } from '../../src/parser/parser'
import { NodeShape, DiagramType, ArrowType } from '../../src/ir/types'
import singleShape from './fixtures/single-shape.json'

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
