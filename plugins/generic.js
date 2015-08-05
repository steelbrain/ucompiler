'use strict'

const Base = require('./base')

class GenericPlugin extends Base {
  constructor() {
    super()
    this.registerTag(['Compiler-Output'], function(name, value, contents, options) {
      console.log('got to that thing')
      return "Hey"
    })
  }
  compile(contents, options) {
    return this.executeTags(contents, options)
  }
}

module.exports = GenericPlugin
