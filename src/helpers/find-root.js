'use babel'

import Path from 'path'
import {getDir, findFile} from './common'
import {CONFIG_FILE_NAME} from '../defaults'
import isGlob from 'is-glob'

export function findRoot(path, options) {
  if (options.root !== null) {
    return options.root
  }

  const searchPath = getDir(isGlob(path) ? options.cwd : path)
  const configFile = findFile(searchPath, CONFIG_FILE_NAME)

  if (configFile === null) {
    return searchPath
  } else {
    return Path.dirname(configFile)
  }
}
