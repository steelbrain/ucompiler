"use strict"
let Plugin = require('../Source/Plugin')
let Path = require('path')
let BabelJS
class Babel extends Plugin{
  static Process(Contents, Options){
    if(!Options.Transpile) return Contents
    BabelJS = BabelJS || require('babel-core')
    return BabelJS.transform(Contents, {
      filenameRelative: Options.File.Name,
      sourceRoot: Options.File.Dir
    }).code
  }
}
Babel.Initialize()
Babel.Info.Priority = 50
Babel.Info.Extensions = ['.js']
module.exports = Babel