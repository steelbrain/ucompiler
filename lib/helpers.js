'use strict';
'use babel';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findFile = findFile;
exports.findRoot = findRoot;
exports.scanFiles = scanFiles;
exports.getConfig = getConfig;
exports.validateRule = validateRule;
exports.getRules = getRules;
exports.saveFile = saveFile;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _minimatch = require('minimatch');

var _minimatch2 = _interopRequireDefault(_minimatch);

var _stringTemplates = require('string-templates');

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DEFAULT_CONFIG = {
  plugins: [],
  rules: []
};
const template = _stringTemplates.Template.create();

/** Finding Helpers */

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

function findRoot(path, options) {
  if (options.root !== null) {
    return options.root;
  } else if (path.indexOf('*') !== -1) {
    if (options.defaultRoot) {
      return options.defaultRoot;
    }
    throw new Error('Options.root must be specified with glob');
  }
  let stat;
  try {
    stat = _fs2.default.statSync(path);
  } catch (_) {
    throw new Error(`Error reading ${ path }`);
  }

  let baseDir;

  switch (true) {
    case stat.isFile():
      baseDir = _path2.default.dirname(path);
      break;
    case stat.isDirectory():
      baseDir = path;
      break;
    default:
      throw new Error(`${ path } is neither a file nor a directory`);
  }

  const configFile = findFile(baseDir, '.ucompilerrc');
  if (configFile === null) {
    if (options.defaultRoot) {
      return options.defaultRoot;
    } else return baseDir;
  } else {
    return _path2.default.dirname(configFile);
  }
}

function scanFiles(path, _ref) {
  let root = _ref.root;
  let ignored = _ref.ignored;

  if (path.indexOf('*') === -1) {
    // Non-Glob
    const absPath = _path2.default.isAbsolute(path) ? path : _path2.default.join(root, path);
    const stat = _fs2.default.statSync(absPath);
    if (stat.isFile()) {
      return [_path2.default.relative(root, absPath)];
    } else if (stat.isDirectory()) {
      let files = [];
      _fs2.default.readdirSync(absPath).forEach(function (file) {
        if (file.substr(0, 1) === '.') {
          return; // Ignore dot files
        }

        const absFilePath = _path2.default.join(absPath, file);
        const relativeFilePath = _path2.default.relative(root, absFilePath);
        if (ignored.some(function (ignored) {
          return (0, _minimatch2.default)(relativeFilePath, ignored);
        })) {
          return;
        }
        let stat;
        try {
          stat = _fs2.default.lstatSync(absFilePath);
        } catch (_) {
          throw new Error(`Error reading ${ absFilePath }`);
        }
        if (!stat.isSymbolicLink()) {
          if (stat.isFile()) {
            files.push(relativeFilePath);
          } else if (stat.isDirectory()) {
            files = files.concat(scanFiles(absFilePath, { root: root, ignored: ignored }));
          }
        }
      });
      return files;
    } else return [];
  } else {
    // Glob
    return _glob2.default.sync(path, { cwd: root, ignore: ignored, nodir: true });
  }
}

/** Config Helper */

function getConfig(root) {
  const configFile = findFile(root, '.ucompilerrc');
  if (configFile !== null) {
    let config;
    try {
      config = JSON.parse(_fs2.default.readFileSync(configFile, { encoding: 'utf8' }));
    } catch (e) {
      throw new Error(`Malformed configuration file located at ${ configFile }`);
    }
    return Object.assign({}, DEFAULT_CONFIG, config);
  } else return DEFAULT_CONFIG;
}

function validateRule(_ref2) {
  let rulePath = _ref2.rulePath;
  let path = _ref2.path;
  let relativePath = _ref2.relativePath;

  if (rulePath.indexOf('*') === -1) {
    return rulePath === path || rulePath === relativePath || path.indexOf(rulePath) === 0 || relativePath.indexOf(rulePath) === 0;
  } else {
    return (0, _minimatch2.default)(path, rulePath) || (0, _minimatch2.default)(relativePath, rulePath);
  }
}

function getRules(_ref3) {
  let path = _ref3.path;
  let config = _ref3.config;
  let state = _ref3.state;
  let defaultRules = _ref3.defaultRules;

  const rules = Object.assign({ output: '{name}.dist.{ext}' });
  config.rules.forEach(function (rule) {
    if (validateRule({ rulePath: rule.path, path: path, relativePath: state.relativePath })) {
      for (let key in rule) {
        if (key !== 'path') {
          rules[key] = rule[key];
        }
      }
    }
  });

  return rules;
}

/** Saving Helper */

function saveFile(_ref4) {
  let contents = _ref4.contents;
  let file = _ref4.file;
  let config = _ref4.config;
  let state = _ref4.state;
  let rules = _ref4.rules;
  let root = _ref4.root;

  if (rules.output === '-') {
    process.stdout.write(contents);
  } else if (rules.output === '--') {
    return contents;
  } else {
    const parsed = _path2.default.parse(file);
    const out = template.render(rules.output, {
      name: parsed.name,
      nameWithExt: parsed.name + parsed.ext,
      ext: parsed.ext.substr(1),
      root: root,
      relativePath: state.relativePath,
      absolutePath: file,
      dirName: parsed.dir
    });

    let outputPath;
    if (out.indexOf(_path2.default.sep) === -1) {
      // Relative to dirName
      outputPath = _path2.default.join(parsed.dir, out);
    } else if (_path2.default.isAbsolute(out)) {
      outputPath = out;
    } else {
      // Relative to project root
      outputPath = _path2.default.join(root, out);
    }
    return new Promise(function (resolve, reject) {
      _fs2.default.writeFile(outputPath, contents, function (err) {
        if (err) {
          reject(err);
        } else resolve(contents);
      });
    });
  }
}