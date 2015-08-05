'use strict'

module.exports = {
  normalizeOptions: function(options) {
    options = options || {}
    options.internal = options.internal || {}
    return options
  },
}
