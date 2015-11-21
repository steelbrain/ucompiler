'use babel'

import FS from 'fs'
import Path from 'path'
import Minimatch from 'minimatch'
import Glob from 'glob'

const DEFAULT_CONFIG = {
  plugins: [],
  rules: []
}

/** Finding Helpers */

export function findFile(root, fileName) {
  try {
    FS.accessSync(root, FS.R_OK)
  } catch (_) {
    throw new Error('Can not read root directory')
  }
  const chunks = root.split(Path.sep)
  if (chunks[0] === '') {
    chunks.shift()
  }
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
    const stat = FS.statSync(absPath)
    if (stat.isFile()) {
      return [absPath]
    } else if (stat.isDirectory()) {
      let files = []
      FS.readdirSync(absPath).forEach(function(file) {
        const absFilePath = Path.join(absPath, file)
        const relativeFilePath = Path.relative(root, absFilePath)
        if (ignored.some(function(ignored) {
            return Minimatch(relativeFilePath, ignored)
          })) {
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
            files.push(relativeFilePath)
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

/** Config Helper */

export function getConfig(path) {
  let config
  let stat
  let root
  try {
    stat = FS.statSync(path)
  } catch (_) {
    throw new Error(`Error reading ${path}`)
  }
  if (!stat.isFile() && !stat.isDirectory()) {
    throw new Error(`${path} is neither a file nor a directory`)
  }
  root = stat.isFile() ? Path.dirname(path) : path
  const configFile = findFile(root, '.ucompilerrc')
  if (configFile !== null) {
    try {
      config = JSON.parse(FS.readFileSync(configFile, {encoding: 'utf8'}))
    } catch (e) {
      throw new Error(`Malformed configuration file located at ${configFile}`)
    }
    root = Path.dirname(configFile)
  } else config = {}
  return Object.assign({root}, DEFAULT_CONFIG, config)
}

/** Saving Helper */

export function saveFile({contents, file, config}) {
  console.log(contents)
}
