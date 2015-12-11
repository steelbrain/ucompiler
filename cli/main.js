#!/usr/bin/env node
'use strict'
process.title = 'ucompiler'

require('debug').enable('UCompiler:*')
const UCompiler = require('..')
const knownCommands = ['go', 'watch']
const parameters = process.argv.slice(2)

if (!parameters.length || knownCommands.indexOf(parameters[0]) === -1) {
  console.log('Usage: ucompiler go|watch [path]')
  process.exit(0)
}

if (parameters[0] === 'go') {
  UCompiler.compile(parameters[1] || null, {cwd: process.cwd()}).catch(function(e) {
    console.error(e)
    process.exit(1)
  })
} else if (parameters[0] === 'watch') {
  if (!parameters[1]) {
    console.error('You must specify a path to watch')
    process.exit(1)
  }
  UCompiler.watch(parameters[1])
}
