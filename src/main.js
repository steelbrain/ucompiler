'use babel'

/* @flow */

import Path from 'path'
import FS from 'fs'
import Chokidar from 'chokidar'
import {Disposable} from 'sb-event-kit'
import {read} from './helpers/common'
import {findRoot} from './helpers/find-root'
import {scanFiles} from './helpers/scan-files'
import {getConfig} from './helpers/get-config'
import {getPlugins} from './helpers/get-plugins'
import {execute} from './helpers/execute'
import {fromObject} from './helpers/source-map'
import {saveFile} from './helpers/save-file'
import {getParents} from './helpers/get-parents'
import type {Ucompiler$Compile$Results, Ucompiler$Compile$Result, Ucompiler$Config$Rule} from './types'

export async function compile(
  directory: string,
  ruleName:?string = null,
  errorCallback: ((error: Error) => void) = function(e) { throw e },
  saveContents: boolean = true,
  saveIncludedFiles: boolean = false
): Promise<Ucompiler$Compile$Results> {
  const rootDirectory = await findRoot(directory)
  const {rule: config} = await getConfig(rootDirectory, ruleName)
  const files = await scanFiles(rootDirectory, config)
  let promises

  const toReturn = {
    status: true,
    contents: [],
    sourceMaps: [],
    state: []
  }
  const imports = new Map()
  const results = new Map()

  promises = files.map(function(filePath) {
    return compileFile(rootDirectory, filePath, config).then(function(result) {
      toReturn.contents.push({path: filePath, contents: result.contents})
      toReturn.sourceMaps.push({path: filePath, contents: result.sourceMap})
      toReturn.state.push({path: filePath, state: result.state})
      imports.set(filePath, result.state.imports)
      results.set(filePath, result)
    }, function(e) {
      toReturn.status = false
      errorCallback(e)
    })
  })

  await Promise.all(promises)

  if (saveContents) {
    promises = files.map(function(filePath) {
      const parents = getParents(imports, filePath)
      const result = results.get(filePath)
      if (result && (!parents.length || saveIncludedFiles)) {
        return saveFile(rootDirectory, result, config)
      }
    })

    await Promise.all(promises)
  }

  results.clear()
  imports.clear()

  return toReturn
}

export async function compileFile(
  rootDirectory: string,
  filePath: string,
  config: Ucompiler$Config$Rule
): Promise<Ucompiler$Compile$Result> {
  const fileContents = await read(filePath)
  const state = {imports: []}

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

export async function watch(
  directory: string,
  ruleName: string,
  errorCallback: ((error: Error) => void) = function(e) { console.error(e.stack) },
  saveIncludedFiles: boolean = false
): Promise {
  const rootDirectory = await findRoot(directory)
  const {rule: config} = await getConfig(rootDirectory, ruleName)
  const targetDirectories = config.include.map(function(entry) {
    return Path.join(rootDirectory, entry.directory)
  })
  const imports = new Map()
  const results = new Map()
  let initialized = false

  function localCompileFile(filePath) {
    // TODO: Check if the file's extension is valid and is not in ignored
    compileFile(rootDirectory, filePath, config).then(function(result) {
      imports.set(filePath, result.state.imports)
      if (initialized) {
        localProcessResult(filePath, result)
      } else {
        results.set(filePath, result)
      }
    }).catch(errorCallback)
  }
  function localProcessResult(filePath, result) {
    const parents = getParents(imports, filePath)
    if (!parents.length || saveIncludedFiles) {
      saveFile(rootDirectory, result, config)
    }
    parents.forEach(localCompileFile)
  }

  const watcher = Chokidar.watch(targetDirectories)
  watcher.on('change', localCompileFile)
  watcher.on('add', localCompileFile)
  watcher.on('ready', function() {
    initialized = true
    for (const [filePath, result] of results) {
      localProcessResult(filePath, result)
    }
    results.clear()
  })

  return new Disposable(function() {
    watcher.close()
    imports.clear()
    results.clear()
  })
}
