'use babel'

import FS from 'fs'
import Path from 'path'
import Minimatch from 'minimatch'
import isGlob from 'is-glob'
import {DEFAULT_IGNORED} from '../defaults'
import {isIgnored} from './common'

export function findFiles(pathGiven, ignoredGiven, state) {
  const ignored = DEFAULT_IGNORED.concat(ignoredGiven)

  if (isGlob(pathGiven)) {
    return findFilesGlob(pathGiven, ignored, state)
  } else {
    const path = Path.isAbsolute(pathGiven) ? pathGiven : Path.join(state.root, pathGiven)
    const stat = FS.statSync(path)

    if (stat.isFile()) {
      return [Path.relative(state.root, path)]
    } else if (stat.isDirectory()) {
      return findFilesRegular(path, ignored, state)
    } else {
      throw new Error(`${path} is neither a file nor a directory`)
    }
  }
}

export function findFilesBase(path, ignored, {root, config}, validateCallback) {
  let files = []

  // TODO: Only include files that are used in config
  FS.readdirSync(path).forEach(function(entryName) {
    const paths = {}
    paths.absolute = Path.join(path, entryName)
    paths.relative = Path.relative(root, paths.absolute)
    paths.name = entryName
    const stat = FS.lstatSync(paths.absolute)

    if (entryName.substr(0, 1) === '.' ||
        stat.isSymbolicLink() ||
        isIgnored(paths.name, paths.relative, ignored)) {
      return
    }

    if (validateCallback === null || validateCallback(paths, stat)) {
      if (stat.isDirectory()) {
        files = files.concat(findFilesBase(paths.absolute, ignored, {root, config}, validateCallback))
      } else if (stat.isFile()) {
        files.push(paths.relative)
      }
    }
  })

  return files
}

export function findFilesRegular(path, ignored, {root, config}) {
  return findFilesBase(path, ignored, {root, config}, null)
}

export function findFilesGlob(path, ignored, {root, config}) {
  return findFilesBase(root, ignored, {root, config}, function({absolute, relative, name}, stat) {
    if (stat.isDirectory()) {
      return true
    }
    return Minimatch(relative, path)
  })
}
