'use babel'

/* @flow */

import Path from 'path'
import {readdir, stat, isExcluded, normalizePath} from './common'
import {DEFAULT_IGNORED} from '../defaults'
import type {Ucompiler$Config$Rule} from '../types'

export async function scanFiles(rootDirectory: string, config: Ucompiler$Config$Rule): Promise<Array<string>> {
  let files = []
  let promises = []
  let excluded = DEFAULT_IGNORED
  if (config.exclude) {
    excluded = excluded.concat(config.exclude)
  }

  for (const includeEntry of config.include) {
    const allowedExtensions = new Set(includeEntry.extensions)
    const includeDirectory = Path.join(rootDirectory, includeEntry.directory)
    const searchDeep = typeof includeEntry.deep === 'undefined' ? true : includeEntry.deep
    promises.push(await scanFilesInDirectory(
      rootDirectory,
      includeDirectory,
      searchDeep,
      allowedExtensions,
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
  extensions: Set<string>,
  excluded: Array<string>
): Promise<Array<string>> {
  const contents = await readdir(directory)
  let entries = []
  let promises = []

  for (const entry of contents) {
    const entryPath = normalizePath(Path.join(directory, entry))
    const entryRelativePath = normalizePath(Path.relative(rootDirectory, entryPath))
    const entryStats = await stat(entryPath)

    if (isExcluded([entryRelativePath, entryPath, entry], excluded)) {
      continue
    }

    if (entryStats.isFile()) {

      const extName = Path.extname(entry).slice(1)
      if (extensions.has(extName)) {
        entries.push(entryPath)
      }

    } else if (entryStats.isDirectory() && deep) {
      promises.push(await scanFilesInDirectory(rootDirectory, entryPath, deep, extensions, excluded))
    }
  }

  let results = await Promise.all(promises)
  results.forEach(function(nestedEntries) {
    entries = entries.concat(nestedEntries)
  })

  return entries
}
