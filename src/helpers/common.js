'use babel'

/* @flow */

import Path from 'path'
import FS from 'fs'
import isGlob from 'is-glob'
import {isMatch} from 'micromatch'
import mkdirp from 'mkdirp'
import promisify from 'sb-promisify'
import type {Stats} from 'fs'

export const R_OK = 4
export const W_OK = 2
export const NormalizationRegExp = /\\/g
export const FindCache: Map<string, string> = new Map()

const readFile: ((filePath: string) => Promise<string>) = promisify(FS.readFile)

export const stat: ((filePath: string) => Promise<Stats>) = promisify(FS.lstat)
export const readdir: ((dirPath: string) => Promise<Array<string>>) = promisify(FS.readdir)
export const read: ((filePath: string) => Promise<string>) = async function(filePath) {
  return (await readFile(filePath)).toString('utf8')
}
export function write(path: string, contents: string): Promise {
 return new Promise(function writeFile(resolve, reject, retry = true) {
   FS.writeFile(path, contents, function(error) {
     if (error) {
       if (error.code === 'ENOENT' && retry) {
         mkdirp(Path.dirname(path), function(error) {
           if (error) {
             reject(error)
           } else writeFile(resolve, reject, false)
         })
       } else reject(error)
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
