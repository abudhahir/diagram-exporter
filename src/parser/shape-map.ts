import { NodeShape } from '../ir/types'

const SHAPE_MAP: Record<string, NodeShape> = {
  // Basic shapes
  'com.gliffy.shape.basic.basic_v1.default.rectangle': NodeShape.RECTANGLE,
  'com.gliffy.shape.basic.basic_v1.default.circle': NodeShape.CIRCLE,
  'com.gliffy.shape.basic.basic_v1.default.diamond': NodeShape.DIAMOND,
  'com.gliffy.shape.basic.basic_v1.default.cylinder': NodeShape.CYLINDER,
  'com.gliffy.shape.basic.basic_v1.default.parallelogram': NodeShape.PARALLELOGRAM,
  // Flowchart shapes
  'com.gliffy.shape.flowchart.flowchart_v1.default.process': NodeShape.RECTANGLE,
  'com.gliffy.shape.flowchart.flowchart_v1.default.decision': NodeShape.DIAMOND,
  'com.gliffy.shape.flowchart.flowchart_v1.default.terminator': NodeShape.TERMINAL,
  'com.gliffy.shape.flowchart.flowchart_v1.default.document': NodeShape.DOCUMENT,
  'com.gliffy.shape.flowchart.flowchart_v1.default.database': NodeShape.CYLINDER,
  'com.gliffy.shape.flowchart.flowchart_v1.default.data': NodeShape.PARALLELOGRAM,
  'com.gliffy.shape.flowchart.flowchart_v1.default.start2': NodeShape.CIRCLE,
  'com.gliffy.shape.flowchart.flowchart_v1.default.end2': NodeShape.CIRCLE,
  // UML Sequence
  'com.gliffy.shape.uml.uml_v2.sequence.lifeline': NodeShape.LIFELINE,
  'com.gliffy.shape.uml.uml_v2.sequence.actor': NodeShape.ACTOR,
  'com.gliffy.shape.uml.uml_v2.sequence.activation': NodeShape.ACTIVATION,
  // UML Class
  'com.gliffy.shape.uml.uml_v2.class.class': NodeShape.CLASS_BOX,
  'com.gliffy.shape.uml.uml_v2.class.interface': NodeShape.INTERFACE_BOX,
  'com.gliffy.shape.uml.uml_v2.class.abstract_class': NodeShape.CLASS_BOX,
  'com.gliffy.shape.uml.uml_v2.class.enumeration': NodeShape.ENUM_BOX,
}

export function mapUidToShape(uid: string | null): NodeShape {
  if (!uid) return NodeShape.RECTANGLE
  return SHAPE_MAP[uid] ?? NodeShape.RECTANGLE
}
