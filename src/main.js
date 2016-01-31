'use babel'

/* @flow */

import Path from 'path'
import FS from 'fs'
import {Disposable} from 'sb-event-kit'
import {findRoot} from './helpers/find-root'
import {scanFiles} from './helpers/scan-files'
import {getConfig} from './helpers/get-config'
import type {Ucompiler$Compile$Results} from './types'

export async function compile(
  directory: string, ruleName:?string = null, errorCallback: ?((error: Error) => void) = null
): Promise<Ucompiler$Compile$Results> {
  const rootDirectory = await findRoot(directory)
  const {config: globalConfig, rule: config} = await getConfig(rootDirectory, ruleName)
  const files = await scanFiles(rootDirectory, config)

  const results = {
    status: true,
    contents: [],
    sourceMaps: []
  }

  // TODO: Iterate over files here

  return results
}
