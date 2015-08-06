'use strict'

const Base = require('./base')
let BabelJS

class PluginBabel extends Base {
  constructor() {
    super()
    this.registerTag(['Compiler-Babel', 'Compiler-Transpile'], function(name, value, options) {
      options.Babel = value === 'true'
    })
  }
  compile(contents, options) {
    return this.executeTags(contents, options).then(function(contents) {
      if (!options.Babel) return contents
      BabelJS = BabelJS || require('babel-core')
      return BabelJS.transform(contents, {
        filenameRelative: options.internal.file.name,
        sourceRoot: options.internal.file.directory,
      }).code
    })
  }
}

module.exports = PluginBabel
