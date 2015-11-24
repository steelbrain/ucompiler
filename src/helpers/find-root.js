'use babel'

import Path from 'path'
import {getDir, findFile} from './common'
import {CONFIG_FILE_NAME} from '../defaults'
import isGlob from 'is-glob'

const ERROR_MESSAGE = 'Either of options.cwd or options.root is required'

export function findRoot(path, options) {
  if (options.root !== null) {
    return options.root
  } else if (path === null) {
    if (options.cwd === null) {
      throw new Error(ERROR_MESSAGE)
    } else return options.cwd
  }

  const isglob = isGlob(path)
  const isabsolute = !isglob && Path.isAbsolute(path)

  if (!isabsolute && options.cwd === null) {
    throw new Error(ERROR_MESSAGE)
  }

  let searchPath = getDir(isglob ? options.cwd : path)
  if (!isabsolute) {
    searchPath = Path.join(options.cwd, searchPath)
  }
  const configFile = findFile(searchPath, CONFIG_FILE_NAME)

  if (configFile === null) {
    return searchPath
  } else {
    return Path.dirname(configFile)
  }
}
