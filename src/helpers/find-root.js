'use babel'

import Path from 'path'
import {getDir, findFile} from './common'

export function findRoot(path, options) {
  if (options.root !== null) {
    return options.root
  }

  const searchPath = getDir(path.indexOf('*') === -1 ? path : options.cwd)
  const configFile = findFile(searchPath, '.ucompilerrc')

  if (configFile === null) {
    return searchPath
  } else {
    return Path.dirname(configFile)
  }
}
