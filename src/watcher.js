'use babel'

/* @flow */

import Path from 'path'
import debug from 'debug'
import Chokidar from 'chokidar'
import {CompositeDisposable, Disposable} from 'sb-event-kit'
import {findRoot} from './helpers/find-root'
import {getConfig, getConfigRule} from './helpers/get-config'
import {validateNode} from './helpers/scan-files'
import {compileFile} from './helpers/compile-file'
import type {Stats} from 'fs'
import type {UCompiler$Options, Ucompiler$Config, Ucompiler$Compile$Result} from './types'
import type {Chokidar$Watcher, EventKit$CompositeDisposable} from './types-external'

export class Watcher {
  rootDirectory: string;
  config: Ucompiler$Config;
  options: UCompiler$Options;
  ruleNames: Array<string>;
  subscriptions: EventKit$CompositeDisposable;
  imports: Map<string, Array<string>>;
  locks: Set<string>;
  watcherReady: boolean;
  activation: {
    promises: Array<Promise>,
    results: Map<string, Ucompiler$Compile$Result>
  };

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
    this.locks = new Set()
    this.watcherReady = false
    this.activation = {
      promises: [],
      results: new Map()
    }
  }
  activate() {
    const watcher = Chokidar.watch([])
    const watcherCallback = filePath => {
      console.log('watcher', filePath)
    }

    for (const ruleName of this.ruleNames) {
      const config = getConfigRule(this.config, ruleName)
      for (const rule of config.include) {
        watcher.add(Path.join(this.rootDirectory, rule.directory))
      }
    }

    watcher.on('add', (filePath, stats) => this.handleChange(filePath, stats))
    watcher.on('change', (filePath, stats) => this.handleChange(filePath, stats))
    watcher.on('ready', () => {
      this.watcherReady = true
      console.log('ready')
    })

    this.subscriptions.add(new Disposable(function() {
      this.watcherReady = false
      watcher.close()
    }))
  }
  async handleChange(filePath: string, stats: Stats): Promise {
    for (const ruleName of this.ruleNames) {
      const config = getConfigRule(this.config, ruleName)
      for (const rule of config.include) {
        const ruleDirectory = Path.join(this.rootDirectory, rule.directory)
        if (filePath.indexOf(ruleDirectory) === 0 && validateNode(
          this.rootDirectory, filePath, config.exclude || [], rule.extensions, stats, false
        )) {
          this.locks.add(filePath)
          const result = await compileFile(this.rootDirectory, filePath, config)
          this.locks.delete(filePath)

          console.log(result)
          break
        }
      }
    }
  }
  dispose() {
    this.subscriptions.dispose()
    this.imports.clear()
    this.locks.clear()
    this.activation.promises = []
    this.activation.results.clear()
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
