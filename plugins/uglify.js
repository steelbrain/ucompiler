'use strict'

const Base = require('./base')
let Uglify

class PluginBabel extends Base {
  constructor() {
    super()
    this.registerTag(['Compiler-Compress', 'Compiler-Uglify'], function(name, value, options) {
      options.Uglify = value === 'true'
    })
  }
  compile(contents, options) {
    return this.executeTags(contents, options).then(contents => {
      if (!options.Uglify) return contents
      Uglify = Uglify || require('uglifyjs')
      return Uglify.minify(contents, {fromString: true}).code
    })
  }
}

module.exports = PluginBabel
