'use strict'

const Base = require('./base')
let Uglify

class PluginUglify extends Base {
  constructor() {
    super()
  }
  compile(contents, options) {
    if (!options.Uglify && !options.Compress) return contents
    Uglify = Uglify || require('uglifyjs')
    return Uglify.minify(contents, {fromString: true}).code
  }
}

module.exports = PluginUglify
