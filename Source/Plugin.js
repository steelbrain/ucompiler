"use strict"
let NodeStream = require('stream')
let Path = require('path')
let FS = require('fs')
class Plugin{
  static Initialize(){
    this.Tags = new Map()
    this.Tags.set('Compiler-Output', function(Name, Value, Buffer, Options){
      Options.Output = Path.resolve(Path.dirname(Options.File.Path), Value)
    })
    this.Tags.set('Compiler-Include', function(Name, Value, Buffer, Options){
      return new Promise(function(Resolve){
        FS.readFile(Path.resolve(Path.dirname(Options.File.Path), Value), function(_, Contents){
          Resolve(Contents || ' ')
        })
      })
    })
    this.Info = {
      Name: "Plugin",
      Priority: 1,
      Extensions: []
    }
  }
  static Stream(Options){
    let Me = this
    let Stream = new NodeStream.Transform({
      objectMode: true,
      transform: function (Buffer, Encoding, Callback) {
        new Promise(function (Resolve) {
          Resolve(Me.Process(Buffer.toString("utf8"), Options))
        }).then(function(Contents){
            Stream.push(Contents)
            Callback()
          }, function(e){
            Stream.emit('error', e)
          })
      }
    })
    return Stream
  }
  static ProcessTags(CommentToken, Buffer, Options){
    let Me = this
    return new Promise(function(Resolve){
      let Regex = new RegExp(' *' + CommentToken.replace('//', '\\/\\/') + ' @([\\w-]+) "(.+)"', 'g')
      let Result
      let Promises = []
      while((Result = Regex.exec(Buffer)) !== null){
        if(Me.Tags.has(Result[1])){
          Promises.push(Me.Tags.get(Result[1])(Result[1], Result[2], Buffer, Options) || '')
        } else Promises.push(Result[0])
      }
      Resolve(Promise.all(Promises))
    }).then(function(Results){
        let Regex = new RegExp(' *' + CommentToken.replace('//', '\\/\\/') + ' @([\\w-]+) "(.+)"', 'g')
        return Buffer.replace(Regex, function(){
          return Results.shift()
        })
      })
  }
  static Validate(Options){
    return this.Info.Extensions.indexOf(Options.File.Extension) !== -1
  }
  static Register(UCompiler){
    UCompiler.Plugins.add(this)
  }
}

module.exports = Plugin