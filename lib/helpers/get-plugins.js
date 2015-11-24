'use babel'

export function getPlugins(config) {
  const plugins = {compilers: [], general: [], minifiers: []}

  config.plugins.forEach(function(moduleName) {
    const module = moduleName.indexOf('ucompiler-plugin-') === 0 ?
      require(moduleName) :
      require(`ucompiler-plugin-${moduleName}`)

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
