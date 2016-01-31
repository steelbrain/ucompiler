'use babel'

/* @flow */

export type UCompiler$Plugin = {
  compiler: boolean,
  minifier: boolean,
  process: ((parameters: UCompiler$Job) => string)
}

export type UCompiler$Job = {
  rootPath: string,
  filePath: string,
  contents: string,
  state: Object,
  config: Object
}

export type Ucompiler$Config = {
  defaultRule: string,
  rules: Map<string, Ucompiler$Config$Rule>
}

export type Ucompiler$Config$Rule = {
  plugins: Array<string>,
  include: Array<{
    directory: string,
    deep?: boolean,
    extensions: Array<string>
  }>,
  exclude?: Array<string>,
  outputPath: string,
  sourceMap?: string
}
