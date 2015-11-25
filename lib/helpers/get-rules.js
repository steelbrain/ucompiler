'use strict';
'use babel';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getRules = getRules;

var _isGlob = require('is-glob');

var _isGlob2 = _interopRequireDefault(_isGlob);

var _minimatch = require('minimatch');

var _minimatch2 = _interopRequireDefault(_minimatch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getRules(relativePath, config) {
  const localConfig = {};

  for (const key in config) {
    const value = config[key];

    if (value && value instanceof Array) {
      localConfig[key] = value.slice();
    } else if (typeof value === 'object') {
      localConfig[key] = Object.assign({}, value);
    } else {
      localConfig[key] = value;
    }
  }

  config.rules.forEach(function (rule) {
    const matches = (0, _isGlob2.default)(rule.path) ? (0, _minimatch2.default)(relativePath, rule.path) : relativePath === rule.path;
    if (matches) {
      for (const key in rule) {
        if (typeof localConfig[key] !== 'undefined' && localConfig[key] instanceof Array) {
          localConfig[key] = localConfig[key].concat(rule[key]);
        } else {
          localConfig[key] = rule[key];
        }
      }
    }
  });

  delete localConfig.rules;
  delete localConfig.path;

  return localConfig;
}