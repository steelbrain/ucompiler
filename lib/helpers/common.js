'use strict';
'use babel';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDir = getDir;
exports.findFile = findFile;
exports.isIgnored = isIgnored;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _isGlob = require('is-glob');

var _isGlob2 = _interopRequireDefault(_isGlob);

var _minimatch = require('minimatch');

var _minimatch2 = _interopRequireDefault(_minimatch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getDir(path) {
  let stat;

  try {
    stat = _fs2.default.statSync(path);
  } catch (_) {
    throw new Error(`Error reading ${ path }`);
  }

  if (stat.isFile()) {
    return _path2.default.dirname(path);
  } else if (stat.isDirectory()) {
    return path;
  } else {
    throw new Error(`${ path } is neither a file nor a directory`);
  }
}

function findFile(root, fileName) {
  try {
    _fs2.default.accessSync(root, _fs2.default.R_OK);
  } catch (_) {
    throw new Error(`Can not read directory ${ root }`);
  }

  const chunks = root.split(_path2.default.sep);
  while (chunks.length) {
    const filePath = _path2.default.join(chunks.join(_path2.default.sep), fileName);
    if (filePath === fileName) {
      break;
    }
    try {
      _fs2.default.accessSync(filePath, _fs2.default.R_OK);
      return filePath;
    } catch (_) {}
    chunks.pop();
  }
  return null;
}

function isIgnored(name, path, ignored) {
  return ignored.some(function (entry) {
    if ((0, _isGlob2.default)(entry)) {
      return (0, _minimatch2.default)(name, entry) || (0, _minimatch2.default)(path, entry);
    } else {
      return name === entry || path === entry;
    }
  });
}