'use babel'

/* @flow */

export type Ucompiler$Plugins = {
  preprocessors: Array<UCompiler$Plugin>,
  compilers: Array<UCompiler$Plugin>,
  general: Array<UCompiler$Plugin>,
  minifiers: Array<UCompiler$Plugin>
}

export type UCompiler$Plugin = {
  name: string,
  compiler: ?boolean,
  minifier: ?boolean,
  preprocessor: ?boolean,
  process: ((contents:string, parameters: UCompiler$Job) => ?UCompiler$Plugin$Result)
}

export type UCompiler$Plugin$Result = {
  contents: string,
  sourceMap?: ?UCompiler$SourceMap
}

export type UCompiler$SourceMap = {
  sources: Array<string>,
  sourcesContent: Array<string>,
  mappings: string,
  names: Array<string>
}

export type UCompiler$Job = {
  rootDirectory: string,
  filePath: string,
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
  sourceMapPath?: string
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
  }>,
  state: Array<{
    path: string,
    state: Object
  }>
}

export type Ucompiler$Compile$Result = {
  filePath: string,
  contents: string,
  sourceMap: ?string,
  state: Object
}

export type UCompiler$ErrorCallback = ((error: Error) => void)
export type UCompiler$Options = {
  save: boolean,
  saveIncludedFiles: boolean,
  errorCallback: UCompiler$ErrorCallback
}
