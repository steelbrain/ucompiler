'use strict'

const Base = require('./base')
let Less

class PluginLessCompress extends Base {
  compile(contents, options) {
    if (!options.Uglify) return contents
    Less = Less || require('less')
    return new Promise(function(resolve, reject) {
      Less.render(contents, {
        filename: options.internal.file.name,
        sourceMap: options.SourceMap,
        paths: [options.internal.file.directory],
        compress: true
      }, function(error, output) {
        if (error) reject(error)
        else {
          options.internal.imports = output.imports
          resolve(output.css)
        }
      })
    })
  }
}

module.exports = PluginLessCompress
