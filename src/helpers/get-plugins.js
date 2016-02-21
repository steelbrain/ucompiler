'use babel'

/* @flow */

import Path from 'path'
import {exists} from './common'
import type {Ucompiler$Plugins, UCompiler$Plugin, Ucompiler$Config$Rule} from '../types'

export async function getPlugins(rootDirectory: string, config: Ucompiler$Config$Rule): Promise<Ucompiler$Plugins> {
  const plugins = {
    compilers: [],
    preprocessors: [],
    general: [],
    minifiers: []
  }

  for (const pluginName of config.plugins) {
    const plugin = await getPlugin(rootDirectory, pluginName)

    if (typeof plugin !== 'object') {
      throw new Error(`Plugin '${pluginName}' is invalid`)
    }
    plugin.name = pluginName

    if (plugin.compiler) {
      plugins.compilers.push(plugin)
    } else if (plugin.minifier) {
      plugins.minifiers.push(plugin)
    } else if (plugin.preprocessor) {
      plugins.preprocessors.push(plugin)
    } else {
      plugins.general.push(plugin)
    }
  }

  return plugins
}

export async function getPlugin(rootDirectory: string, pluginName: string): UCompiler$Plugin {
  if (pluginName.indexOf('ucompiler-plugin-') !== 0) {
    pluginName = 'ucompiler-plugin-' + pluginName
  }
  const pluginDirectory = Path.join(rootDirectory, 'node_modules', pluginName)
  if (await exists(pluginDirectory)) {
    // $FlowIgnore
    return require(pluginDirectory)
  }
  try {
    // $FlowIgnore
    return require(pluginName)
  } catch (_) {
    throw new Error(`'${pluginName}' not found in ${rootDirectory}`)
  }
}
