'use babel'

/* @flow */

import {read} from './common'
import {getPlugins} from './get-plugins'
import {execute} from './execute'
import {fromObject} from './source-map'
import type {Ucompiler$Config$Rule, Ucompiler$Compile$Result} from '../types'

export async function compileFile(
  rootDirectory: string,
  filePath: string,
  config: Ucompiler$Config$Rule
): Promise<Ucompiler$Compile$Result> {
  const fileContents = await read(filePath)
  const state = {imports: []}

  const plugins = await getPlugins(rootDirectory, config)
  const result = await execute(plugins, fileContents, {
    rootDirectory: rootDirectory,
    filePath: filePath,
    state: state,
    config: config
  })

  return {
    filePath: filePath,
    contents: result.contents,
    sourceMap: result.sourceMap ? fromObject(rootDirectory, filePath, result.sourceMap) : null,
    state: state
  }
}
