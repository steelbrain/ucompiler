"use strict"
let NodeStream = require('stream')
class Plugin{
  static Stream(Options){
    let Me = this
    return new Promise(function(Resolve, Reject){
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
module.exports = Plugin