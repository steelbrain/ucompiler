"use strict"
let Plugin = require('../Source/Plugin')
let Path = require('path')
class PluginJS extends Plugin{
  static Process(Contents, Options){
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
module.exports = PluginJS