'use strict'

class Plugin {
  constructor() {
    this.tags = []
    this.commentToken = '\\\/\\\/'
  }
  registerTag(expressions, callback) {
    if (!(expressions instanceof Array)) throw new Error('Invalid Expressions Provided')
    if (typeof callback !== 'function') throw new Error('Invalid Callback Provided')

    const Me = this
    expressions = expressions.map(function(entry) {
      return new RegExp(Me.commentToken + '\\s*?@?(' + entry + ')\\s+"(.*?)"', 'gi')
    })
    this.tags.push({
      callback: callback,
      expressions: expressions,
    })
  }
  executeTags(_, options) {
    return this.tags.reduce(function(promise, value){
      return promise.then(function(_){
        return value.expressions.reduce(function(promise, entry){
          return promise.then(function(contents){
            const matches = []
            const promises = []
            let match
            while ((match = entry.exec(contents)) !== null) {
              matches.push(match[0])
              promises.push(new Promise(function(resolve){
                resolve(value.callback(match[1], match[2] || '', options))
              }).then(function(value){
                  return value || "\n"
                }))
            }
            return Promise.all(promises).then(function(results) {
              contents = contents.replace(entry, function(){
                return results.shift()
              })
              return contents
            })
          })
        }, Promise.resolve(_))
      })
    }, Promise.resolve(_))
  }
  compile(contents) {
    return contents
  }
}

module.exports = Plugin
