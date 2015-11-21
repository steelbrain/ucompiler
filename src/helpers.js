'use babel'

import FS from 'fs'
import Path from 'path'
import Glob from 'glob'

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

export function scanFiles(path, {root, ignored}) {
  if (path.indexOf('*') === -1) {
    // Non-Glob
    const absPath = Path.isAbsolute(path) ? path : Path.join(path, root)
    let stat = null
    try {
      stat = FS.statSync(absPath)
    } catch (_) {
      throw new Error(`Error reading ${absPath}`)
    }
    if (stat.isFile()) {
      return [absPath]
    } else if (stat.isDirectory()) {
      let files = []
      FS.readdirSync(absPath).forEach(function(file) {
        const absFilePath = Path.join(absPath, file)
        const relativeFilePath = Path.relative(absPath, absFilePath)
        if (ignored.indexOf(file) !== -1 || ignored.indexOf(absFilePath) !== -1 ||
            ignored.indexOf(relativeFilePath) !== -1
        ) {
          return
        }
        let stat
        try {
          stat = FS.lstatSync(absFilePath)
        } catch (_) {
          throw new Error(`Error reading ${absFilePath}`)
        }
        if (!stat.isSymbolicLink()) {
          if (stat.isFile()) {
            files.push(absFilePath)
          } else if (stat.isDirectory()) {
            files = files.concat(scanFiles(absFilePath, {root, ignored}))
          }
        }
      })
      return files
    } else return []
  } else {
    // Glob
    return Glob.sync(path, {root, ignore: ignored})
  }
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
