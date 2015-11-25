'use babel'

import Path from 'path'
import FS from 'fs'
import {findRoot} from './helpers/find-root'
import {findFiles} from './helpers/find-files'
import {getConfig} from './helpers/get-config'
import {getRules} from './helpers/get-rules'
import {getPlugins} from './helpers/get-plugins'
import {saveFile} from './helpers/save-file'
import {execute} from './helpers/execute'

export function compile(path = null, givenOptions = {}) {
  const options = Object.assign({
    ignored: [],
    root: null,
    cwd: null,
    config: {}
  }, givenOptions)

  const root = findRoot(path, options)
  const config = Object.assign({}, options.config, getConfig(root))
  const files = findFiles(path, options.ignored, {root, config})

  return Promise.all(files.map(function({relativePath, absolutePath, fileName}) {
    // TODO: Reverse source maps when they change
    const localConfig = getRules(relativePath, config)
    const plugins = getPlugins(root, localConfig)
    const contents = FS.readFileSync(absolutePath, {encoding: 'utf8'})
    const state = {sourceMap: null, imports: [], ext: Path.extname(fileName).slice(1)}
    const paths = {root, relativePath, absolutePath, fileName}

    return execute(plugins, contents, paths, {state, config: localConfig}).then(function(newContents) {
      return saveFile(newContents, localConfig, paths, state)
    })
  }))
}
