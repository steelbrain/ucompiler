'use strict';
'use babel';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findRoot = findRoot;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _common = require('./common');

var _defaults = require('../defaults');

var _isGlob = require('is-glob');

var _isGlob2 = _interopRequireDefault(_isGlob);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ERROR_MESSAGE = 'Either of options.cwd or options.root is required';

function findRoot(path, options) {
  if (options.root !== null) {
    return options.root;
  } else if (path === null) {
    if (options.cwd === null) {
      throw new Error(ERROR_MESSAGE);
    } else return options.cwd;
  }

  const isglob = (0, _isGlob2.default)(path);
  const isabsolute = !isglob && _path2.default.isAbsolute(path);

  if (!isabsolute && options.cwd === null) {
    throw new Error(ERROR_MESSAGE);
  }

  let searchPath = (0, _common.getDir)(isglob ? options.cwd : path);
  if (!isabsolute) {
    searchPath = _path2.default.join(options.cwd, searchPath);
  }
  const configFile = (0, _common.findFile)(searchPath, _defaults.CONFIG_FILE_NAME);

  if (configFile === null) {
    return searchPath;
  } else {
    return _path2.default.dirname(configFile);
  }
}