import { describe, it, expect } from 'vitest'
import { mapUidToShape } from '../../src/parser/shape-map'
import { NodeShape } from '../../src/ir/types'

describe('mapUidToShape', () => {
  it('maps flowchart decision UID to DIAMOND', () => {
    expect(mapUidToShape('com.gliffy.shape.flowchart.flowchart_v1.default.decision'))
      .toBe(NodeShape.DIAMOND)
  })

  it('maps flowchart process UID to RECTANGLE', () => {
    expect(mapUidToShape('com.gliffy.shape.flowchart.flowchart_v1.default.process'))
      .toBe(NodeShape.RECTANGLE)
  })

  it('maps flowchart terminator UID to TERMINAL', () => {
    expect(mapUidToShape('com.gliffy.shape.flowchart.flowchart_v1.default.terminator'))
      .toBe(NodeShape.TERMINAL)
  })

  it('maps flowchart database UID to CYLINDER', () => {
    expect(mapUidToShape('com.gliffy.shape.flowchart.flowchart_v1.default.database'))
      .toBe(NodeShape.CYLINDER)
  })

  it('maps UML sequence lifeline to LIFELINE', () => {
    expect(mapUidToShape('com.gliffy.shape.uml.uml_v2.sequence.lifeline'))
      .toBe(NodeShape.LIFELINE)
  })

  it('maps UML sequence actor to ACTOR', () => {
    expect(mapUidToShape('com.gliffy.shape.uml.uml_v2.sequence.actor'))
      .toBe(NodeShape.ACTOR)
  })

  it('maps UML class class to CLASS_BOX', () => {
    expect(mapUidToShape('com.gliffy.shape.uml.uml_v2.class.class'))
      .toBe(NodeShape.CLASS_BOX)
  })

  it('maps UML class interface to INTERFACE_BOX', () => {
    expect(mapUidToShape('com.gliffy.shape.uml.uml_v2.class.interface'))
      .toBe(NodeShape.INTERFACE_BOX)
  })

  it('returns RECTANGLE for unknown UID', () => {
    expect(mapUidToShape('com.unknown.shape.xyz')).toBe(NodeShape.RECTANGLE)
  })

  it('returns RECTANGLE for null UID', () => {
    expect(mapUidToShape(null)).toBe(NodeShape.RECTANGLE)
  })
})
