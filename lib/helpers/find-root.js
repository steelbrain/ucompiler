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
    return (0, _common.normalizePath)(options.root);
  } else if (path === null) {
    if (options.cwd === null) {
      throw new Error(ERROR_MESSAGE);
    } else return (0, _common.normalizePath)(options.cwd);
  }

  const pathIsGlob = (0, _isGlob2.default)(path);
  const pathIsAbsolute = !pathIsGlob && _path2.default.isAbsolute(path);

  if (!pathIsAbsolute && options.cwd === null) {
    throw new Error(ERROR_MESSAGE);
  }

  const searchPath = (0, _common.getDir)(pathIsGlob ? options.cwd : pathIsAbsolute ? path : _path2.default.join(options.cwd, path));
  const configFile = (0, _common.findFile)(searchPath, _defaults.CONFIG_FILE_NAME);

  if (configFile === null) {
    return (0, _common.normalizePath)(searchPath);
  } else {
    return (0, _common.normalizePath)(_path2.default.dirname(configFile));
  }
}