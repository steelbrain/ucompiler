'use babel'

/* @flow */

import Path from 'path'
import {findCached, normalizePath} from './common'
import {CONFIG_FILE_NAME} from '../defaults'

export async function findRoot(directory: string): Promise<string> {
  const configFile = await findCached(directory, CONFIG_FILE_NAME)
  if (configFile) {
    return normalizePath(Path.dirname(configFile))
  } else throw new Error('No configuration found file')
}
