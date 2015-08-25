'use strict'

const FS = require('fs')
const Path = require('path')
const Base = require('./base')

class GenericPlugin extends Base {
  constructor() {
    super()
    this.registerTag(['Compiler-Include'], function(name, value, options) {
      value = Path.resolve(options.internal.file.directory, value)
      options.internal.imports.push(value)
      return new Promise(function(resolve, reject) {
        FS.readFile(value, function (err, data) {
          if (err) return reject(err)

          const extension = options.internal.file.extension
          if (extension === '.js' || extension === '.coffee') {
            resolve(';(function(){ ' + data.toString() + ' })();')
          } else resolve(data.toString())
        })
      })
    })
    this.registerTag(['Compiler-Output'], function(name, value, options) {
      options.Output = Path.resolve(options.internal.file.directory, value)
    })
    this.registerTag(['Compiler-Compress', 'Compiler-Uglify', 'Compiler-Minify'], function(name, value, options) {
      options.Uglify = value === 'true'
    })
    this.registerTag(['Compiler-Babel', 'Compiler-Transpile'], function(name, value, options) {
      options.Babel = value === 'true'
    })
  }
  compile(contents, options) {
    return this.executeTags(contents, options)
  }
}

module.exports = GenericPlugin
