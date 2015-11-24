UCompiler
=========

UCompiler is the next generation assets manager. It's built to be extended and provides an easy-to-use plugin API.

#### Installation

Installing UCompiler is easy, just execute this in a terminal
```
npm install -g ucompiler
```

#### Configuration

UCompiler is very flexible and can be customized in several ways. The configuration file for ucompiler should be valid JSON written as `.ucompilerrc` in your project-root.

UCompiler's configuration is directly passed to the plugins, so it can contain info intended for the plugins as well.
The fields that UCompiler recognizes are `plugins` and `rules`.
Here's an example configuration file

```json
{
  "plugins": ["babel", "less"],
  "rules": [
    {
      "path": "src/*",
      "output": "lib/{name}.js"
    },
    {
      "path": "assets/less/*",
      "output": "assets/css/{name}.css"
    }
  ]
}
```

#### Usage

The UCompiler CLI comes with two commands, `watch` and `go`.
`go` If a file or folder or glob is provided, UCompiler will compile that, otherwise, it'll go through all the rules and compile them.
`watch` Watches the file or folder provided and compiles them on change

ToDo: Write rest of it

#### Plugin API

The plugin package names must be in `ucompiler-plugin-{name}` format. While using them in `.ucompilerrc`, you can only use the name.
UCompiler expects the plugin to export an object like the one shown below. It's process method will be invoked for the files using that plugin.

```
module.exports = {
  compiler: false,
  minifier: false,
  process: function(contents, {root, relativePath, absolutePath, fileName}, {state, config}): String | Promise<String>
}
```

#### License

This project is licensed under the terms of MIT License. See the LICENSE file for more info.
