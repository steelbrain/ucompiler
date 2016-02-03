'use babel'

/* @flow */

import Path from 'path'
import type {UCompiler$SourceMap} from '../types'

export function fromObject(rootDirectory: string, filePath: string, sourceMap: UCompiler$SourceMap): string {
  const relativeFilePath = Path.isAbsolute(filePath) ? Path.relative(rootDirectory, filePath) : filePath

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

export function addSignature(outputPath: string, sourceMapPath: string, contents: string): string {
  const extName = Path.extname(outputPath).slice(1)
  const relativePath = Path.relative(Path.dirname(outputPath), sourceMapPath)
  if (extName === 'js') {
    return contents + `\n//# sourceMappingURL=${relativePath}`
  } else if (extName === 'css') {
    return contents + `\n/*# sourceMappingURL=${relativePath} */`
  }
  return contents
}
