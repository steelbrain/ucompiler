'use babel'

/* @flow */

import Path from 'path'
import FS from 'fs'
import {Disposable} from 'sb-event-kit'
import {read} from './helpers/common'
import {findRoot} from './helpers/find-root'
import {scanFiles} from './helpers/scan-files'
import {getConfig} from './helpers/get-config'
import type {Ucompiler$Compile$Results, Ucompiler$Compile$Result, Ucompiler$Config$Rule} from './types'

export async function compile(
  directory: string,
  ruleName:?string = null,
  errorCallback: ?((error: Error) => void) = null
): Promise<Ucompiler$Compile$Results> {
  const rootDirectory = await findRoot(directory)
  const {config: globalConfig, rule: config} = await getConfig(rootDirectory, ruleName)
  const files = await scanFiles(rootDirectory, config)

  const toReturn = {
    status: true,
    contents: [],
    sourceMaps: []
  }

  const promises = files.map(filePath => compileFile(rootDirectory, filePath, config))
  const results = await Promise.all(promises)
  for (const result of results) {
    toReturn.status = toReturn.status && result.status
    toReturn.contents.push(result.contents)
    toReturn.sourceMaps.push(result.sourceMap)
  }

  return toReturn
}

export async function compileFile(
  rootDirectory: string,
  filePath: string,
  config: Ucompiler$Config$Rule
): Promise<Ucompiler$Compile$Result> {
  const fileContents = await read(filePath)
  const result = {
    status: true,
    contents: {
      path: filePath,
      contents: fileContents
    },
    sourceMap: {
      path: filePath,
      contents: null
    }
  }
  return result
}
