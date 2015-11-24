'use strict';
'use babel';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPlugins = getPlugins;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getPlugins(root, config) {
  const plugins = { compilers: [], general: [], minifiers: [] };

  config.plugins.forEach(function (moduleName) {
    moduleName = moduleName.indexOf('ucompiler-plugin-') === 0 ? moduleName : `ucompiler-plugin-${ moduleName }`;

    let module = null;

    try {
      module = require(_path2.default.join(root, 'node_modules', moduleName));
    } catch (_) {
      module = require(moduleName);
    }

    if (module.compiler) {
      plugins.compilers.push(module);
    } else if (module.minifiers) {
      plugins.minifiers.push(module);
    } else {
      plugins.general.push(module);
    }
  });

  return plugins;
}