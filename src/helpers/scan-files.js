'use babel'

/* @flow */

import Path from 'path'
import {readdir, stat, isExcluded, normalizePath} from './common'
import {DEFAULT_IGNORED} from '../defaults'
import type {Ucompiler$Config$Rule} from '../types'
import type {Stats} from 'fs'

export async function scanFiles(rootDirectory: string, config: Ucompiler$Config$Rule): Promise<Array<string>> {
  let files = []
  let promises = []
  let excluded = DEFAULT_IGNORED
  if (config.exclude) {
    excluded = excluded.concat(config.exclude)
  }

  for (const includeEntry of config.include) {
    const includeDirectory = Path.join(rootDirectory, includeEntry.directory)
    const searchDeep = typeof includeEntry.deep === 'undefined' ? true : includeEntry.deep
    promises.push(await scanFilesInDirectory(
      rootDirectory,
      includeDirectory,
      searchDeep,
      includeEntry.extensions,
      excluded
    ))
  }

  let results = await Promise.all(promises)
  results.forEach(function(nestedFiles) {
    files = files.concat(nestedFiles)
  })

  return files
}

export async function scanFilesInDirectory(
  rootDirectory: string,
  directory: string,
  deep: boolean,
  extensions: Array<string>,
  excluded: Array<string>
): Promise<Array<string>> {
  const contents = await readdir(directory)
  let entries = []
  let promises = []

  for (const entry of contents) {
    const entryPath = normalizePath(Path.join(directory, entry))
    const entryStats = await stat(entryPath)

    if (validateNode(rootDirectory, entryPath, excluded, extensions, entryStats, deep)) {
      if (entryStats.isFile()) {
        entries.push(entryPath)
      } else {
        promises.push(await scanFilesInDirectory(rootDirectory, entryPath, deep, extensions, excluded))
      }
    }
  }

  let results = await Promise.all(promises)
  results.forEach(function(nestedEntries) {
    entries = entries.concat(nestedEntries)
  })

  return entries
}

export function validateNode(
  rootDirectory: string,
  entryPath: string,
  excluded: Array<string>,
  extensions: Array<string>,
  stats: Stats,
  deep: boolean
): boolean {
  const entryRelativePath = normalizePath(Path.relative(rootDirectory, entryPath))

  if (isExcluded([entryRelativePath, entryPath, Path.basename(entryPath)], excluded)) {
    return false
  }

  if (stats.isFile()) {
    const extName = Path.extname(entryPath).slice(1)
    if (extensions.indexOf(extName) !== -1) {
      return true
    }
  }
  if (stats.isDirectory() && deep) {
    return true
  }
  return false
}
