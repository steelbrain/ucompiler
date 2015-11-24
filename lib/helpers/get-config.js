'use babel'

import FS from 'fs'
import Path from 'path'
import {DEFAULT_CONFIG, CONFIG_FILE_NAME} from '../defaults'

export function getConfig(root) {
  const configPath = Path.join(root, CONFIG_FILE_NAME)

  let config = Object.assign({}, DEFAULT_CONFIG)
  try {
    FS.accessSync(configPath, FS.R_OK)
    const contents = FS.readFileSync(configPath)
    try {
      Object.assign(config, JSON.parse(contents))
    } catch (_) {
      throw new Error(`Malformed configuration file located at ${configPath}`)
    }
  } catch (_) {}

  return config
}
