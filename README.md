UCompiler
=========

UCompiler is the next generation assets manager. It's built to be extended and provides an easy-to-use plugin API.

#### Installation

Installing UCompiler is easy, just execute this in a terminal

```
npm install -g ucompiler
```

#### Configuration

UCompiler is extremely customizable and hackable to the core. It can be configured with it's JSON configuration
file written as `.ucompiler`.

Here's an example ucompiler configuration for a project using less and babel plugins

```json
{
  "defaultRule": "compile-babel",
  "rules": [{
    "name": "compile-babel",
    "plugins": ["babel"],
    "babel": {
      "presets": ["steelbrain"]
    },
    "include": [{
      "directory": "src",
      "extensions": ["js"]
    }],
    "outputPath": "scripts/{relativePath:4}"
  }, {
    "name": "compile-less",
    "plugins": ["less"],
    "include": [{
      "directory": "src",
      "extensions": ["less"]
    }],
    "exclude": ["vendor/**/*.less"],
    "outputPath": "styles/{relativePath:7}",
    "sourceMapPath": "styles/{relativePath:7}"
  }]
}
```

#### Usage

UCompiler has two valid CLI commands

 - `ucompiler go [rule]`
 - `ucompiler watch [rule]`

#### Plugin API

The names of plugin package should start with `ucompiler-plugin-`. However you can drop that part in your
configuration file. The plugin interface is written below. If you don't want to perform any customizations
on the string, simply return null from your package.

```js
type UCompilerJob = shape {
  rootDirectory: string,
  filePath: string,
  state: Object,
  config: Object
}

type UCompilerResult = shape {
  contents: string,
  sourceMap?: ?{
    sources: Array<string>,
    sourcesContent: Array<string>,
    mappings: string,
    names: Array<string>
  }
}

module.exports = {
  compiler: boolean,
  minifier: boolean,
  process: function(contents: string, parameters: UCompilerJob): UCompilerResult | Promise<UCompilerResult>
}
```

#### License

This project is licensed under the terms of MIT License. See the LICENSE file for more info.
