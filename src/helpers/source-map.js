'use babel'

/* @flow */

import Path from 'path'
import type {UCompiler$SourceMap} from '../types'

export function fromObject(rootDirectory: string, filePath: string, sourceMap: UCompiler$SourceMap): string {
  const relativeFilePath = Path.relative(rootDirectory, filePath)

  return JSON.stringify({
    version: 3,
    sources: sourceMap.sources,
    sourcesContent: sourceMap.sourcesContent,
    mappings: sourceMap.mappings,
    names: sourceMap.names,
    file: relativeFilePath,
    sourceRoot: '/__source__'
  })
}
