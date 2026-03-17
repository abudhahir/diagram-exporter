export function extractLabel(html: string | undefined): string {
  if (!html) return ''
  return html.replace(/<[^>]+>/g, '').trim()
}
