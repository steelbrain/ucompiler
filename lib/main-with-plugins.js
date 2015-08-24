const UCompiler = require('./main.js')
const ucompiler = new UCompiler
ucompiler.addPlugin(require('../plugins/generic.js'), 1, ['*'])
ucompiler.addPlugin(require('../plugins/coffee.js'), 2, ['.coffee'])
ucompiler.addPlugin(require('../plugins/less.js'), 2, ['.less'])
ucompiler.addPlugin(require('../plugins/browserify.js'), 3, ['.js', '.coffee'])
ucompiler.addPlugin(require('../plugins/babel.js'), 4, ['.js'])
ucompiler.addPlugin(require('../plugins/less-compress.js'), 5, ['.css'])
ucompiler.addPlugin(require('../plugins/uglify.js'), 5, ['.js', '.coffee'])

module.exports = ucompiler
