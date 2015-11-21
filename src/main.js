'use babel'

import {getConfig, scanFiles} from './helpers'

export function compile(path, options = {
  root: process.cwd(),
  ignored: ['{**/, }node_modules/**', '{**/, }.git/**']
}) {
  const config = getConfig(options.root)
  const files = scanFiles(path, {root: options.root, ignored: options.ignored})
  console.log(config, files)
}
compile('**/*.js')
