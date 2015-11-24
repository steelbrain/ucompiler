'use strict';
'use babel';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.compile = compile;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _findRoot = require('./helpers/find-root');

var _findFiles = require('./helpers/find-files');

var _getConfig = require('./helpers/get-config');

var _getRules = require('./helpers/get-rules');

var _getPlugins = require('./helpers/get-plugins');

var _saveFile = require('./helpers/save-file');

var _execute = require('./helpers/execute');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function compile() {
  let path = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
  let givenOptions = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  const options = Object.assign({
    ignored: [],
    root: null,
    cwd: null,
    config: {}
  }, givenOptions);

  const root = (0, _findRoot.findRoot)(path, options);
  const config = Object.assign({}, options.config, (0, _getConfig.getConfig)(root));
  const files = (0, _findFiles.findFiles)(path, options.ignored, { root: root, config: config });

  return Promise.all(files.map(function (_ref) {
    let relativePath = _ref.relativePath;
    let absolutePath = _ref.absolutePath;
    let fileName = _ref.fileName;

    // TODO: Reverse source maps when they change
    const localConfig = (0, _getRules.getRules)(relativePath, config);
    const plugins = (0, _getPlugins.getPlugins)(localConfig);
    const contents = _fs2.default.readFileSync(absolutePath, { encoding: 'utf8' });
    const state = { sourceMap: null, imports: [] };
    const paths = { root: root, relativePath: relativePath, absolutePath: absolutePath, fileName: fileName };

    return (0, _execute.execute)(plugins, contents, paths, { state: state, config: localConfig }).then(function (newContents) {
      return (0, _saveFile.saveFile)(newContents, localConfig, paths);
    });
  }));
}