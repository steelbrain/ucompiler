'use babel'

/* @flow */

import Path from 'path'
import type {Ucompiler$Config} from '../types'
import {read} from './common'
import {CONFIG_FILE_NAME} from '../defaults'

export async function getConfig(directory: string): Promise<Ucompiler$Config> {
  const configPath = Path.join(directory, CONFIG_FILE_NAME)
  try {
    return JSON.parse(await read(configPath))
  } catch (_) {
    throw new Error(`Malformed JSON configuration found at ${configPath}`)
  }
}
