import os from 'node:os'
import path from 'node:path'

/**
 * The XDG spec treats an empty or relative XDG_DATA_HOME as unset. Anything else would
 * resolve against the working directory and open a fresh database there.
 */
function absolute(directory: string | undefined): string | undefined {
  return directory && path.isAbsolute(directory) ? directory : undefined
}

/**
 * Shared by the server and explicit history maintenance commands. Jevcode never adopts
 * TasteCode's database: the two apps keep separate histories on the same machine.
 */
export function storeLocation(env: NodeJS.ProcessEnv = process.env): string {
  const override = env['HARNESS_DATA_DIR']
  if (override) return path.join(override, 'jevcode.db')
  const home = os.homedir()
  const base =
    process.platform === 'win32'
      ? (absolute(env['APPDATA']) ?? path.join(home, 'AppData', 'Roaming'))
      : process.platform === 'darwin'
        ? path.join(home, 'Library', 'Application Support')
        : (absolute(env['XDG_DATA_HOME']) ?? path.join(home, '.local', 'share'))
  return path.join(base, 'Jevcode', 'jevcode.db')
}
