#!/usr/bin/env node
"use strict"
const FSWatcher = require('../lib/watcher')
const Main = require('../lib/main')
const Minimist = require('minimist')
const Options = Minimist(process.argv.slice(2))
const FS = require('fs')

try {
  Options.Blacklist = String(Options.Blacklist || '').split(',').map(function(e) { return e.trim() }).filter(function(e) { return e && e !== 'true' })
  if(!Options['_'].length) throw new Error("Please specify a file/directory to watch")
  let Watcher = new FSWatcher(Options['_'][0], Options.Ignored)
  Watcher.on('error', Main.defaultError)
} catch(err){
  console.error(err)
}
