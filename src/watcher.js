'use babel'

/* @flow */

import debug from 'debug'
import Chokidar from 'chokidar'
import {CompositeDisposable, Disposable} from 'sb-event-kit'
import {findRoot} from './helpers/find-root'
import {getConfig} from './helpers/get-config'
import type {UCompiler$Options, Ucompiler$Config} from './types'
import type {Chokidar$Watcher, EventKit$CompositeDisposable} from './types-external'

export class Watcher {
  rootDirectory: string;
  config: Ucompiler$Config;
  options: UCompiler$Options;
  ruleNames: Array<string>;
  subscriptions: EventKit$CompositeDisposable;

  constructor(
    rootDirectory:string,
    config: Ucompiler$Config,
    options: UCompiler$Options,
    ruleNames: Array<string>
  ) {
    this.rootDirectory = rootDirectory
    this.config = config
    this.options = options
    this.ruleNames = ruleNames
    this.subscriptions = new CompositeDisposable()
  }
  activate() {
    const watcher = Chokidar.watch([])
    watcher.on('ready', function() {
      console.log('ready')
    })
  }
  dispose() {

  }

  static async create(
    directory: string,
    options: UCompiler$Options,
    ruleNames: Array<string> = []
  ): Promise<Watcher> {
    const rootDirectory = await findRoot(directory)
    const {global: config} = await getConfig(rootDirectory)

    return new Watcher(rootDirectory, config, options, ruleNames)
  }
}
