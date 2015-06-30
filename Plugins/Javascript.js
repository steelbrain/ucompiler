"use strict"
let Plugin = require('../Source/Plugin')
let Path = require('path')
class PluginJS extends Plugin{
  static Process(Contents, Options){
    Options.SourceMap = Options.SourceMap || false
    return this.ProcessTags('//', Contents, Options)
  }
}
PluginJS.Initialize()
PluginJS.Info.Extensions = ['.js']
PluginJS.Tags.set('Compiler-Compress', function(Name, Value, _, Options){
  Options.Compress = Value === 'true'
})
PluginJS.Tags.set('Compiler-Transpile', function(Name, Value, _, Options){
  Options.Transpile = Value === 'true'
})
PluginJS.Tags.set('Compiler-SourceMap', function(Name, Value, _, Options){
  Options.SourceMap = Path.resolve(Path.dirname(Options.File.Path), Value)
})
PluginJS.Tags.set('Compiler-Browserify', function(_, Value, __, Options){
  Options.Browserify = Value === 'true'
})
module.exports = PluginJS