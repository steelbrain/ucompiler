#!/usr/bin/env node
"use strict"
let Main = require('../lib/main-with-plugins')
let Minimist = require('minimist')
let Options = Minimist(process.argv.slice(2))
let FS = require('fs')
try {
  Options.blacklist = String(Options.blacklist || '').split(',').map(function(e) { return e.trim() }).filter(function(e) { return e && e !== 'true' })
  if(!Options['_'].length) throw new Error("Please specify a file to compile")
  Main.compile(Options['_'][0], Options).then(Main.defaultOutput).catch(function(err){
    console.error(err)
  })
} catch(err){
  console.error(err)
}
