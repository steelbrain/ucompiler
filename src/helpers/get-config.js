'use babel'

/* @flow */

import Path from 'path'
import type {Ucompiler$Config, Ucompiler$Config$Rule} from '../types'
import {read} from './common'
import {CONFIG_FILE_NAME} from '../defaults'

export async function getConfig(directory: string, ruleName: ?string): Promise<{
  global: Ucompiler$Config,
  config: Ucompiler$Config$Rule
}> {
  const configPath = Path.join(directory, CONFIG_FILE_NAME)
  let config
  let rule

  try {
    config = JSON.parse(await read(configPath))
  } catch (_) {
    throw new Error(`Malformed JSON configuration found at ${configPath}`)
  }

  if (ruleName === null) {
    ruleName = config.defaultRule
  }
  for (const ruleEntry of config.rules) {
    if (ruleEntry.name === ruleName) {
      rule = ruleEntry
      break
    }
  }

  if (!rule) {
    throw new Error(`Rule '${ruleName}' not found in config ${configPath}`)
  }

  return {
    global: config,
    config: rule
  }
}
