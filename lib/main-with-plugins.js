const UCompiler = require('./main.js')
const ucompiler = new UCompiler
ucompiler.addPlugin(require('../plugins/generic.js'), 1, ['*'])
ucompiler.addPlugin(require('../plugins/coffee.js'), 2, ['.coffee'])
ucompiler.addPlugin(require('../plugins/less.js'), 2, ['.less'])
ucompiler.addPlugin(require('../plugins/babelify.js'), 3, ['.js', '.coffee'])
ucompiler.addPlugin(require('../plugins/postcss.js'), 4, ['.css', '.less', '.scss'])
ucompiler.addPlugin(require('../plugins/uglify.js'), 4, ['.js', '.coffee'])

module.exports = ucompiler
