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
    var Stream = new NodeStream.Transform({
      objectMode: true,
      transform: function (Buffer, Encoding, Callback) {
        Promise.resolve().then(function(){
          return Me.Process(Buffer.toString("utf8"), Options)
        }).then(function(Contents){
          Stream.push(Contents)
          Callback()
        }).catch(function(e){
          Stream.emit('error', e)
        })
      }
    })
    return Stream
  }
  static ProcessTags(CommentToken, Buffer, Options){
    let Regex = new RegExp(' *' + CommentToken.replace('//', '\\/\\/') + ' @([\\w-]+) "(.+)"', 'g')
    let Promises = []
    for(let Result; (Result = Regex.exec(Buffer)) !== null;){
      let Value
      if(this.Tags.has(Result[1])){
        Value = this.Tags.get(Result[1])(Result[1], Result[2], Buffer, Options) || ''
      } else Value = Result[0]
      Promises.push(Value)
    }
    return Promise.all(Promises).then(function(Results){
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