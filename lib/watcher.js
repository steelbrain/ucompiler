'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var JSToolkit = require('js-toolkit');
var FS = JSToolkit.promisifyAll(require('fs'));
var CPPromise = require('childprocess-promise');
var EventEmitter = require('events').EventEmitter;
var Chokidar = require('chokidar');

var Watcher = (function (_EventEmitter) {
  _inherits(Watcher, _EventEmitter);

  function Watcher(rootPath) {
    var _this = this;

    _classCallCheck(this, Watcher);

    _get(Object.getPrototypeOf(Watcher.prototype), 'constructor', this).call(this);
    this.fswatcher = Chokidar.watch(rootPath, {
      ignored: [/[\/\\]\./, /node_modules/, /bower_components/],
      followSymlinks: true,
      persistent: true
    });
    this.process = new CPPromise('./watcher-thread');
    this.imports = new Map();
    this.fswatcher.on('change', function (path) {
      _this.compile(path).then(function (result) {
        if (result.options.Output) {
          return FS.writeFile(result.options.Output, result.content).then(function () {
            return result;
          });
        } else return result;
      }).then(function (result) {
        _this.imports.set(path, result.options.internal.imports);
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = _this.imports[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var entry = _step.value;

            if (entry[1].indexOf(path) === -1) continue;
            _this.compile(entry[0]);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator['return']) {
              _iterator['return']();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      });
    });
    this.fswatcher.on('addDir', function (path) {
      return _this.fswatcher.add(path);
    });
    this.fswatcher.on('error', function (e) {
      return _this.emit('error', e.stack);
    });
  }

  _createClass(Watcher, [{
    key: 'scan',
    value: function scan(dirPath, Ignore) {
      Ignore = Ignore || '^\\.|node_modules|bower_components';
      return this.process.request('SCAN', { Path: dirPath, Ignore: Ignore });
    }
  }, {
    key: 'compile',
    value: function compile(filePath, options) {
      var _this2 = this;

      options = options || {};
      return this.process.request('COMPILE', { Path: filePath, Options: options })['catch'](function (e) {
        return _this2.emit('error', e.stack);
      });
    }
  }, {
    key: 'disconnect',
    value: function disconnect() {
      this.process.disconnect();
    }
  }, {
    key: 'kill',
    value: function kill() {
      this.process.kill();
    }
  }, {
    key: 'onError',
    value: function onError(callback) {
      this.on('error', callback);
    }
  }]);

  return Watcher;
})(EventEmitter);

module.exports = Watcher;