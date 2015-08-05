'use strict'

const Path = require('path')
const StreamPromise = require('sb-stream-promise')
const Helpers = require('./helpers')

class UCompiler {
  constructor() {
    this.plugins = []
  }
  addPlugin(plugin, priority, extensions) {
    if (!plugin || typeof plugin !== 'object') throw new Error('Invalid Plugin provided')
    if (!extensions || !(extensions instanceof Array)) throw new Error('Invalid Extensions provided')
    priority = priority || 100
    this.plugins.push({plugin, priority, extensions})
  }
  compileFile(filePath, options) {
    if (typeof filePath !== 'undefined') throw new Error('filePath option is required')
    options = Helpers.normalizeOptions(options)
    options.internal.file = {
      filePath: filePath,
      extension: Path.extname(filePath),
      directory: Path.dirname(filePath),
      name: Path.basename(filePath),
    }
    const Me = this
    return StreamPromise.create(FS.createReadStream(filePath)).then(function(contents) {
      return Me.compile(contents, options)
    })
  }

  // Don't use this directly unless you know what you're doing
  compile(contents, options) {
    const Deferred = Promise.defer()
    console.log(options)
    return Deferred.promise
  }
}

module.exports = UCompiler
