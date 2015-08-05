'use strict'

const Base = require('./base')
let Coffee

class PluginCoffee extends Base {
  constructor() {
    super()
    this.registerTag(['Coffee-Bare'], function(name, value, options) {
      options.CoffeeBare = value === 'true'
    })
  }
  compile(contents, options) {
    return this.executeTags(contents, options).then(contents => {
      Coffee = Coffee || require('coffee-script')
      const compiled = Coffee.compile(contents, {
        sourceMap: options.SourceMap,
        bare: Boolean(options.CoffeeBare),
        sourceRoot: options.internal.file.directory,
        sourceFiles: [options.internal.file.name],
      })
      if (options.SourceMap) {
        return compiled.js
      }
      return compiled
    })
  }
}

module.exports = PluginCoffee
