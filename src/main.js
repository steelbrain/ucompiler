'use babel'

import {readFileSync} from 'fs'
import Path from 'path'
import {getConfig, scanFiles, saveFile, findRoot} from './helpers'
import Debug from 'debug'

const debug = Debug('UCompiler:Main')

export function compile(path, options = {}) {
  options.ignored = options.ignored || ['{**/, }node_modules/**', '{**/, }.*']
  options.root = options.root || null

  const root = findRoot(path, options.root)
  const config = getConfig(root)
  const files = scanFiles(path, {root: root, ignored: options.ignored})
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
      const file = Path.join(root, fileRelative)
      const state = {sourceMap: null}
      const contents = readFileSync(file, {encoding: 'utf8'})

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
        debug(`Processed ${fileRelative}`)
        return saveFile({contents, file, config})
      })
    })
  }, Promise.resolve())
}
