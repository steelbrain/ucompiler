'use strict';
'use babel';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.template = exports.DEFAULT_CONFIG = exports.DEFAULT_IGNORED = exports.CONFIG_FILE_NAME = undefined;

var _stringTemplates = require('string-templates');

const CONFIG_FILE_NAME = exports.CONFIG_FILE_NAME = '.ucompilerrc';

const DEFAULT_IGNORED = exports.DEFAULT_IGNORED = ['node_modules', 'bower_components', 'coverage', 't{e, }mp', '*.min.js', '*.log', 'bundle.js', 'fixture{-*,}.{js,jsx}', 'spec', 'test{s, }', 'fixture{s, }', 'vendor', 'dist', '*.___jb_old___', '*.___jb_bak___'];

const DEFAULT_CONFIG = exports.DEFAULT_CONFIG = {
  outputPath: '{name}.dist.{state.ext}',
  plugins: [],
  rules: []
};

const template = exports.template = _stringTemplates.Template.create();