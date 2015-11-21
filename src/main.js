'use babel'

import FS from 'fs'
import {getConfig, scanFiles} from './helpers'
import Debug from 'debug'

Debug.enable('UCompiler:*')
const debug = Debug('UCompiler:Main')

export function compile(path, options = {
  root: process.cwd(),
  ignored: ['{**/, }node_modules/**']
}) {
  const config = getConfig(options.root)
  const files = scanFiles(path, {root: options.root, ignored: options.ignored})
  const plugins = config.plugins.map(function(module) {
    if (module.indexOf('ucompiler-plugin-') === 0) {
      return require(module)
    } else return require(`ucompiler-plugin-${module}`)
  })

  files.forEach(function(file) {
    // const contents = FS.readFileSync(file, {encoding: 'utf8'})
    debug(`Compiling ${file}`)
  })
}
//compile('**/*.js')
//compile(__dirname)
