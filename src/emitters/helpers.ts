export function sanitizeId(id: string): string {
  return `n${id.replace(/[^a-zA-Z0-9]/g, '_')}`
}

export function sanitizeLabel(label: string): string {
  return label.replace(/"/g, "'").replace(/\n/g, ' ')
}
