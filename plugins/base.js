'use strict'

class Plugin {
  constructor(Compiler) {
    this.compiler = Compiler
    this.tags = []
    this.commentToken = '\\\/\\\/'
  }
  registerTag(expressions, callback) {
    if (!(expressions instanceof Array)) throw new Error('Invalid Expressions Provided')
    if (typeof callback !== 'function') throw new Error('Invalid Callback Provided')

    const Me = this
    expressions = expressions.map(function(entry) {
      return new RegExp('\\s*?' + Me.commentToken + '\\s*?@?(' + entry + ')\\s+(?:"(.*?)"|(.*))', 'g')
    })
    this.tags.push({
      callback: callback,
      expressions: expressions,
    })
  }
  executeTags(_, options) {
    const that = this
    return this.tags.reduce(function(promise, value){
      return promise.then(function(_){
        return value.expressions.reduce(function(promise, entry){
          return promise.then(function(contents){
            const matches = []
            const promises = []
            let match
            while ((match = entry.exec(contents)) !== null) {
              matches.push(match[0])
              promises.push(Promise.resolve(value.callback(match[1], match[2] || match[3] || '', options))
                .then(function(result){ return result || '' })
              )
            }
            return Promise.all(promises).then(function(results) {
              while (results.length) {
                const result = results.pop()
                const matchEntry = matches.pop()
                contents = contents.replace(matchEntry, result)
              }
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
