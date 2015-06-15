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
UglifyJS.Initialize()
UglifyJS.Info.Priority = 100
UglifyJS.Info.Extensions = ['.js']
module.exports = UglifyJS