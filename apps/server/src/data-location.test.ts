import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { storeLocation } from './data-location.js'

let root: string
beforeEach(() => {
  root = mkdtempSync(path.join(os.tmpdir(), 'jevcode-data-location-'))
})
afterEach(() => {
  rmSync(root, { recursive: true, force: true })
})

describe('database location', () => {
  it('keeps the database in an overridden data directory', () => {
    expect(storeLocation({ HARNESS_DATA_DIR: root })).toBe(path.join(root, 'jevcode.db'))
  })

  it('never adopts a TasteCode or PersonalHarness database', () => {
    writeFileSync(path.join(root, 'tastecode.db'), 'taste')
    writeFileSync(path.join(root, 'harness.db'), 'harness')
    mkdirSync(path.join(root, 'TasteCode'))
    writeFileSync(path.join(root, 'TasteCode', 'tastecode.db'), 'taste')

    expect(storeLocation({ HARNESS_DATA_DIR: root })).toBe(path.join(root, 'jevcode.db'))
    expect(storeLocation({ XDG_DATA_HOME: root, APPDATA: root })).toMatch(
      /Jevcode[\\/]jevcode\.db$/,
    )
    expect(existsSync(path.join(root, 'tastecode.db'))).toBe(true)
    expect(existsSync(path.join(root, 'harness.db'))).toBe(true)
    expect(existsSync(path.join(root, 'TasteCode', 'tastecode.db'))).toBe(true)
    expect(existsSync(path.join(root, 'jevcode.db'))).toBe(false)
  })
})

describe('default database location', () => {
  it.each(['', 'relative-data'])('ignores a %j platform data directory', (value) => {
    // XDG treats empty and relative XDG_DATA_HOME as unset; APPDATA gets the same
    // treatment so an exported but blank variable never lands in the working directory.
    const location = storeLocation({ XDG_DATA_HOME: value, APPDATA: value })
    expect(path.isAbsolute(location)).toBe(true)
    expect(location.startsWith(os.homedir())).toBe(true)
  })
})
