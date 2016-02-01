'use babel'

/* @flow */

import {Template} from 'string-templates'

export const CONFIG_FILE_NAME: string = '.ucompiler'
export const STATE_FILE_NAME: string = '.ucompiler.state'

export const DEFAULT_IGNORED: Array<string> = [
  'node_modules',
  'bower_components',
  'coverage',
  't{e,}mp',
  '*.min.js',
  '*.log',
  'bundle.js',
  'fixture{-*,}.{js,jsx}',
  'spec',
  'test{s, }',
  'fixture{s, }',
  'vendor',
  'dist',
  '*___jb_old___',
  '*___jb_bak___',
  '*.dist.*'
]

export const template:{
  render: ((template: string, parameters: Object) => string),
} = Template.create()
