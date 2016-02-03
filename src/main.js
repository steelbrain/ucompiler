'use babel'

/* @flow */

import {Disposable} from 'sb-event-kit'
import {findRoot} from './helpers/find-root'
import {scanFiles} from './helpers/scan-files'
import {getConfig, getConfigRule} from './helpers/get-config'
import {saveFile} from './helpers/save-file'
import {getParents} from './helpers/get-parents'
import {compileFile} from './helpers/compile-file'
import {Watcher} from './watcher'

import type {Ucompiler$Compile$Results, Ucompiler$Compile$Result, Ucompiler$Config$Rule, UCompiler$Options} from './types'
import type {EventKit$Disposable} from './types-external'

export async function compile(
  directory: string,
  options: UCompiler$Options,
  ruleName:?string = null
): Promise<Ucompiler$Compile$Results> {
  const rootDirectory = await findRoot(directory)
  const config = getConfigRule(await getConfig(rootDirectory), ruleName)
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
      options.errorCallback(e)
    })
  })

  await Promise.all(promises)

  if (options.save) {
    promises = files.map(function(filePath) {
      const parents = getParents(imports, filePath)
      const result = results.get(filePath)
      if (result && (!parents.length || options.saveIncludedFiles)) {
        return saveFile(rootDirectory, result, config)
      }
    })

    await Promise.all(promises)
  }

  results.clear()
  imports.clear()

  return toReturn
}

export async function watch(
  directory: string,
  options: UCompiler$Options,
  ruleNames: Array<string> = []
): Promise<EventKit$Disposable> {
  const watcher = await Watcher.create(directory, options, ruleNames)
  watcher.activate()
  return watcher
}
