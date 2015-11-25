'use babel'

import {Template} from 'string-templates'

export const CONFIG_FILE_NAME = '.ucompilerrc'

export const DEFAULT_IGNORED = [
  'node_modules',
  'bower_components',
  'coverage',
  't{e, }mp',
  '*.min.js',
  '*.log',
  'bundle.js',
  'fixture{-*,}.{js,jsx}',
  'spec',
  'test{s, }',
  'fixture{s, }',
  'vendor',
  'dist'
]

export const DEFAULT_CONFIG = {
  outputPath: '{name}.dist.{state.ext}',
  plugins: [],
  rules: []
}

export const template = Template.create()
