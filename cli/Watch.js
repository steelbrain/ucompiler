#!/usr/bin/env node
"use strict"
let Main = require('../lib/main-with-plugins')
let Minimist = require('minimist')
let FSWatcher = require('node-fswatcher')
let Options = Minimist(process.argv.slice(2))
let FS = require('fs')
try {
  if(!Options['_'].length) throw new Error("Please specify a file/directory to watch")
  let Watcher = new FSWatcher
  Watcher.watch(Options['_'][0])
  Watcher.on('update', function(Info){
    FS.access(Info.Path, FS.R_OK, function(err){
      if(!err)
        Main.compileFile(Info.Path, Options).then(function(Output) {
          if(Options.Output){
            FS.writeFileSync(Options.Output, Output)
          }
        }).catch(function(err){
          console.log(err)
        })
    })
  })
} catch(err){
  console.log(err)
}
