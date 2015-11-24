'use babel'

import {findRoot} from './helpers/find-root'
import {getConfig} from './helpers/get-config'
import {findFiles} from './helpers/find-files'
import Util from 'util'

export function compile(path, givenOptions = {}) {
  const options = Object.assign({
    ignored: [],
    root: null,
    cwd: null,
    rules: {}
  }, givenOptions)

  const root = findRoot(path, options)
  const config = getConfig(root)
  const state = {
    root: root,
    config: config
  }
  const files = findFiles(path, options.ignored, state)

  console.log(files)
}

compile('src/helpers', {cwd: process.cwd()})
