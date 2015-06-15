"use strict"
let NodeStream = require('stream')
let FS = require('fs')
let Helpers = require('./Helpers')
class UCompiler{
  static compileFile(Path, Options){
    return UCompiler.compileStream(FS.createReadStream(Path), Options)
  }
  static compileString(Content, Options){
    let Stream = new NodeStream.Readable()
    Stream._read = function(){ }
    Stream.push(Content)
    Stream.push(null)
    return UCompiler.compileStream(Stream, Options)
  }
  static compileStream(Stream, Options){
    Options = Helpers.normalizeOptions(Options)
    console.log(Stream)
  }
}
module.exports = UCompiler