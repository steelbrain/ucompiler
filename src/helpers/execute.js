'use babel'

/* @flow */

import {transfer} from 'multi-stage-sourcemap'
import {asyncReduce} from './common'
import type {UCompiler$Job, Ucompiler$Plugins, UCompiler$Plugin$Result, UCompiler$SourceMap} from '../types'

export async function execute(
  plugins: Ucompiler$Plugins,
  contents: string,
  job: UCompiler$Job
): Promise<UCompiler$Plugin$Result> {

  const sortedPlugins = []
    .concat(plugins.preprocessors)
    .concat(plugins.compilers)
    .concat(plugins.general)
    .concat(plugins.minifiers)

  return await asyncReduce(sortedPlugins, {
    contents: contents,
    sourceMap: null
  }, async function(plugin, previousResult) {
    const result = await plugin.process(previousResult.contents, job)

    if (result) {
      if (typeof result !== 'object' || typeof result.contents !== 'string') {
        throw new Error(`Plugin '${plugin.name}' returned an invalid result`)
      }
      if (result.sourceMap && previousResult.sourceMap) {
        result.sourceMap = reverseSourceMap(result.sourceMap, previousResult.sourceMap)
      } else if (previousResult.sourceMap) {
        result.sourceMap = previousResult.sourceMap
      }
      return result
    }

    return previousResult
  })
}

export function reverseSourceMap(
  newSourceMap: UCompiler$SourceMap,
  oldSourceMap: UCompiler$SourceMap
): UCompiler$SourceMap {
  if (!oldSourceMap || newSourceMap.sourcesContent.length <= oldSourceMap.sourcesContent.length) {
    const merged = JSON.parse(transfer({fromSourceMap: newSourceMap, toSourceMap: oldSourceMap}))
    merged.sourcesContent = oldSourceMap.sourcesContent
    return merged
  } else {
    return newSourceMap
  }
}
