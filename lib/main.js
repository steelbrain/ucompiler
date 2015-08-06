'use strict'

const FS = require('fs')
const Path = require('path')
const StreamPromise = require('sb-stream-promise')
const Helpers = require('./helpers')
const BasePlugin = require('../plugins/base.js')

class UCompiler {
  constructor() {
    this.plugins = []
  }
  addPlugin(Plugin, priority, extensions) {
    if (!Plugin) throw new Error('Invalid Plugin provided')
    if (!(extensions instanceof Array)) throw new Error('Invalid Extensions provided')
    priority = priority || 100
    this.plugins.push({plugin: new Plugin(this), priority, extensions})
  }
  compileFile(filePath, options) {
    const Parameters = Helpers.validateParameters(filePath, options)
    return StreamPromise.create(FS.createReadStream(Parameters.filePath)).then(function(contents) {
      return this.compile(contents, Parameters.options)
    }.bind(this))
  }
  validateChange(filePath, oldValue, options) {
    console.log(typeof Helpers)
    const Parameters = Helpers.validateParameters(filePath, options)
    console.log("Parameters", Parameters)
    return Promise.resolve(1)
  }

  // Don't use this directly unless you know what you're doing
  compile(contents, options) {
    return this.plugins.sort(function(a, b) {
      return a.priority - b.priority
    }).filter(function(entry) {
      return entry.extensions.indexOf(options.internal.file.extension) !== -1 || entry.extensions.indexOf('*') !== -1
    }).reduce(function(promise, entry) {
      return promise.then(function(updatedContents) {
        return entry.plugin.compile(updatedContents, options)
      })
    }, Promise.resolve(contents))
  }
}

UCompiler.BasePlugin = BasePlugin

module.exports = UCompiler
