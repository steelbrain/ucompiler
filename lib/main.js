'use strict';
'use babel';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DEFAULT_IGNORE = undefined;
exports.compile = compile;

var _fs = require('fs');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _helpers = require('./helpers');

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debugCompile = (0, _debug2.default)('UCompiler:Compile');
const DEFAULT_IGNORE = exports.DEFAULT_IGNORE = ['{**/, }node_modules/**', '{**/, }bower_components/**', '{**/, }coverage/**', '{**/, }{tmp,temp}/**', '{**/, }*.min.js', '{**/, }/bundle.js', '{**/, }fixture{-*,}.{js,jsx}', '{**/, }{test/,}fixture{s,}/**', '{**/, }vendor/**', '{**/, }dist/**'];

function compile(path) {
  let options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  let defaultRules = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  options = Object.assign({
    ignored: [],
    root: null,
    defaultRoot: null
  }, options);
  options.ignored = options.ignored.concat(DEFAULT_IGNORE);

  const root = (0, _helpers.findRoot)(path, options);
  const config = (0, _helpers.getConfig)(root);
  const files = (0, _helpers.scanFiles)(path, { root: root, ignored: options.ignored });
  const plugins = { compilers: [], general: [], minifiers: [] };

  config.plugins.forEach(function (moduleName) {
    const module = moduleName.indexOf('ucompiler-plugin-') === 0 ? require(moduleName) : require(`ucompiler-plugin-${ moduleName }`);
    if (module.compiler) {
      plugins.compilers.push(module);
    } else if (module.minifiers) {
      plugins.minifiers.push(module);
    } else {
      plugins.general.push(module);
    }
  });

  return Promise.all(files.map(function (relativePath) {
    // TODO (For the future): Reverse source maps when changed
    const file = _path2.default.join(root, relativePath);
    const state = { sourceMap: null, root: root, relativePath: relativePath };
    const rules = (0, _helpers.getRules)({ path: path, state: state, config: config, defaultRules: defaultRules });
    const contents = (0, _fs.readFileSync)(file, { encoding: 'utf8' });
    const initialContents = contents;

    return plugins.compilers.reduce(function (promise, plugin) {
      return promise.then(function (contents) {
        return plugin.process({ contents: contents, file: file, config: config, state: state, rules: rules });
      });
    }, Promise.resolve(contents)).then(function (contents) {
      return plugins.general.reduce(function (promise, plugin) {
        return promise.then(function (contents) {
          return plugin.process({ contents: contents, file: file, config: config, state: state, rules: rules });
        });
      }, Promise.resolve(contents));
    }).then(function (contents) {
      return plugins.minifiers.reduce(function (promise, plugin) {
        return promise.then(function (contents) {
          return plugin.process({ contents: contents, file: file, config: config, state: state, rules: rules });
        });
      }, Promise.resolve(contents));
    }).then(function (contents) {
      debugCompile(`Processed ${ relativePath }`);
      if (initialContents !== contents) {
        return (0, _helpers.saveFile)({ contents: contents, file: file, config: config, state: state, rules: rules, root: root });
      } else {
        return contents;
      }
    });
  }));
}