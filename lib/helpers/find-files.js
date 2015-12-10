'use strict';
'use babel';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findFiles = findFiles;
exports.findFilesBase = findFilesBase;
exports.findFilesRegular = findFilesRegular;
exports.findFilesGlob = findFilesGlob;
exports.findFilesConfig = findFilesConfig;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _minimatch = require('minimatch');

var _minimatch2 = _interopRequireDefault(_minimatch);

var _isGlob = require('is-glob');

var _isGlob2 = _interopRequireDefault(_isGlob);

var _defaults = require('../defaults');

var _common = require('./common');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function findFiles(pathGiven, ignoredGiven, options) {
  const ignored = _defaults.DEFAULT_IGNORED.concat(ignoredGiven);

  if (pathGiven === null) {
    return findFilesConfig(ignored, options);
  } else if ((0, _isGlob2.default)(pathGiven)) {
    return findFilesGlob(pathGiven, ignored, options);
  } else {
    const path = _path2.default.isAbsolute(pathGiven) ? pathGiven : _path2.default.join(options.cwd, pathGiven);
    const stat = _fs2.default.statSync(path);

    if (stat.isFile()) {

      const fileName = _path2.default.basename(path);
      if ((0, _common.isIgnored)(fileName, path, ignored)) {
        return [];
      }

      return [{
        relativePath: _path2.default.relative(options.cwd, path),
        absolutePath: path,
        fileName: fileName
      }];
    } else if (stat.isDirectory()) {
      return findFilesRegular(path, ignored, options);
    } else {
      throw new Error(`${ path } is neither a file nor a directory`);
    }
  }
}

function findFilesBase(path, ignored, _ref, validateCallback) {
  let root = _ref.root;
  let config = _ref.config;

  let files = [];

  _fs2.default.readdirSync(path).forEach(function (entryName) {
    const absolutePath = _path2.default.join(path, entryName);
    const relativePath = _path2.default.relative(root, absolutePath);
    const stat = _fs2.default.lstatSync(absolutePath);

    if (entryName.substr(0, 1) === '.' || stat.isSymbolicLink() || (0, _common.isIgnored)(entryName, relativePath, ignored)) {
      return;
    }

    if (validateCallback === null || validateCallback(relativePath, entryName, stat)) {
      if (stat.isDirectory()) {
        files = files.concat(findFilesBase(absolutePath, ignored, { root: root, config: config }, validateCallback));
      } else if (stat.isFile()) {
        files.push({ relativePath: relativePath, absolutePath: absolutePath, fileName: entryName });
      }
    }
  });

  return files;
}

function findFilesRegular(path, ignored, _ref2) {
  let root = _ref2.root;
  let config = _ref2.config;

  return findFilesBase(path, ignored, { root: root, config: config }, null);
}

function findFilesGlob(path, ignored, _ref3) {
  let root = _ref3.root;
  let config = _ref3.config;

  return findFilesBase(root, ignored, { root: root, config: config }, function (relative, _, stat) {
    return stat.isDirectory() || (0, _minimatch2.default)(relative, path);
  });
}

function findFilesConfig(ignored, _ref4) {
  let root = _ref4.root;
  let config = _ref4.config;

  const paths = [];
  config.rules.forEach(function (rule) {
    paths.push(rule.path);
  });
  return findFilesBase(root, ignored, { root: root, config: config }, function (relativePath, fileName, stat) {
    return stat.isDirectory() || (0, _common.isIgnored)(fileName, relativePath, paths);
  });
}