"use strict"
let Plugin = require('../Source/Plugin')
let Path = require('path')
let LessCSS
class Less extends Plugin{
  static Process(Contents, Options){
    LessCSS = LessCSS || require('less')
    return this.ProcessTags('//', Contents, Options).then(function(Contents){
      let Deferred = Promise.defer()
      LessCSS.render(Contents, {
        filename: Options.File.Name,
        sourceMap: Options.SourceMap,
        paths: [Options.File.Dir],
        compress: Options.Compress
      }, function(error, output){
        if(error) Reject(error)
        if(Options.SourceMap) Options.Content.SourceMap = output.map
        Deferred.resolve(output.css)
      })
      return Deferred.promise
    })
  }
}
Less.Initialize()
Less.Info.Priority = 1
Less.Info.Extensions = ['.less']
Less.Tags.set('Compiler-Compress', function(Name, Value, _, Options){
  Options.Compress = Value === 'true'
})
Less.Tags.set('Compiler-SourceMap', function(Name, Value, _, Options){
  Options.SourceMap = Path.resolve(Path.dirname(Options.File.Path), Value)
})
module.exports = Less