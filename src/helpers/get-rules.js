'use babel'

import isGlob from 'is-glob'
import {isMatch} from 'micromatch'

export function getRules(relativePath, config) {
  const localConfig = {}

  for (const key in config) {
    const value  = config[key]

    if (value && value instanceof Array) {
      localConfig[key] = value.slice()
    } else if (typeof value === 'object') {
      localConfig[key] = Object.assign({}, value)
    } else {
      localConfig[key] = value
    }
  }

  config.rules.forEach(function(rule) {
    const matches = isGlob(rule.path) ? isMatch(relativePath, rule.path) : relativePath === rule.path
    if (matches) {
      for (const key in rule) {
        if (typeof localConfig[key] !== 'undefined' && localConfig[key] instanceof Array) {
          localConfig[key] = localConfig[key].concat(rule[key])
        } else {
          localConfig[key] = rule[key]
        }
      }
    }
  })

  delete localConfig.rules
  delete localConfig.path

  return localConfig
}
