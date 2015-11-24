'use babel'

import Path from 'path'
import Debug from 'debug'
import {readFileSync} from 'fs'
import {getConfig, getRules, scanFiles, saveFile, findRoot} from './helpers'
import {DEFAULT_IGNORED} from './defaults'

const debugCompile = Debug('UCompiler:Compile')

export function compile(path, options = {}, defaultRules = {}) {
  options = Object.assign({
    ignored: [],
    root: null,
    defaultRoot: null
  }, options)
  options.ignored = options.ignored.concat(DEFAULT_IGNORED)

  const root = findRoot(path, options)
  const config = getConfig(root)
  const files = scanFiles(path, {root: root, ignored: options.ignored})
  const plugins = {compilers: [], general: [], minifiers: []}

  config.plugins.forEach(function(moduleName) {
    const module = moduleName.indexOf('ucompiler-plugin-') === 0 ? require(moduleName) : require(`ucompiler-plugin-${moduleName}`)
    if (module.compiler) {
      plugins.compilers.push(module)
    } else if (module.minifiers) {
      plugins.minifiers.push(module)
    } else {
      plugins.general.push(module)
    }
  })

  return Promise.all(files.map(function(relativePath) {
    // TODO (For the future): Reverse source maps when changed
    const file = Path.join(root, relativePath)
    const state = {sourceMap: null, root, relativePath, imports: []}
    const rules = getRules({path, state, config, defaultRules})
    const contents = readFileSync(file, {encoding: 'utf8'})
    const initialContents = contents

    return plugins.compilers.reduce(function(promise, plugin) {
      return promise.then(function(contents) {
        return plugin.process({contents, file, config, state, rules})
      })
    }, Promise.resolve(contents)).then(function(contents) {
      return plugins.general.reduce(function(promise, plugin) {
        return promise.then(function(contents) {
          return plugin.process({contents, file, config, state, rules})
        })
      }, Promise.resolve(contents))
    }).then(function(contents) {
      return plugins.minifiers.reduce(function(promise, plugin) {
        return promise.then(function(contents) {
          return plugin.process({contents, file, config, state, rules})
        })
      }, Promise.resolve(contents))
    }).then(function(contents) {
      if (initialContents !== contents) {
        debugCompile(`Processed ${relativePath}`)
        return saveFile({contents, file, config, state, rules, root})
      } else {
        debugCompile(`Ignored ${relativePath}`)
        return contents
      }
    })
  }))
}
