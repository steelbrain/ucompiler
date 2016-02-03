'use babel'

/* @flow */

import Path from 'path'
import Chokidar from 'chokidar'
import {CompositeDisposable, Disposable} from 'sb-event-kit'
import {stat} from './helpers/common'
import {findRoot} from './helpers/find-root'
import {getConfig, getConfigRule} from './helpers/get-config'
import {validateNode} from './helpers/scan-files'
import {compileFile} from './helpers/compile-file'
import {getParents} from './helpers/get-parents'
import {saveFile} from './helpers/save-file'
import type {Stats} from 'fs'
import type {UCompiler$Options, Ucompiler$Config, Ucompiler$Compile$Result, Ucompiler$Config$Rule} from './types'
import type {Chokidar$Watcher, EventKit$CompositeDisposable} from './types-external'

const debug = require('debug')('UCompiler:Watcher')

export class Watcher {
  rootDirectory: string;
  config: Ucompiler$Config;
  options: UCompiler$Options;
  ruleNames: Array<string>;
  subscriptions: EventKit$CompositeDisposable;
  imports: Map<string, Array<string>>;
  results: Map<string, Ucompiler$Compile$Result>;
  locks: Set<string>;
  watcherReady: boolean;
  activationPromises: Array<Promise>;

  constructor(
    rootDirectory:string,
    config: Ucompiler$Config,
    options: UCompiler$Options,
    ruleNames: Array<string>
  ) {
    this.rootDirectory = rootDirectory
    this.config = config
    this.options = options
    this.ruleNames = ruleNames.length ? ruleNames : [config.defaultRule]
    this.subscriptions = new CompositeDisposable()
    this.imports = new Map()
    this.results = new Map()
    this.locks = new Set()
    this.watcherReady = false
    this.activationPromises = []
  }
  activate() {
    const watcher = Chokidar.watch([])
    const watcherCallback = (filePath, stats) => {
      const promise = this.handleChange(filePath, stats).catch(this.options.errorCallback)
      if (!this.watcherReady) {
        this.activationPromises.push(promise)
      }
    }

    for (const ruleName of this.ruleNames) {
      const config = getConfigRule(this.config, ruleName)
      for (const rule of config.include) {
        watcher.add(Path.join(this.rootDirectory, rule.directory))
      }
    }

    watcher.on('add', watcherCallback)
    watcher.on('change', watcherCallback)
    watcher.on('ready', () => {
      Promise.all(this.activationPromises).then(() => {
        this.watcherReady = true
        debug('Initial scan complete')
        for (const [filePath] of this.results) {
          this.handleChange(filePath)
        }
      })
    })

    this.subscriptions.add(new Disposable(function() {
      this.watcherReady = false
      watcher.close()
    }))
  }
  async handleChange(filePath: string, stats: ?Stats = null): Promise {
    if (this.locks.has(filePath)) {
      return
    }
    if (!stats) {
      stats = await stat(filePath)
    }
    const watcherReady = this.watcherReady
    for (const ruleName of this.ruleNames) {
      const config = getConfigRule(this.config, ruleName)
      for (const rule of config.include) {
        const ruleDirectory = Path.join(this.rootDirectory, rule.directory)
        if (filePath.indexOf(ruleDirectory) === 0 && validateNode(
          this.rootDirectory, filePath, config.exclude || [], rule.extensions, stats, true
        )) {
          this.locks.add(filePath)
          const result = await compileFile(this.rootDirectory, filePath, config)
          this.imports.set(filePath, result.state.imports)
          this.results.set(filePath, result)
          if (watcherReady) {
            await this.writeFile(filePath, result, config)
          }
          this.locks.delete(filePath)
          break
        }
      }
    }
  }
  async writeFile(
    filePath: string,
    result: Ucompiler$Compile$Result,
    config: Ucompiler$Config$Rule
  ): Promise {
    if (!this.options.save) {
      return
    }
    const parents = getParents(this.imports, filePath)
    if (!parents.length || this.options.saveIncludedFiles) {
      await saveFile(this.rootDirectory, result, config)
    }
    for (const parent of parents) {
      this.handleChange(parent)
    }
  }
  dispose() {
    this.subscriptions.dispose()
    this.imports.clear()
    this.locks.clear()
    this.results.clear()
    this.activationPromises = []
  }

  static async create(
    directory: string,
    options: UCompiler$Options,
    ruleNames: Array<string> = []
  ): Promise<Watcher> {
    const rootDirectory = await findRoot(directory)
    const config = await getConfig(rootDirectory, null)

    return new Watcher(rootDirectory, config, options, ruleNames)
  }
}
