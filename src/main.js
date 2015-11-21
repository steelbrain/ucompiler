'use babel'

import FS from 'fs'
import {getConfig, scanFiles} from './helpers'
import Debug from 'debug'

Debug.enable('UCompiler:*')
const debug = Debug('UCompiler:Main')

export function compile(path, options = {
  root: process.cwd(),
  ignored: ['{**/, }node_modules/**']
}) {
  const config = getConfig(options.root)
  const files = scanFiles(path, {root: options.root, ignored: options.ignored})
  const plugins = {compilers: [], general: [], minifiers: []}

  config.plugins.forEach(function(moduleName) {
    const module = moduleName.indexOf('ucompiler-plugin-') === 0 ? require(moduleName) :require(`ucompiler-plugin-${moduleName}`)
    if (module.compiler) {
      plugins.compilers.push(module)
    } else if (module.minifiers) {
      plugins.minifiers.push(module)
    } else {
      plugins.general.push(module)
    }
  })

  return files.reduce(function(promise, file) {
    return promise.then(function() {
      const state = {sourceMap: null}
      const contents = FS.readFileSync(file, {encoding: 'utf8'})

      return plugins.compilers.reduce(function(promise, plugin) {
        return promise.then(function(contents) {
          return plugin.process({contents, file, config, state})
        })
      }, Promise.resolve(contents)).then(function(contents) {
        return plugins.general.reduce(function(promise, plugin) {
          return promise.then(function(contents) {
            return plugin.process({contents, file, config, state})
          })
        }, Promise.resolve(contents))
      }).then(function(contents) {
        // TODO: Store if we have any source maps
        return plugins.minifiers.reduce(function(promise, plugin) {
          return promise.then(function(contents) {
            return plugin.process({contents, file, config, state})
          })
        }, Promise.resolve(contents))
      }).then(function(contents) {
        debug(`Compiled ${file}`)
      })
    })
  }, Promise.resolve())
}

compile(__dirname).catch(function(e) {
  console.log(e.stack)
})
