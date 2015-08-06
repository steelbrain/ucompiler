'use strict'

const Stream = require('stream')
const Base = require('./base')
let Browserify

class PluginBrowserify extends Base {
  constructor() {
    super()
    this.registerTag(['Compiler-Browserify'], function(name, value, options) {
      options.Browserify = value === 'true'
    })
  }
  compile(contents, options) {
    return this.executeTags(contents, options).then(function(contents) {
      if (!options.Browserify) return contents
      Browserify = Browserify || require('browserify')
      const Readable = new Stream.Readable()
      Readable._read = function() {
        Readable.push(contents)
        Readable.push(null)
      }
      const browserified = new Browserify(Readable, {
        basedir: options.internal.file.directory,
        debug: options.SourceMap,
        fullPaths: false,
        filename: options.internal.file.path,
      })
      return new Promise(function(resolve, reject) {
        browserified.bundle(function(err, buffer) {
          if (err) reject(err)
          else resolve(buffer.toString())
        })
      })
    })
  }
}

module.exports = PluginBrowserify
