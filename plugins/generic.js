'use strict'

const FS = require('fs')
const Base = require('./base')

class GenericPlugin extends Base {
  constructor() {
    super()
    this.registerTag(['Compiler-Include'], function(name, value) {
      return new Promise(function(resolve, reject) {
        FS.readFile(value, function (err, data) {
          if (err) reject(err)
          else resolve(data.toString())
        })
      })
    })
    this.registerTag(['Compiler-Output'], function(name, value, options) {
      options.Output = value
    })
    this.registerTag(['Compiler-Compress', 'Compiler-Uglify'], function(name, value, options) {
      options.Uglify = value === 'true'
    })
  }
  compile(contents, options) {
    return this.executeTags(contents, options)
  }
}

module.exports = GenericPlugin
