'use babel'

/* @flow */

type UCompiler$Plugin = {
  compiler: Boolean,
  minifier: Boolean,
  process: ((parameters: UCompiler$Job) => string)
}

type UCompiler$Job = {
  rootPath: string,
  filePath: string,
  contents: string,
  state: Object,
  config: Object
}

type Ucompiler$Config = {
  defaultRule: string,
  rules: Map<string, Ucompiler$Config$Rule>
}

type Ucompiler$Config$Rule = {
  plugins: Array<string>,
  include: Array<{
    directory: string,
    deep?: Boolean,
    extensions: Array<string>
  }>,
  outputPath: string,
  sourceMap?: string
}
