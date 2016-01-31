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
    .concat(plugins.compilers)
    .concat(plugins.general)
    .concat(plugins.minifiers)

  return await asyncReduce(sortedPlugins, {
    contents: contents,
    sourceMap: null
  }, async function(plugin, previousResult) {
    const result = await plugin.process(previousResult.contents, job)

    if (result.sourceMap && previousResult.sourceMap) {
      result.sourceMap = reverseSourceMap(result.sourceMap, previousResult.sourceMap)
    } else if (previousResult.sourceMap) {
      result.sourceMap = previousResult.sourceMap
    }

    return result
  })
}

export function reverseSourceMap(
  newSourceMap: UCompiler$SourceMap,
  oldSourceMap: UCompiler$SourceMap
): UCompiler$SourceMap {
  const merged = JSON.parse(transfer({fromSourceMap: newSourceMap, toSourceMap: oldSourceMap}))
  merged.sourcesContent = oldSourceMap.sourcesContent
  return merged
}
