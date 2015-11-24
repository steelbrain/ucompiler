'use strict';
'use babel';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.execute = execute;
function execute(plugins, contents, paths, meta) {
  // Sequence:
  // 1. Compilers
  // 2. General
  // 3. Minifiers
  return [].concat(plugins.compilers).concat(plugins.general).concat(plugins.minifiers).reduce(function (promise, plugin) {
    return promise.then(function (contents) {
      return plugin.process(contents, paths, meta);
    });
  }, Promise.resolve(contents));
}