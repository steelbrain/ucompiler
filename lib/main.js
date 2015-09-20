'use strict'

const FS = require('fs')
const Path = require('path')
const StreamPromise = require('sb-stream-promise')
const Helpers = require('./helpers')
const BasePlugin = require('../plugins/base.js')
const Anymatch = require('anymatch')

let LessJS

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
    filePath = Path.resolve(filePath)
    options = Helpers.validateParameters(filePath, options)
    return StreamPromise.create(FS.createReadStream(filePath)).then(contents =>
      this.compileContents(contents, options)
    ).then(contents => { return {options, contents} })
  }
  compileDirectory(dirPath, options, resultsHandler, ignored, recursive) {
    dirPath = Path.resolve(dirPath)

    recursive = Boolean(recursive)
    ignored = Anymatch(ignored || /[\/\\]\./)
    resultsHandler = resultsHandler || UCompiler.defaultOutput
    return new Promise(resolve => {
      const contents = FS.readdirSync(dirPath)
      const promises = []
      contents.forEach(entry => {
        const fullPath = Path.join(dirPath, entry)
        if (ignored(fullPath) || ignored(entry))
          return
        const stat = FS.statSync(fullPath)
        if (stat.isFile()) {
          promises.push(this.compileFile(fullPath, options).then(resultsHandler))
        } else if (stat.isDirectory() && recursive) {
          promises.push(this.compileDirectory(fullPath, options, resultsHandler, ignored, recursive))
        }
      })
      resolve(Promise.all(promises))
    })
  }
  compile(path, options, resultsHandler, ignored, recursive) {
    path = Path.resolve(path)
    return new Promise((resolve, reject) => {
      const stat = FS.statSync(path)
      if (stat.isFile()) {
        resolve(this.compileFile(path, options).then(resultsHandler))
      } else if (stat.isDirectory()) {
        resolve(this.compileDirectory(path, options, resultsHandler, ignored, recursive))
      } else reject(new Error('Unknown File Type'))
    })
  }

  // Don't use this directly unless you know what you're doing
  compileContents(contents, options) {
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
  static defaultOutput(Output) {
    const Options = Output.options
    Output = Output.contents
    if(Options.Output){
      FS.writeFileSync(Options.Output, Output)
    } else {
      process.stdout.write(Output)
    }
  }
  static defaultError(error) {
    let col = 0, line = 0, trace = '', file = ''
    if (error.loc) {
      line = error.loc.line || error.loc.row || 0
      col = error.loc.column || error.loc.col || error.loc.index || 0
    } else if (error.location) {
      line = error.location.line || error.location.row || 0
      col = error.location.column || error.location.col || error.location.index || 0
    } else if (error.position) {
      line = error.position.line || error.position.row || 0
      col = error.position.column || error.position.col || error.position.index || 0
    }

    line = line || error.line || error.row || 0
    col = col || error.col ||  error.column || error.index || 0
    trace = trace || error.codeFrame || error.trace || ''
    file = error.file || error.fileName || error.filename || null

    console.error('Error caught on line', line, 'col', col, (file ? 'in file ' + file : ''), ':', error.message, "\n" + trace)
  }
}

module.exports = UCompiler
module.exports.BasePlugin = BasePlugin
