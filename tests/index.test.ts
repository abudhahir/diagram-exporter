import { describe, it, expect } from 'vitest'
import { convert } from '../src/index'
import { DiagramType } from '../src/ir/types'

const flowchartGliffy = JSON.stringify({
  contentType: 'application/gliffy+json',
  version: '1.3',
  metadata: { title: 'My Flow' },
  embeddedResources: { index: 0, resources: [] },
  stage: {
    background: '#ffffff',
    width: 800,
    height: 600,
    objects: [
      {
        id: 1, uid: 'com.gliffy.shape.flowchart.flowchart_v1.default.process',
        x: 100, y: 50, width: 120, height: 60, rotation: 0, order: 1,
        graphic: { type: 'Shape', Shape: { strokeWidth: 1, strokeColor: '#000', fillColor: '#fff', opacity: 100, dashStyle: null } },
        children: [{ id: 2, uid: null, x: 0, y: 0, width: 120, height: 60, rotation: 0, order: 'auto',
          graphic: { type: 'Text', Text: { html: '<p><span>Start</span></p>', valign: 'middle' } },
          children: null, constraints: null }],
        constraints: null,
      },
      {
        id: 3, uid: 'com.gliffy.shape.flowchart.flowchart_v1.default.decision',
        x: 100, y: 200, width: 120, height: 80, rotation: 0, order: 3,
        graphic: { type: 'Shape', Shape: { strokeWidth: 1, strokeColor: '#000', fillColor: '#fff', opacity: 100, dashStyle: null } },
        children: [], constraints: null,
      },
    ],
  },
})

describe('convert', () => {
  it('converts raw JSON string to drawio format', () => {
    const result = convert(flowchartGliffy, 'drawio')
    expect(result.output).toContain('<mxfile')
    expect(result.format).toBe('drawio')
  })

  it('auto-detects diagram type', () => {
    const result = convert(flowchartGliffy, 'mermaid')
    expect(result.detectedType).toBe(DiagramType.FLOWCHART)
  })

  it('converts raw JSON string to mermaid format', () => {
    const result = convert(flowchartGliffy, 'mermaid')
    expect(result.output).toContain('flowchart TD')
  })

  it('converts raw JSON string to plantuml format', () => {
    const result = convert(flowchartGliffy, 'plantuml')
    expect(result.output).toContain('@startuml')
  })

  it('respects diagramType override option', () => {
    const result = convert(flowchartGliffy, 'mermaid', { diagramType: DiagramType.CLASS_DIAGRAM })
    expect(result.detectedType).toBe(DiagramType.CLASS_DIAGRAM)
    expect(result.output).toContain('classDiagram')
  })

  it('returns empty warnings array for clean conversion', () => {
    const result = convert(flowchartGliffy, 'mermaid')
    expect(result.warnings).toEqual([])
  })
})
