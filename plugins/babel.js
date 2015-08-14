'use strict'

const Base = require('./base')
let BabelJS

class PluginBabel extends Base {
  constructor() {
    super()
  }
  compile(contents, options) {
    if (!options.Babel || options.Browserify) return contents
    options.BlackList = options.BlackList instanceof Array ? options.BlackList : []
    BabelJS = BabelJS || require('babel-core')
    return BabelJS.transform(contents, {
      filenameRelative: options.internal.file.name,
      sourceRoot: options.internal.file.directory,
      blacklist: options.BlackList
    }).code
  }
}

module.exports = PluginBabel
