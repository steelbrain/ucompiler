'use babel'

/* @flow */

import Path from 'path'
import {findCached} from './common'
import {CONFIG_FILE_NAMES} from '../defaults'

export async function findRoot(directory: string): Promise<string> {
  for (const entry of CONFIG_FILE_NAMES) {
    const configFile = await findCached(directory, entry)
    if (configFile) {
      return Path.dirname(configFile)
    }
  }
  throw new Error('No configuration found file')
}
