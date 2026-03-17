import { describe, it, expect } from 'vitest'
import * as path from 'path'
import * as fs from 'fs'
import { convert } from '../src/index'

const FIXTURES = path.resolve(__dirname, 'fixtures')

const fixtures = ['flowchart', 'sequence', 'class-diagram'] as const
const formats = ['drawio', 'mermaid', 'plantuml'] as const

for (const fixture of fixtures) {
  for (const format of formats) {
    it(`${fixture} → ${format} matches snapshot`, () => {
      const inputPath = path.join(FIXTURES, `${fixture}.gliffy`)
      const rawJson = fs.readFileSync(inputPath, 'utf-8')
      const result = convert(rawJson, format)
      expect(result.output).toMatchSnapshot()
    })
  }
}
