// @Compiler-Transpile "true"
// @Compiler-Output "./watcher.js"
const Path = require('path')
const JSToolkit = require('js-toolkit')
const FS = JSToolkit.promisifyAll(require('fs'))
const CPPromise = require('childprocess-promise')
const EventEmitter = require('events').EventEmitter
const Chokidar = require('chokidar')

class Watcher extends EventEmitter {
  constructor(rootPath, ignored) {
    super()
    ignored = ignored && ignored instanceof Array ? [] : []
    this.fswatcher = Chokidar.watch(rootPath, {
        ignored: [/[\/\\]\./, /node_modules/, /bower_components/, new RegExp('___jb_bak___$'), new RegExp('___jb_old___$')].concat(ignored),
      followSymlinks: true,
      persistent: true
    })
    this.process = new CPPromise(__dirname + '/watcher-thread')
    this.imports = new Map()
    this.fswatcher.on('change', path => {
      this.compileFile(path)
    })
    this.fswatcher.on('error', e => this.emit('error', e))
  }
  scan(dirPath, Ignore) {
    Ignore = Ignore || '^\\.|node_modules|bower_components'
    return this.process.request('SCAN', {Path: dirPath, Ignore})
  }
  compileFile(path){
    path = Path.resolve(path)
    for (let entry of this.imports) {
      if (entry[1].indexOf(path) === -1) continue
      return this.compileFile(entry[0])
    }
    this.compile(path).then(result => {
      if (result.options.Output) {
        return FS.writeFile(result.options.Output, result.contents).then(() => result)
      } else return result
    }).then(result => {
      this.imports.set(path, result.options.internal.imports)
    })
  }
  compile(filePath, options) {
    options = options || {}
    return this.process.request('COMPILE', {Path: filePath, Options: options}).catch(e => this.emit('error', e))
  }
  disconnect() {
    this.process.disconnect()
    this.fswatcher.close()
  }
  kill() {
    this.fswatcher.close()
    this.process.kill()
  }
  onError(callback){
    this.on('error', callback)
  }
}

module.exports = Watcher
