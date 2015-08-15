'use strict'
const JSToolkit = require('js-toolkit')
const FS = JSToolkit.promisifyAll(require('fs'))
const Path = require('path')
const CPPromise = require('childprocess-promise')
const UCompiler = require('./main-with-plugins.js')
const Process = new CPPromise

class WorkerThread {
  static scanDir (dirPath, ignore) {
    ignore = new RegExp(ignore)
    return FS.readdir(dirPath).then(function(contents){
      const Promises = []
      for (let entry of contents) {
        let entryPath = Path.join(dirPath, entry)
        if (ignore.test(entryPath)) continue
        Promises.push(FS.stat(entryPath).then(function(stat){
          return {stat, entryPath}
        }))
      }
      return Promise.all(Promises)
    }).then(function(stats) {
      const Promises = []
      const MyTree = {Files: [], Directories: []}
      for (let entry of stats) {
        if (entry.stat.isDirectory()) {
          Promises.push(WorkerThread.scanDir(entry.entryPath).then(function(contents){
            MyTree.Directories[entry.entryPath] = contents
          }))
        } else MyTree.Files.push(entry.entryPath)
      }
      return Promise.all(Promises).then(function() { return MyTree })
    })
  }
}

Process.on('SCAN', function(Job){
  const Info = Job.Message
  Job.returnValue = WorkerThread.scanDir(Info.Path, Info.Ignore)
})

