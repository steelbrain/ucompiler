'use babel'

/* @flow */

import Path from 'path'
import type {Ucompiler$Config, Ucompiler$Config$Rule} from '../types'
import {read} from './common'
import {CONFIG_FILE_NAME} from '../defaults'

export async function getConfig(directory: string, ruleName: ?string): Promise<Ucompiler$Config> {
  const configPath = Path.join(directory, CONFIG_FILE_NAME)
  let config
  let rule

  try {
    config = JSON.parse(await read(configPath))
  } catch (_) {
    throw new Error(`Malformed JSON configuration found at ${configPath}`)
  }

  return config
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
