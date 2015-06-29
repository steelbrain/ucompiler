"use strict"
let Plugin = require('../Source/Plugin')
let Path = require('path')
let Coffee
class PluginCoffee extends Plugin{
  static Process(Contents, Options){
    Coffee = Coffee || require('coffee-script')
    Options.SourceMap = Options.SourceMap || false
    Options.Bare = Options.Bare || false
    return this.ProcessTags('#', Contents, Options).then(function(Code){
      let Compiled = Coffee.compile(Code, {
        sourceMap: Options.SourceMap,
        bare: Options.Bare,
        sourceRoot: Options.File.Dir,
        sourceFiles: [Options.File.Name]
      })
      if(Options.SourceMap){
        Options.Content.SourceMap = Compiled.v3SourceMap
        return Compiled.js
      } else {
        return Compiled
      }
    })
  }
}
PluginCoffee.Initialize()
PluginCoffee.Info.Extensions = ['.coffee']
PluginCoffee.Tags['Compiler-Compress'] = function(Name, Value, _, Options){
  Options.Compress = Value === 'true'
}
PluginCoffee.Tags['Compiler-Bare'] = function(Name, Value, _, Options){
  Options.Bare = Value === 'true'
}
PluginCoffee.Tags['Compiler-SourceMap'] = function(Name, Value, _, Options){
  Options.SourceMap = Path.resolve(Path.dirname(Options.File.Path), Value)
}
module.exports = PluginCoffee