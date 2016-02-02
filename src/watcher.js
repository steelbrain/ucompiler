'use babel'

/* @flow */

import Path from 'path'
import debug from 'debug'
import Chokidar from 'chokidar'
import {CompositeDisposable, Disposable} from 'sb-event-kit'
import {findRoot} from './helpers/find-root'
import {getConfig, getConfigRule} from './helpers/get-config'
import type {UCompiler$Options, Ucompiler$Config} from './types'
import type {Chokidar$Watcher, EventKit$CompositeDisposable} from './types-external'

export class Watcher {
  rootDirectory: string;
  config: Ucompiler$Config;
  options: UCompiler$Options;
  ruleNames: Array<string>;
  subscriptions: EventKit$CompositeDisposable;
  watcherReady: boolean;

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
    this.watcherReady = false
  }
  activate() {
    const watcher = Chokidar.watch([])
    const watcherCallback = filePath => {
      console.log('watcher')
    }

    this.ruleNames.forEach(ruleName => {
      const config = getConfigRule(this.config, ruleName)
      for (const rule of config.include) {
        watcher.add(Path.join(this.rootDirectory, rule.directory))
      }
    })

    watcher.on('add', watcherCallback)
    watcher.on('change', watcherCallback)
    watcher.on('ready', () => {
      this.watcherReady = true
      console.log('ready')
    })

    this.subscriptions.add(new Disposable(function() {
      this.watcherReady = false
      watcher.close()
    }))
  }
  dispose() {

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
