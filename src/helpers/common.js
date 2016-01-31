'use babel'

/* @flow */

import Path from 'path'
import FS from 'fs'
import isGlob from 'is-glob'
import {isMatch} from 'micromatch'
import type {Stats} from 'fs'

export const R_OK = 4
export const W_OK = 2
export const NormalizationRegExp = /\\/g
export const FindCache: Map<string, string> = new Map()

// TODO: Put these file system helpers to a node module

export function stat(path: string): Promise<Stats> {
  return new Promise(function(resolve, reject) {
    FS.lstat(path, function(error, stats) {
      if (error) {
        reject(error)
      } else resolve(stats)
    })
  })
}

export function readdir(path: string): Promise<Array<string>> {
  return new Promise(function(resolve, reject) {
    FS.readdir(path, function(error, entries) {
      if (error) {
        reject(error)
      } else resolve(entries)
    })
  })
}

export function read(path: string): Promise<string> {
  return new Promise(function(resolve, reject) {
    FS.readFile(path, function(error, contents) {
      if (error) {
        reject(error)
      } else resolve(contents.toString())
    })
  })
}

export function write(path: string, contents: string): Promise {
  return new Promise(function(resolve, reject) {
    FS.writeFile(path, contents, function(error) {
      if (error) {
        reject(error)
      } else resolve()
    })
  })
}

export function exists(path: string): Promise<boolean> {
  return new Promise(function(resolve) {
    FS.access(path, function(error) {
      resolve(error === null)
    })
  })
}

export async function find(rootDirectory: string, fileName: string): Promise<?string> {
  if (!await exists(rootDirectory)) {
    throw new Error(`Can not read directory ${rootDirectory}`)
  }

  const chunks = rootDirectory.split(Path.sep)
  while (chunks.length) {
    const filePath = Path.join(chunks.join(Path.sep), fileName)
    if (filePath === fileName) {
      break
    }
    if (await exists(filePath)) {
      return filePath
    }
    chunks.pop()
  }
  return null
}

export async function findCached(rootDirectory: string, fileName: string): Promise<?string> {
  const cacheKey = rootDirectory + ':' + fileName
  const cachedFilePath = FindCache.get(cacheKey)

  if (cachedFilePath) {
    if (await exists(cachedFilePath)) {
      return cachedFilePath
    }
    FindCache.delete(cacheKey)
  }
  const filePath = await find(rootDirectory, fileName)
  if (filePath) {
    FindCache.set(cacheKey, filePath)
  }
  return filePath
}

export function isExcluded(fileNames: Array<string> , ignored: Array<string>): boolean {
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

export function asyncReduce<TItem, TValue>(items: Array<TItem>, initialValue: TValue, callback:((item: TItem, value: TValue) => Promise<TValue>)): Promise<TValue> {
  return items.reduce(function(promise, item) {
    return promise.then(function(previousResult) {
      return callback(item, previousResult)
    })
  }, new Promise(function(resolve) {
    resolve(initialValue)
  }))
}
