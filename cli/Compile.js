#!/usr/bin/env node
"use strict"
let Main = require('../lib/main-with-plugins')
let Minimist = require('minimist')
let Options = Minimist(process.argv.slice(2))
let FS = require('fs')
try {
  if(!Options['_'].length) throw new Error("Please specify a file to compile")
  Main.compileFile(Options['_'][0], Options).then(function(Output) {
    Output = Output.contents
    if(Options.Output){
      FS.writeFileSync(Options.Output, Output)
    } else {
      process.stdout.write(Output)
    }
  }).catch(function(err){
    console.log(err)
  })
} catch(err){
  console.log(err)
}
