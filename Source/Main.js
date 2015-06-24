"use strict"
let NodeStream = require('stream')
let FS = require('fs')
let Helpers = require('./Helpers')
let Path = require('path')
class UCompiler{
  static compileFile(FilePath, Options){
    Options = Helpers.normalizeOptions(Options)
    Options.File = {
      Path: FilePath,
      Extension: Path.extname(FilePath),
      Dir: Path.resolve(Path.dirname(FilePath)),
      Name: Path.basename(FilePath)
    }
    return UCompiler.compileStream(FS.createReadStream(FilePath), Options)
  }
  static compileString(Content, Options){
    Options = Helpers.normalizeOptions(Options)
    let Stream = new NodeStream.Readable()
    Stream._read = function(){ }
    Stream.push(Content)
    Stream.push(null)
    return UCompiler.compileStream(Stream, Options)
  }
  static compileStream(Stream, Options){
    Options = Helpers.normalizeOptions(Options)
    return new Promise(function(Resolve){
      let Valid = []
      for(let Plugin of UCompiler.Plugins){
        if(Plugin.Validate(Options)){
          Valid.push(Plugin)
        }
      }
      Resolve(Valid.sort(function(a, b){
          return a.Info.Priority - b.Info.Priority
        }).map(function(Plugin){
          return Plugin.Stream(Options)
        }))
    }).then(function(Streams){
        let Deferred = Promise.defer()
        let Buffer = []
        for(let _Stream of Streams){
          Stream = Stream.pipe(_Stream)
          Stream.on('error', function(error){
            Deferred.reject(error)
          })
        }
        Stream.on('data', function(data){
          Buffer.push(data)
        })
        Stream.on('end', function(){
          Deferred.resolve(Buffer.join(''))
        })
        return Deferred.promise
      })
  }
}

UCompiler.Plugins = new Set()

// Loading Plugins
require('../Plugins/Javascript').Register(UCompiler)
require('../Plugins/Babel').Register(UCompiler)
require('../Plugins/Uglify').Register(UCompiler)
require('../Plugins/Coffee').Register(UCompiler)

module.exports = UCompiler
