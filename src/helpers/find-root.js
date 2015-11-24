'use babel'

import Path from 'path'
import {getDir, findFile} from './common'
import {CONFIG_FILE_NAME} from '../defaults'
import isGlob from 'is-glob'

export function findRoot(path, options) {
  if (options.root !== null) {
    return options.root
  } else if (options.cwd === null) {
    throw new Error('Either of options.cwd or options.root is required')
  }

  let searchPath = getDir(isGlob(path) ? options.cwd : path)
  if (!Path.isAbsolute(searchPath)) {
    searchPath = Path.join(options.cwd, searchPath)
  }
  const configFile = findFile(searchPath, CONFIG_FILE_NAME)

  if (configFile === null) {
    return searchPath
  } else {
    return Path.dirname(configFile)
  }
}
