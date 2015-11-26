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

  const pathIsGlob = isGlob(path)
  const pathIsAbsolute = !pathIsGlob && Path.isAbsolute(path)

  if (!pathIsAbsolute && options.cwd === null) {
    throw new Error(ERROR_MESSAGE)
  }

  const searchPath = getDir(
    pathIsGlob ?
      options.cwd :
      pathIsAbsolute ?
        path :
        Path.join(options.cwd, path)
  )
  const configFile = findFile(searchPath, CONFIG_FILE_NAME)

  if (configFile === null) {
    return searchPath
  } else {
    return Path.dirname(configFile)
  }
}
