'use strict'

const Base = require('./base')
let PostCSS

class PluginPostCSS extends Base {
  constructor() {
    super()
    this.commentToken = '\\\/\*'
    this.registerTag(['CSS-Grace'], function(name, value, options) {
      options.CSSGrace = value === 'true'
    })
    this.registerTag(['PostCSS-Plugin'], function(name, value, options) {
      options.internal.postcss.plugins.add(value)
    })
    this.registerTag(['Compiler-Compress', 'Compiler-Uglify', 'Compiler-Minify'], function(name, value, options) {
      options.Uglify = value === 'true'
    })
  }
  compile(contents, options) {
    options.internal.postcss = {
      plugins: new Set()
    }
    return this.executeTags(contents, options).then(function(contents) {
      const Plugins = options.internal.postcss.plugins
      if (options.Uglify && options.internal.file.extension !== '.less') {
        Plugins.add('cssnano')
      }
      if (options.CSSGrace) {
        Plugins.add('cssgrace')
      }
      if (!Plugins.size) return contents
      PostCSS = PostCSS || require('postcss')
      const PluginsResolved = []
      Plugins.forEach(function(name){
        PluginsResolved.push(require(name))
      })
      // TODO: Remove this, this is to suppress deprecation warnings
      const warn = console.warn
      console.warn = null
      return PostCSS(PluginsResolved).process(contents, {from: options.internal.file.filePath})
        .then(function(result) { console.warn = warn; return result.css })
    })
  }
}

module.exports = PluginPostCSS
