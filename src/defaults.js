'use babel'

import {Template} from 'string-templates'

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
  plugins: [],
  rules: []
}

export const template = Template.create()
