'use strict'
const CPPromise = require('childprocess-promise')

class Watcher {
  constructor(rootPath) {
    this.process = new CPPromise('./watcher-thread')
    this.rootPath = rootPath
    this.fileTree = {Files: [], Directories: []}
  }
  scan(dirPath, Ignore) {
    Ignore = Ignore || '^\\.'
    return this.process.request('SCAN', {Path: dirPath, Ignore}).then(function(tree){
      if (this.rootPath === dirPath) {
        this.fileTree = tree
      }
      return tree
    }.bind(this))
  }
  disconnect() {
    this.process.disconnect()
  }
  kill() {
    this.process.kill()
  }
}

module.exports = Watcher
