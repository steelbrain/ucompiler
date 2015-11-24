'use babel'

import Path from 'path'

export function getPlugins(root, config) {
  const plugins = {compilers: [], general: [], minifiers: []}

  config.plugins.forEach(function(moduleName) {
    moduleName = moduleName.indexOf('ucompiler-plugin-') === 0 ?
      moduleName :
      `ucompiler-plugin-${moduleName}`

    let module = null

    try {
      module = require(Path.join(root, 'node_modules', moduleName))
    } catch (_) {
      module = require(moduleName)
    }

    if (module.compiler) {
      plugins.compilers.push(module)
    } else if (module.minifiers) {
      plugins.minifiers.push(module)
    } else {
      plugins.general.push(module)
    }
  })

  return plugins
}
