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

const options = {
  save: true,
  saveIncludedFiles: false,
  errorCallback: function(e) {
    console.log(e.stack || e)
  }
}
if (parameters[0] === 'go') {
  UCompiler.compile(process.cwd(), options, parameters[1] || null).then(function(result) {
    if (!result.status) {
      process.exit(1)
    }
  }, function(e) {
    errorCallback(e)
    process.exit(1)
  })
} else if (parameters[0] === 'watch') {
  UCompiler.watch(
    process.cwd(),
    options,
    parameters[1] ?
      parameters[1]
        .split(',')
        .map(function(_) { return _.trim()})
        .filter(function(_) { return _}) : parameters[1]
  ).catch(errorCallback)
}
