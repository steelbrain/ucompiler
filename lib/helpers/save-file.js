'use strict';
'use babel';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.saveFile = saveFile;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _defaults = require('../defaults');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function saveFile(contents, config, _ref, state) {
  let root = _ref.root;
  let relativePath = _ref.relativePath;
  let absolutePath = _ref.absolutePath;

  const output = config.outputPath;

  if (output === '-') {
    process.stdout.write(contents);
    return contents;
  } else if (output === '--') {
    return contents;
  } else {
    const parsed = _path2.default.parse(absolutePath);
    const absoluteDir = _path2.default.dirname(relativePath);
    const relativeDir = _path2.default.relative(root, absoluteDir);
    console.log(state.ext);

    let outputPath = _defaults.template.render(output, {
      name: parsed.name,
      nameWithExt: parsed.name + parsed.ext,
      ext: parsed.ext.substr(1),
      root: root,
      relativePath: relativePath,
      relativeDir: relativeDir + _path2.default.sep,
      absolutePath: absolutePath,
      absoluteDir: absoluteDir + _path2.default.sep,
      state: state
    });

    if (config.outputPathTrim) {
      outputPath = outputPath.replace(config.outputPathTrim, '');
    }

    if (outputPath.indexOf(_path2.default.sep) === -1) {
      outputPath = _path2.default.join(absoluteDir, outputPath);
    } else if (!_path2.default.isAbsolute(outputPath)) {
      outputPath = _path2.default.join(root, outputPath);
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