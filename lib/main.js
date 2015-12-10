'use strict';
'use babel';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.compile = compile;
exports.watch = watch;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _chokidar = require('chokidar');

var Chokidar = _interopRequireWildcard(_chokidar);

var _sbEventKit = require('sb-event-kit');

var _findRoot = require('./helpers/find-root');

var _findFiles = require('./helpers/find-files');

var _getConfig = require('./helpers/get-config');

var _getRules = require('./helpers/get-rules');

var _getPlugins = require('./helpers/get-plugins');

var _saveFile = require('./helpers/save-file');

var _execute = require('./helpers/execute');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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
  const files = (0, _findFiles.findFiles)(path, options.ignored, { root: root, config: config, cwd: options.cwd });

  return Promise.all(files.map(function (_ref) {
    let relativePath = _ref.relativePath;
    let absolutePath = _ref.absolutePath;
    let fileName = _ref.fileName;

    // TODO: Reverse source maps when they change
    const localConfig = (0, _getRules.getRules)(relativePath, config);
    const plugins = (0, _getPlugins.getPlugins)(root, localConfig);
    const contents = _fs2.default.readFileSync(absolutePath, { encoding: 'utf8' });
    const state = { sourceMap: null, imports: [], ext: _path2.default.extname(fileName).slice(1) };
    const paths = { root: root, relativePath: relativePath, absolutePath: absolutePath, fileName: fileName };

    return (0, _execute.execute)(plugins, contents, paths, { state: state, config: localConfig }).then(function (newContents) {
      return (0, _saveFile.saveFile)(newContents, localConfig, paths, state);
    });
  }));
}

function watch(path) {
  let givenOptions = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  const options = Object.assign({
    cwd: process.cwd()
  }, givenOptions);

  const watcher = Chokidar.watch(path);

  function onChange(path) {
    compile(path, options).catch(function (e) {
      console.error(e);
    });
  }

  watcher.on('change', onChange);
  watcher.on('add', onChange);

  return new _sbEventKit.Disposable(function () {
    watcher.close();
  });
}