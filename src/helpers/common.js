'use babel'

/* @flow */

import Path from 'path'
import FS from 'fs'
import isGlob from 'is-glob'
import {isMatch} from 'micromatch'

export const R_OK = 4
export const W_OK = 2
export const NormalizationRegExp = /\\/g
export const FindCache: Map<string, string> = new Map()

export function find(rootDirectory: string, fileName: string): ?string {
  try {
    FS.accessSync(rootDirectory, R_OK)
  } catch (_) {
    throw new Error(`Can not read directory ${rootDirectory}`)
  }

  const chunks = rootDirectory.split(Path.sep)
  while (chunks.length) {
    const filePath = Path.join(chunks.join(Path.sep), fileName)
    if (filePath === fileName) {
      break
    }
    try {
      FS.accessSync(filePath, R_OK)
      return filePath
    } catch (_) {}
    chunks.pop()
  }
  return null
}

export function findCached(rootDirectory: string, fileName: string): ?string {
  const cacheKey = rootDirectory + ':' + fileName

  if (FindCache.has(cacheKey)) {
    const cachedFilePath = FindCache.get(cacheKey)
    try {
      FS.accessSync(rootDirectory, R_OK)
      return cachedFilePath
    } catch (_) {
      FindCache.delete(cacheKey)
    }
  }
  const filePath = find(rootDirectory, fileName)
  if (filePath) {
    FindCache.set(cacheKey, filePath)
  }
  return filePath
}

export function isIgnored(fileNames: Array<string> , ignored: Array<string>): boolean {
  return ignored.some(function(entry) {
    const entryIsGlob = isGlob(entry)
    for (const fileName of fileNames) {
      if (entryIsGlob ? isMatch(fileName, entry) : fileName === entry) {
        return true
      }
    }
    return false
  })
}

export function normalizePath(path: string): string {
  if (process.platform === 'win32') {
    return path.replace(NormalizationRegExp, '/')
  }
  return path
}
