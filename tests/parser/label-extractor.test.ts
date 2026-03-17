import { describe, it, expect } from 'vitest'
import { extractLabel } from '../../src/parser/label-extractor'

describe('extractLabel', () => {
  it('returns empty string for undefined', () => {
    expect(extractLabel(undefined)).toBe('')
  })

  it('returns empty string for empty string', () => {
    expect(extractLabel('')).toBe('')
  })

  it('strips all HTML tags and returns plain text', () => {
    expect(extractLabel('<p><span>Hello</span></p>')).toBe('Hello')
  })

  it('strips styled span tags', () => {
    expect(extractLabel('<p style="text-align:center;"><span style="font-size: 14px;">Start</span></p>'))
      .toBe('Start')
  })

  it('preserves text content with nested tags', () => {
    expect(extractLabel('<p><b>Bold</b> text</p>')).toBe('Bold text')
  })

  it('trims whitespace', () => {
    expect(extractLabel('<p>  trimmed  </p>')).toBe('trimmed')
  })
})
