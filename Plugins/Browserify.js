"use strict"
let Plugin = require('../Source/Plugin')
let Path = require('path')
let Stream = require('stream')
let Browserify
class BrowserifyJS extends Plugin{
  static Process(Contents, Options){
    if(!Options.Browserify) return Contents
    Browserify = Browserify || require('browserify')
    let Readable = new Stream.Readable()
    Readable._read = function(){
      Readable.push(Contents)
      Readable.push(null)
    }
    let Browserified = Browserify(Readable, {
      basedir: Options.File.Dir,
      debug: Options.SourceMap,
      fullPaths: false,
      filename: Options.File.Path
    })
    let Deferred = Promise.defer()
    Browserified.bundle(function(err, buffer){
      if(err) return Deferred.reject(err)
      if(Options.SourceMap){
        Options.Content.SourceMap = null
      }
      Deferred.resolve(buffer)
    })
    return Deferred.promise
  }
}
BrowserifyJS.Initialize()
BrowserifyJS.Info.Priority = 50
BrowserifyJS.Info.Extensions = ['.js', '.coffee']
module.exports = BrowserifyJS