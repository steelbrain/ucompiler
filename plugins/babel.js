'use strict'

const Base = require('./base')
let BabelJS

class PluginBabel extends Base {
  constructor() {
    super()
  }
  compile(contents, options) {
    if (!options.Babel || options.Browserify) return contents
    BabelJS = BabelJS || require('babel-core')
    return BabelJS.transform(contents, {
      filenameRelative: options.internal.file.name,
      sourceRoot: options.internal.file.directory,
      blacklist: options.blacklist
    }).code
  }
}

module.exports = PluginBabel