import { describe, it, expect } from 'vitest'
import { execSync } from 'child_process'
import * as path from 'path'
import * as fs from 'fs'

const FIXTURE = path.resolve(__dirname, 'fixtures/flowchart.gliffy')
const CLI = path.resolve(__dirname, '../src/cli.ts')

function runCli(args: string): string {
  return execSync(`npx tsx ${CLI} ${args}`, { encoding: 'utf-8' })
}

describe('CLI', () => {
  it('converts a file to mermaid via --format flag', () => {
    const output = runCli(`${FIXTURE} --format mermaid`)
    expect(output).toContain('flowchart TD')
  })

  it('converts a file to drawio via --format flag', () => {
    const output = runCli(`${FIXTURE} --format drawio`)
    expect(output).toContain('<mxfile')
  })

  it('converts a file to plantuml via --format flag', () => {
    const output = runCli(`${FIXTURE} --format plantuml`)
    expect(output).toContain('@startuml')
  })

  it('writes output to a file with --output flag', () => {
    const outFile = path.resolve(__dirname, 'tmp-output.md')
    try {
      runCli(`${FIXTURE} --format mermaid --output ${outFile}`)
      const content = fs.readFileSync(outFile, 'utf-8')
      expect(content).toContain('flowchart TD')
    } finally {
      fs.rmSync(outFile, { force: true })
    }
  })

  it('overrides diagram type with --type flag', () => {
    const output = runCli(`${FIXTURE} --format mermaid --type SEQUENCE`)
    expect(output).toContain('sequenceDiagram')
  })
})
