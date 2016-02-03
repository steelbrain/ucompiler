'use babel'

/* @flow */

export type Chokidar$Watcher = {}
export type EventKit$Disposable = {
  dispose: (() => void)
}
export type EventKit$Emitter = {
  on: ((eventName: string, handler: Function) => EventKit$Disposable),
  off: ((eventName: string, handler: Function) => void),
  emit: ((eventName: string, ...parameters: any) => void),
  clear: (() => void),
  dispose: (() => void)
}
export type EventKit$CompositeDisposable = {
  dispose: (() => boolean),
  add: ((disposable: EventKit$Disposable) => void),
  remove: ((disposable: EventKit$Disposable) => void),
  clear: (() => void)
}
