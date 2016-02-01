'use babel'

/* @flow */

import Path from 'path'
import {write} from './common'
import {template} from '../defaults'
import type {Ucompiler$Compile$Result, Ucompiler$Config$Rule} from '../types'

const debug = require('debug')('UCompiler:Save')

export async function saveFile(
  rootDirectory: string,
  result: Ucompiler$Compile$Result,
  config: Ucompiler$Config$Rule
): Promise {
  const outputPath = renderPath(rootDirectory, result, config, config.outputPath)
  debug(`Saving output of '${Path.relative(rootDirectory, result.filePath)}' to '${outputPath}'`)
  await write(outputPath, result.contents)

  if (config.sourceMapPath && result.sourceMap) {
    const sourceMapPath = renderPath(rootDirectory, result, config, config.sourceMapPath)
    debug(`Saving sourcemap of '${Path.relative(rootDirectory, result.filePath)}' to '${sourceMapPath}'`)
    await write(sourceMapPath, String(result.sourceMap))
  }
}

export function renderPath(
  rootDirectory: string,
  result: Ucompiler$Compile$Result,
  config: Ucompiler$Config$Rule,
  templateString: string
): string {
  const parsedPath = Path.parse(result.filePath)

  const absolutePath = result.filePath
  const relativePath = Path.relative(rootDirectory, absolutePath)
  const relativeDirectory = Path.dirname(relativePath)
  const absoluteDirectory = Path.dirname(absolutePath)

  const rendered = template.render(templateString, {
    absolutePath: absolutePath,
    relativePath: relativePath,
    relativeDirectory: relativeDirectory,
    absoluteDirectory: absoluteDirectory,
    name: parsedPath.name,
    ext: parsedPath.ext.slice(1),
    base: parsedPath.base,
    root: parsedPath.root
  })

  if (rendered.indexOf(':') !== -1 || rendered.indexOf('{') !== -1) {
    throw new Error(`Invalid output template '${templateString}' provided for '${result.filePath}'`)
  }
  return rendered
}
