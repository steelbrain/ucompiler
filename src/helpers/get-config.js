'use babel'

/* @flow */

import Path from 'path'
import type {Ucompiler$Config, Ucompiler$Config$Rule} from '../types'
import {read} from './common'
import {CONFIG_FILE_NAMES} from '../defaults'

export async function getConfig(directory: string, ruleName: ?string): Promise<Ucompiler$Config> {
  for (const entry of CONFIG_FILE_NAMES) {
    const configPath = Path.join(directory, entry)
    try {
      return JSON.parse(await read(configPath))
    } catch (_) {
      if (_.code !== 'ENOENT') {
        throw new Error(`Malformed JSON configuration found at ${configPath}`)
      }
    }
  }
  throw new Error(`No config file found in ${directory}`)
}

export function getConfigRule(config: Ucompiler$Config, ruleName: ?string): Ucompiler$Config$Rule {
  if (ruleName === null) {
    ruleName = config.defaultRule
  }

  for (const ruleEntry of config.rules) {
    if (ruleEntry.name === ruleName) {
      return ruleEntry
    }
  }
  throw new Error(`Rule ${ruleName} not found`)
}
