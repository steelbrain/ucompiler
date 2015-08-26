'use strict'

const Base = require('./base')
const Path = require('path')
let LessJS

class PluginLess extends Base {
  constructor() {
    super()
  }
  compile(contents, options) {
    LessJS = LessJS || require('less')
    return new Promise(function(resolve, reject) {
      LessJS.render(contents, {
        filename: options.internal.file.name,
        sourceMap: options.SourceMap,
        paths: [options.internal.file.directory],
        compress: options.Uglify,
      }, function(error, output) {
        if (error) reject(error)
        else {
          options.internal.imports = output.imports.map(function(entry){
            return Path.resolve(options.internal.file.directory, entry)
          })
          resolve(output.css)
        }
      })
    })
  }
}

module.exports = PluginLess
