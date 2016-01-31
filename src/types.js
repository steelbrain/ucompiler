'use babel'

/* @flow */

export type Ucompiler$Plugins = {
  compilers: Array<UCompiler$Plugin>,
  general: Array<UCompiler$Plugin>,
  minifiers: Array<UCompiler$Plugin>
}

export type UCompiler$Plugin = {
  compiler: boolean,
  minifier: boolean,
  process: ((parameters: UCompiler$Job) => {
    contents: string,
    sourceMap?: {
      sources: Array<string>,
      mappings: string,
      names: Array<string>
    }
  })
}

export type UCompiler$Job = {
  rootDirectory: string,
  filePath: string,
  contents: string,
  state: Object,
  config: Object
}

export type Ucompiler$Config = {
  defaultRule: string,
  rules: Array<Ucompiler$Config$Rule>
}

export type Ucompiler$Config$Rule = {
  name: string,
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

export type Ucompiler$Compile$Results = {
  status: boolean,
  contents: Array<{
    path: string,
    contents: string
  }>,
  sourceMaps: Array<{
    path: string,
    contents: ?string
  }>
}

export type Ucompiler$Compile$Result = {
  contents: {
    path: string,
    contents: string
  },
  sourceMap: {
    path: string,
    contents: ?string
  }
}
