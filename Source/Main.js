"use strict"
let NodeStream = require('stream')
let FS = require('fs')
let Helpers = require('./Helpers')
let Path = require('path')
class UCompiler{
  static compileFile(FilePath, Options){
    Options = Helpers.normalizeOptions(Options)
    Options.File = {Path: FilePath, Extension: Path.extname(FilePath), Dir: Path.dirname(FilePath)}
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
        for(let _Stream of Streams){
          Stream = Stream.pipe(_Stream)
        }
        return Stream
      })
  }
  // To convert Streams to Promises
  static fromStream(Stream){
    let Deferred = Promise.defer()
    let Buffer = []
    Stream.on('data', function(data){
      Buffer.push(data)
    })
    Stream.on('end', function(){
      Deferred.resolve(Buffer.join(''))
    })
    Stream.on('error', function(error){
      Deferred.reject(error)
    })
    return Deferred.promise
  }
}

UCompiler.Plugins = new Set()

// Loading Plugins
require('../Plugins/Javascript').Register(UCompiler)
require('../Plugins/Uglify').Register(UCompiler)

module.exports = UCompiler

