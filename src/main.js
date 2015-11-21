'use babel'

import FS from 'fs'
import Path from 'path'
import {getConfig, scanFiles, saveFile} from './helpers'
import Debug from 'debug'

Debug.enable('UCompiler:*')
const debug = Debug('UCompiler:Main')

export function compile(path, options = {
  ignored: ['{**/, }node_modules/**', '{**/, }.*']
}) {
  const config = getConfig(path)
  const files = scanFiles(path, {root: config.root, ignored: options.ignored})
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

  return files.reduce(function(promise, fileRelative) {
    // TODO (For the future): Reverse source maps when changed
    return promise.then(function() {
      const file = Path.join(config.root, fileRelative)
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
        return plugins.minifiers.reduce(function(promise, plugin) {
          return promise.then(function(contents) {
            return plugin.process({contents, file, config, state})
          })
        }, Promise.resolve(contents))
      }).then(function(contents) {
        debug(`Processed ${file}`)
        return saveFile({contents, file, config})
      })
    })
  }, Promise.resolve())
}
