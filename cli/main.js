#!/usr/bin/env node
'use strict'
process.title = 'ucompiler'

require('debug').enable('UCompiler:*')
var UCompiler = require('..')
var knownCommands = ['go', 'watch']
var parameters = process.argv.slice(2)

if (!parameters.length || knownCommands.indexOf(parameters[0]) === -1) {
  console.log('Usage: ucompiler go|watch [path]')
  process.exit(0)
}

if (parameters[0] === 'go') {
  UCompiler.compile(process.cwd(), parameters[1] || null, function(e) {
    console.error(e)
  }).then(function(result) {
    if (!result.status) {
      process.exit(1)
    }
  })
} else if (parameters[0] === 'watch') {
  UCompiler.watch(process.cwd(), parameters[1] || null, function(e) {
    console.error(e)
  })
}
