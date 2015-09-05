'use strict'

class Plugin {
  constructor() {
    this.tags = []
    this.commentMap = new Map()
    this.commentMap.set('.css', '\\\/\*')
    this.commentMap.set('.coffee', '\\#')
    this.commentMap.set('__default', '\\\/\\\/')
    this.tagsCache = new Map()
  }
  registerTag(expressions, callback) {
    if (!(expressions instanceof Array)) throw new Error('Invalid Expressions Provided')
    if (typeof callback !== 'function') throw new Error('Invalid Callback Provided')

    expressions = expressions.map(function(entry) {
      return '\\s*?@?(' + entry + ')\\s+"(.*?)"'
    })
    this.tags.push({
      callback: callback,
      expressions: expressions,
    })
  }
  getTags(extension) {
    if (this.tagsCache.has(extension)) {
      return this.tagsCache.get(extension)
    } else {
      const comment = this.commentMap.has(extension) ? this.commentMap.get(extension) : this.commentMap.get('__default')
      const tags = this.tags.map(function(tag) {
        return {
          callback: tag.callback,
          expressions: tag.expressions.map(function(expression) {
            return new RegExp(comment + expression, 'gi')
          })
        }
      })
      this.tagsCache.set(extension, tags)
      return tags
    }
  }
  executeTags(_, options) {
    return this.getTags(options.internal.file.extension).reduce(function(promise, value){
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
  compile() {
    throw new Error('Not Implemented')
  }
}

module.exports = Plugin
