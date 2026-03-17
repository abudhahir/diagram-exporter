import { IRDiagram, IRNode, IREdge, IRStyle, NodeShape } from '../ir/types'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function nodeShapeToDrawio(shape: NodeShape): string {
  switch (shape) {
    case NodeShape.DIAMOND: return 'rhombus;'
    case NodeShape.CIRCLE: return 'ellipse;'
    case NodeShape.CYLINDER: return 'shape=cylinder;'
    case NodeShape.TERMINAL: return 'rounded=1;'
    case NodeShape.DOCUMENT: return 'shape=document;'
    case NodeShape.PARALLELOGRAM: return 'shape=parallelogram;'
    case NodeShape.LIFELINE: return 'shape=mxgraph.uml.lifeline;'
    case NodeShape.ACTOR: return 'shape=mxgraph.uml.actor;'
    case NodeShape.ACTIVATION: return 'shape=mxgraph.uml.activation;'
    case NodeShape.CLASS_BOX: return 'shape=table;'
    case NodeShape.INTERFACE_BOX: return 'shape=table;'
    case NodeShape.ENUM_BOX: return 'shape=table;'
    default: return 'rounded=0;'
  }
}

function buildNodeStyle(node: IRNode): string {
  const s = node.style
  return [
    nodeShapeToDrawio(node.shape),
    `fillColor=${s.fillColor}`,
    `strokeColor=${s.strokeColor}`,
    `fontColor=${s.fontColor}`,
    `strokeWidth=${s.strokeWidth}`,
    `dashed=${s.dashed ? '1' : '0'}`,
    `opacity=${s.opacity}`,
    `fontSize=${s.fontSize}`,
    'whiteSpace=wrap',
    'html=1',
  ].join(';') + ';'
}

function buildEdgeStyle(edge: IREdge): string {
  const s = edge.style
  return [
    'edgeStyle=orthogonalEdgeStyle',
    `strokeColor=${s.strokeColor}`,
    `strokeWidth=${s.strokeWidth}`,
    `dashed=${s.dashed ? '1' : '0'}`,
    `endArrow=${edge.endArrow.toLowerCase()}`,
    `startArrow=${edge.startArrow.toLowerCase()}`,
    'html=1',
  ].join(';') + ';'
}

export class DrawioEmitter {
  emit(diagram: IRDiagram): string {
    const cells: string[] = []
    cells.push('<mxCell id="0"/>')
    cells.push('<mxCell id="1" parent="0"/>')

    for (const node of diagram.nodes) {
      const b = node.bounds
      cells.push(
        `<mxCell id="${escapeXml(node.id)}" value="${escapeXml(node.label)}" ` +
        `style="${buildNodeStyle(node)}" vertex="1" parent="1">` +
        `<mxGeometry x="${b.x}" y="${b.y}" width="${b.width}" height="${b.height}" as="geometry"/>` +
        `</mxCell>`
      )
    }

    for (const edge of diagram.edges) {
      const waypointXml = edge.waypoints.length > 0
        ? `<Array as="points">${edge.waypoints.map(p => `<mxPoint x="${p.x}" y="${p.y}"/>`).join('')}</Array>`
        : ''
      const sourceAttr = edge.sourceId ? ` source="${escapeXml(edge.sourceId)}"` : ''
      const targetAttr = edge.targetId ? ` target="${escapeXml(edge.targetId)}"` : ''
      cells.push(
        `<mxCell id="${escapeXml(edge.id)}" value="${escapeXml(edge.label)}" ` +
        `style="${buildEdgeStyle(edge)}" edge="1"${sourceAttr}${targetAttr} parent="1">` +
        `<mxGeometry relative="1" as="geometry">${waypointXml}</mxGeometry>` +
        `</mxCell>`
      )
    }

    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<mxfile host="dex">',
      `  <diagram id="diagram-1" name="${escapeXml(diagram.title)}">`,
      `    <mxGraphModel pageWidth="${diagram.width}" pageHeight="${diagram.height}" background="${diagram.background}">`,
      '      <root>',
      ...cells.map(c => `        ${c}`),
      '      </root>',
      '    </mxGraphModel>',
      '  </diagram>',
      '</mxfile>',
    ].join('\n')
  }
}
