'use babel'

/* @flow */

import Path from 'path'
import FS from 'fs'
import {Disposable} from 'sb-event-kit'
import {read} from './helpers/common'
import {findRoot} from './helpers/find-root'
import {scanFiles} from './helpers/scan-files'
import {getConfig} from './helpers/get-config'
import {getPlugins} from './helpers/get-plugins'
import {execute} from './helpers/execute'
import {fromObject} from './helpers/source-map'
import {saveFile} from './helpers/save-file'
import type {Ucompiler$Compile$Results, Ucompiler$Compile$Result, Ucompiler$Config$Rule} from './types'

export async function compile(
  directory: string,
  ruleName:?string = null,
  errorCallback: ((error: Error) => void) = function(e) { throw e },
  saveContents: boolean = true
): Promise<Ucompiler$Compile$Results> {
  const rootDirectory = await findRoot(directory)
  const {rule: config} = await getConfig(rootDirectory, ruleName)
  const files = await scanFiles(rootDirectory, config)

  const toReturn = {
    status: true,
    contents: [],
    sourceMaps: [],
    state: []
  }

  const promises = files.map(filePath => {
    return compileFile(rootDirectory, filePath, config, { imports: [] }).catch(errorCallback)
  })

  const results = await Promise.all(promises)
  for (const result of results) {
    if (!result) {
      toReturn.status = false
      continue
    }

    toReturn.contents.push(result.contents)
    toReturn.sourceMaps.push(result.sourceMap)
    toReturn.state.push(result.state)

    if (saveContents) {
      await saveFile(rootDirectory, result, config)
    }
  }

  return toReturn
}

export async function compileFile(
  rootDirectory: string,
  filePath: string,
  config: Ucompiler$Config$Rule,
  state: Object
): Promise<Ucompiler$Compile$Result> {
  const fileContents = await read(filePath)

  const plugins = await getPlugins(rootDirectory, config)
  const result = await execute(plugins, fileContents, {
    rootDirectory: rootDirectory,
    filePath: filePath,
    state: state,
    config: config
  })

  return {
    filePath: filePath,
    contents: result.contents,
    sourceMap: result.sourceMap ? fromObject(rootDirectory, filePath, result.sourceMap) : null,
    state: state
  }
}
