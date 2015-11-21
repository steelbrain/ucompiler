'use babel'

import FS from 'fs'
import Path from 'path'

const DEFAULT_CONFIG = {
  plugins: []
}

/** Finding Helpers */

export function findFile(root, fileName) {
  try {
    FS.accessSync(root, FS.R_OK)
  } catch (_) {
    throw new Error('Can not read root directory')
  }
  const chunks = root.split(Path.sep)
  while (chunks.length) {
    const filePath = Path.join(chunks.join(Path.sep), fileName)
    try {
      FS.accessSync(filePath, FS.R_OK)
      return filePath
    } catch (_) {}
    chunks.pop()
  }
  return null
}

/** Config Helpers */

export function getConfig(root) {
  let config
  const configFile = findFile(root, '.ucompilerrc')
  if (configFile !== null) {
    try {
      config = JSON.parse(FS.readFileSync(configFile, {encoding: 'utf8'}))
    } catch (e) {
      throw new Error(`Malformed configuration file located at ${configFile}`)
    }
  } else config = {}
  return Object.assign({root}, DEFAULT_CONFIG, config)
}
