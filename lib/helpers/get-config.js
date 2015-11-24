'use strict';
'use babel';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getConfig = getConfig;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _defaults = require('../defaults');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getConfig(root) {
  const configPath = _path2.default.join(root, _defaults.CONFIG_FILE_NAME);

  let config = Object.assign({}, _defaults.DEFAULT_CONFIG);
  try {
    _fs2.default.accessSync(configPath, _fs2.default.R_OK);
    const contents = _fs2.default.readFileSync(configPath);
    try {
      Object.assign(config, JSON.parse(contents));
    } catch (_) {
      throw new Error(`Malformed configuration file located at ${ configPath }`);
    }
  } catch (_) {}

  return config;
}