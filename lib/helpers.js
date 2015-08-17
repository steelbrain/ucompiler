'use strict'

const Path = require('path')

const Helpers = module.exports ={
  validateParameters: function(filePath, options) {
    if (typeof filePath === 'undefined') throw new Error('filePath option is required')
    options = Helpers.normalizeOptions(options)
    options.internal.file = {
      filePath: filePath,
      extension: Path.extname(filePath),
      directory: Path.dirname(filePath),
      name: Path.basename(filePath),
    }
    options.internal.imports = []
    return options
  },
  normalizeOptions: function(options) {
    if (typeof options === 'object'){
      options = Object.create(options)
    } else options = {}
    options.internal = options.internal || {}
    options.Blacklist = options.Blacklist instanceof Array ? options.Blacklist : []
    return options
  },
}
