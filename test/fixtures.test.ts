/* eslint-disable no-new-func */
/* global __dirname */

import { transformSync } from '@babel/core'
import { expect } from 'chai'
import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { describe, it } from 'mocha'
import { join, relative } from 'path'

import plugin from '../src/index'

/**
 * Based on @babel/helper-plugin-test-runner, but works in mocha.
 */
describe('babel-plugin-transform-fake-error-class', function () {
  const fixturesDir = join(__dirname, 'fixtures')
  const fixtures = readdirSync(fixturesDir)

  for (const fixture of fixtures) {
    // Run plain files:
    const topPath = join(fixturesDir, fixture)
    const topSource = tryRead(topPath)
    if (topSource != null) {
      it(`${fixture} runs`, function () {
        const code = transformFile(topPath, topSource)
        new Function('expect', code)(expect)
      })
      continue
    }

    // Run exec.js files:
    const execPath = join(fixturesDir, fixture, 'exec.js')
    const execSource = tryRead(execPath)
    if (execSource != null) {
      it(`${fixture} runs`, function () {
        const code = transformFile(execPath, execSource)
        new Function('expect', code)(expect)
      })
    }

    // Compare input.js / output.js pairs:
    const inputPath = join(fixturesDir, fixture, 'input.js')
    const inputSource = tryRead(inputPath)
    if (inputSource != null) {
      it(`${fixture} matches`, function () {
        const code = transformFile(inputPath, inputSource)
        const outputPath = join(fixturesDir, fixture, 'output.js')
        const outputSource = tryRead(outputPath)

        if (outputSource != null) {
          if (code !== outputSource) {
            const shortPath = relative('', outputPath)
            const error = new Error(
              `The ${fixture} output does not match its snapshot. To update the snapshot, delete ${shortPath} and re-run the test.`
            ) as any
            error.actual = code
            error.expected = outputSource
            error.showDiff = true
            throw error
          }
        } else {
          writeFileSync(outputPath, code, 'utf8')
        }
      })
    }
  }
})

function tryRead(path: string): string | undefined {
  try {
    return readFileSync(path, 'utf8')
  } catch (e) {}
}

function transformFile(filename: string, source: string): string {
  const result = transformSync(source, {
    filename,
    plugins: [
      plugin,
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      '@babel/plugin-proposal-class-properties'
    ]
  })
  if (result == null || result.code == null) {
    throw new TypeError('No result')
  }
  return result.code + '\n'
}
