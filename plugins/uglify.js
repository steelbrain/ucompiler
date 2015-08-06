'use strict'

const Base = require('./base')
let Uglify

class PluginBabel extends Base {
  constructor() {
    super()
  }
  compile(contents, options) {
    return this.executeTags(contents, options).then(function(contents) {
      if (!options.Uglify) return contents
      Uglify = Uglify || require('uglifyjs')
      return Uglify.minify(contents, {fromString: true}).code
    })
  }
}

module.exports = PluginBabel
