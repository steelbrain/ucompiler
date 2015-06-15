"use strict"
let NodeStream = require('stream')
let Path = require('path')
class Plugin{
  static Stream(Options){
    let Me = this
    return new Promise(function(Resolve){
      let Stream = NodeStream.Transform({objectMode: true})
      Stream._transform = function(Buffer, Encoding, Callback){
        Promise.resolve(Me.Process(Buffer.toString(), Options)).then(function(Contents){
          Stream.push(Contents)
          Callback()
        })
      }
      Resolve(Stream)
    })
  }
  static ProcessTags(CommentToken, Buffer, Options){
    let Me = this
    return new Promise(function(Resolve){
      let Regex = new RegExp(' *' + CommentToken.replace('//', '\\/\\/') + ' @([\\w-]+) "(.+)"', 'g')
      let Result
      let Promises = []
      while((Result = Regex.exec(Buffer)) !== null){
        try {
          if(Me.Tags.has(Result[1])){
            Promises.push(Me.Tags.get(Result[1])(Result[1], Result[2], Buffer, Options) || '')
          } else Promises.push(Result[0])
        } catch(Err){
          console.error(Err)
          Promises.push(Result[0])
        }
      }
      Resolve(Promise.all(Promises))
    }).then(function(Results){
        let Regex = new RegExp(' *' + CommentToken.replace('//', '\\/\\/') + ' @([\\w-]+) "(.+)"', 'g')
        Buffer = Buffer.replace(Regex, function(){
          return Results.pop()
        })
        return Buffer
      })
  }
  static Validate(Options){
    return this.Info.Extensions.indexOf(Options.File.Extension) !== -1
  }
  static Register(UCompiler){
    UCompiler.Plugins.add(this)
  }
}

Plugin.Info = {
  Name: "Plugin",
  Priority: 1,
  Extensions: []
}
Plugin.Tags = new Map()
Plugin.Tags.set('Compiler-Output', function(Name, Value, Buffer, Options){
  Options.Output = Path.resolve(Path.dirname(Options.File.Path), Value)
})
module.exports = Plugin