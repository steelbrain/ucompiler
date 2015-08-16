'use strict'
const JSToolkit = require('js-toolkit')
const FS = JSToolkit.promisifyAll(require('fs'))
const CPPromise = require('childprocess-promise')
const EventEmitter = require('events').EventEmitter
const Chokidar = require('chokidar')

class Watcher extends EventEmitter {
  constructor(rootPath) {
    super()
    this.fswatcher = Chokidar.watch(rootPath, {
      ignored: [/[\/\\]\./, /node_modules/, /bower_components/],
      followSymlinks: true,
      persistent: true
    })
    this.process = new CPPromise('./watcher-thread')
    this.imports = new Map()
    this.fswatcher.on('change', function(path) {
      this.compile(path).then(function(result) {
        if (result.options.Output) {
          return FS.writeFile(result.options.Output, result.content).then(function(){
            return result
          })
        } else return result
      }).then(function(result){
        this.imports.set(path, result.options.internal.imports)
        for (let entry of this.imports) {
          if (entry[1].indexOf(path) === -1) continue
          this.compile(entry[0])
        }
      }.bind(this))
    }.bind(this))
    this.fswatcher.on('addDir', function(path) {
      this.fswatcher.add(path)
    }.bind(this))
  }
  scan(dirPath, Ignore) {
    Ignore = Ignore || '^\\.|node_modules|bower_components'
    return this.process.request('SCAN', {Path: dirPath, Ignore})
  }
  compile(filePath, options) {
    options = options || {}
    return this.process.request('COMPILE', {Path: filePath, Options: options}).catch(function(e){
      this.emit('error', e.stack)
    }.bind(this))
  }
  disconnect() {
    this.process.disconnect()
  }
  kill() {
    this.process.kill()
  }
  onError(callback){
    this.on('error', callback)
  }
}

module.exports = Watcher
