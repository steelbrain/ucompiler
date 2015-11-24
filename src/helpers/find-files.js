'use babel'

import FS from 'fs'
import Path from 'path'
import Minimatch from 'minimatch'
import isGlob from 'is-glob'
import {DEFAULT_IGNORED} from '../defaults'
import {isIgnored} from './common'

export function findFiles(pathGiven, ignoredGiven, options) {
  const ignored = DEFAULT_IGNORED.concat(ignoredGiven)

  if (isGlob(pathGiven)) {
    return findFilesGlob(pathGiven, ignored, options)
  } else {
    const path = Path.isAbsolute(pathGiven) ? pathGiven : Path.join(options.root, pathGiven)
    const stat = FS.statSync(path)

    if (stat.isFile()) {
      return [Path.relative(options.root, path)]
    } else if (stat.isDirectory()) {
      return findFilesRegular(path, ignored, options)
    } else {
      throw new Error(`${path} is neither a file nor a directory`)
    }
  }
}

export function findFilesBase(path, ignored, {root, config}, validateCallback) {
  let files = []

  // TODO: Only include files that are used in config
  FS.readdirSync(path).forEach(function(entryName) {
    const absolutePath = Path.join(path, entryName)
    const relativePath = Path.relative(root, absolutePath)
    const stat = FS.lstatSync(absolutePath)

    if (entryName.substr(0, 1) === '.' ||
        stat.isSymbolicLink() ||
        isIgnored(entryName, relativePath, ignored)) {
      return
    }

    if (validateCallback === null || validateCallback(relativePath, stat)) {
      if (stat.isDirectory()) {
        files = files.concat(findFilesBase(absolutePath, ignored, {root, config}, validateCallback))
      } else if (stat.isFile()) {
        files.push({relativePath, absolutePath, fileName: entryName})
      }
    }
  })

  return files
}

export function findFilesRegular(path, ignored, {root, config}) {
  return findFilesBase(path, ignored, {root, config}, null)
}

export function findFilesGlob(path, ignored, {root, config}) {
  return findFilesBase(root, ignored, {root, config}, function(relative, stat) {
    return stat.isDirectory() || Minimatch(relative, path)
  })
}
