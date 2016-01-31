'use babel'

import {transfer} from 'multi-stage-sourcemap'

export function execute(plugins, parameters) {
  // Sequence:
  // 1. Compilers
  // 2. General
  // 3. Minifiers
  let lastMap = meta.state.sourceMap
  return []
    .concat(plugins.compilers)
    .concat(plugins.general)
    .concat(plugins.minifiers)
    .reduce(function(promise, plugin) {
      return promise.then(function(contents) {
        if (lastMap && meta.state.sourceMap !== lastMap) {
          sourceMapDiff(meta.state, lastMap)
        }
        lastMap = meta.state.sourceMap
        parameters.contents = contents
        return plugin.process(parameters)
      })
    }, Promise.resolve(parameters.contents)).then(function(contents) {
      if (lastMap && meta.state.sourceMap !== lastMap) {
        sourceMapDiff(meta.state, lastMap)
      }
      parameters.contents = contents
      return contents
    })
}

function sourceMapDiff(state, lastMap) {
  state.sourceMap = JSON.parse(transfer({fromSourceMap: state.sourceMap, toSourceMap: lastMap}))
  state.sourceMap.sourcesContent = lastMap.sourcesContent
}
