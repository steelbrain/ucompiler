'use strict'

class Plugin {
  constructor(Compiler) {
    this.Compiler = Compiler
  }
  compile(contents, options) {
    return contents
  }
}

module.exports = Plugin
