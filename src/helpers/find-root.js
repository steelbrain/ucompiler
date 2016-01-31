'use babel'

/* @flow */

import Path from 'path'
import {findCached} from './common'
import {CONFIG_FILE_NAME} from '../defaults'

export function findRoot(directory: string): string {
  const configFile = findCached(directory, CONFIG_FILE_NAME)
  if (configFile !== null) {
    return Path.dirname(String(configFile))
  } else return directory
}
