'use strict'

const Base = require('./base')
let Uglify

class PluginUglify extends Base {
  compile(contents, options) {
    if (!options.Uglify) return contents
    Uglify = Uglify || require('uglifyjs')
    return Uglify.minify(contents, {fromString: true}).code
  }
}

module.exports = PluginUglify
