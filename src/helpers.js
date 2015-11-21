'use babel'

import FS from 'fs'
import Path from 'path'

const DEFAULT_CONFIG = {
  plugins: []
}

export function findConfigFile(root, configFile = '.urc') {
  try {
    FS.accessSync(root, FS.R_OK)
  } catch (_) {
    throw new Error('Can not read root directory')
  }
  const chunks = root.split(Path.sep)
  while (chunks.length) {
    const configPath = Path.join(chunks.join(Path.sep), configFile)
    try {
      FS.accessSync(configPath, FS.R_OK)
      return configPath
    } catch (_) {}
    chunks.pop()
  }
  return null
}

export function getConfig(root) {
  let config
  const configFile = findConfigFile(root)
  if (configFile !== null) {
    try {
      config = JSON.parse(FS.readFileSync(configFile, {encoding: 'utf8'}))
    } catch (e) {
      throw new Error(`Malformed configuration file located at ${configFile}`)
    }
  } else config = {}
  return Object.assign({}, DEFAULT_CONFIG, config)
}
