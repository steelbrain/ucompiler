"use strict"
let Plugin = require('../Source/Plugin')
let Path = require('path')
let Uglify
class UglifyJS extends Plugin{
  static Process(Contents, Options){
    if(!Options.Compress) return Contents
    Uglify = Uglify || require('uglifyjs')
    return Uglify.minify(Contents, {fromString: true}).code
  }
}
UglifyJS.Info.Priority = 100
UglifyJS.Info.Extensions = ['.js']
UglifyJS.Tags.set('Compiler-Compress', function(Name, Value, _, Options){
  Options.Compress = Value === 'true'
})
UglifyJS.Tags.set('Compiler-Transpile', function(Name, Value, _, Options){
  Options.Transpile = Value === 'true'
})
module.exports = UglifyJS