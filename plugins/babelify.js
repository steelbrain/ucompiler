'use strict'

const Path = require('path')
const Stream = require('stream')
const Base = require('./base')

let BabelJS
let Browserify
let Babelify

class PluginBabelify extends Base {
  constructor() {
    super()
    this.registerTag(['Compiler-Babel', 'Compiler-Transpile'], function(name, value, options) {
      options.Babel = value === 'true'
    })
    this.registerTag(['Compiler-Browserify'], function(name, value, options) {
      options.Browserify = value === 'true'
    })
    this.registerTag(['Browserify-Exclude'], function(name, value, options) {
      options.internal.browserify.excluded.push(value)
    })
    this.registerTag(['Browserify-Ignore'], function(name, value, options) {
      options.internal.browserify.ignored.push(value)
    })
    this.registerTag(['Browserify-Exclude'], function(name, value, options) {
      options.internal.browserify.excluded.push(value)
    })
    this.registerTag(['Browserify-Require'], function(name, value, options) {
      options.internal.browserify.required.push(value)
    })
    this.registerTag(['Babel-Plugin'], function(name, value, options) {
      options.internal.babel.plugins.push(value)
    })
  }
  compile(contents, options) {
    options.internal.browserify = {
      required: [],
      excluded: [],
      ignored: [],
      external: []
    }
    options.internal.babel = {
      plugins: []
    }
    return this.executeTags(contents, options).then(contents => {
      if (options.Babel && !options.Browserify) {
        return this.compileBabel(contents, options)
      } else if (options.Browserify) {
        return this.compileBrowserify(contents, options)
      } else return contents
    })
  }
  compileBabel(contents, options) {
    BabelJS = BabelJS || require('babel-core')
    return BabelJS.transform(contents, {
      filenameRelative: options.internal.file.name,
      sourceRoot: options.internal.file.directory,
      blacklist: options.Blacklist,
      plugins: options.internal.babel.plugins
    }).code
  }
  compileBrowserify(contents, options) {
    Browserify = Browserify || require('browserify')

    const Readable = new Stream.Readable()
    Readable._read = function() {
      Readable.push(contents)
      Readable.push(null)
    }

    let browserified = new Browserify(Readable, {
      basedir: options.internal.file.directory,
      debug: options.SourceMap,
      fullPaths: false,
      filename: options.internal.file.path,
      paths: [Path.join(__dirname, '..', 'node_modules'), Path.join(__dirname, 'node_modules')]
    })
    if (options.Babel) {
      Babelify = Babelify || require('babelify').configure({
          blacklist: options.Blacklist,
          plugins: options.internal.babel.plugins
        })
      browserified = browserified.transform(Babelify)
    }
    options.internal.browserify.required.forEach(function(file){
      browserified.require(file)
    })
    options.internal.browserify.excluded.forEach(function(file){
      browserified.exclude(file)
    })
    options.internal.browserify.ignored.forEach(function(file){
      browserified.ignore(file)
    })
    options.internal.browserify.external.forEach(function(file){
      browserified.external(file)
    })
    return new Promise(function(resolve, reject) {
      browserified.bundle(function(err, buffer) {
        if (err) reject(err)
        else resolve(buffer.toString())
      })
      browserified.pipeline.on('file', function(file){
        options.internal.imports.push(file)
      })
    })
  }
}

module.exports = PluginBabelify
