'use babel'

import FS from 'fs'
import Path from 'path'
import Minimatch from 'minimatch'
import Glob from 'glob'
import {DEFAULT_CONFIG, template} from './defaults'

/** Finding Helpers */

export function findFile(root, fileName) {
  try {
    FS.accessSync(root, FS.R_OK)
  } catch (_) {
    throw new Error(`Can not read directory ${root}`)
  }
  const chunks = root.split(Path.sep)
  while (chunks.length) {
    const filePath = Path.join(chunks.join(Path.sep), fileName)
    if (filePath === fileName) {
      break
    }
    try {
      FS.accessSync(filePath, FS.R_OK)
      return filePath
    } catch (_) {}
    chunks.pop()
  }
  return null
}

export function findRoot(path, options) {
  if (options.root !== null) {
    return options.root
  } else if (path.indexOf('*') !== -1) {
    if (options.defaultRoot) {
      return options.defaultRoot
    }
    throw new Error('Options.root must be specified with glob')
  }
  let stat
  try {
    stat = FS.statSync(path)
  } catch (_) {
    throw new Error(`Error reading ${path}`)
  }

  let baseDir

  switch(true) {
    case stat.isFile():
      baseDir = Path.dirname(path)
      break;
    case stat.isDirectory():
      baseDir = path;
      break;
    default:
      throw new Error(`${path} is neither a file nor a directory`)
  }

  const configFile = findFile(baseDir, '.ucompilerrc')
  if (configFile === null) {
    if (options.defaultRoot) {
      return options.defaultRoot
    } else return baseDir
  } else {
    return Path.dirname(configFile)
  }
}

export function scanFiles(path, {root, ignored}) {
  if (path.indexOf('*') === -1) {
    // Non-Glob
    const absPath = Path.isAbsolute(path) ? path : Path.join(root, path)
    const stat = FS.statSync(absPath)
    if (stat.isFile()) {
      return [Path.relative(root, absPath)]
    } else if (stat.isDirectory()) {
      let files = []
      FS.readdirSync(absPath).forEach(function(file) {
        if (file.substr(0, 1) === '.') {
          return // Ignore dot files
        }

        const absFilePath = Path.join(absPath, file)
        const relativeFilePath = Path.relative(root, absFilePath)
        if (ignored.some(function(ignored) {
            return Minimatch(relativeFilePath, ignored)
          })) {
          return
        }
        let stat
        try {
          stat = FS.lstatSync(absFilePath)
        } catch (_) {
          throw new Error(`Error reading ${absFilePath}`)
        }
        if (!stat.isSymbolicLink()) {
          if (stat.isFile()) {
            files.push(relativeFilePath)
          } else if (stat.isDirectory()) {
            files = files.concat(scanFiles(absFilePath, {root, ignored}))
          }
        }
      })
      return files
    } else return []
  } else {
    // Glob
    return Glob.sync(path, {cwd: root, ignore: ignored, nodir: true})
  }
}

/** Config Helper */

export function getConfig(root) {
  const configFile = findFile(root, '.ucompilerrc')
  if (configFile !== null) {
    let config
    try {
      config = JSON.parse(FS.readFileSync(configFile, {encoding: 'utf8'}))
    } catch (e) {
      throw new Error(`Malformed configuration file located at ${configFile}`)
    }
    return Object.assign({}, DEFAULT_CONFIG, config)
  } else return DEFAULT_CONFIG
}

export function validateRule({rulePath, path, relativePath}) {
  if (rulePath.indexOf('*') === -1) {
    return rulePath === path || rulePath === relativePath ||
      path.indexOf(rulePath) === 0 || relativePath.indexOf(rulePath) === 0
  } else {
    return Minimatch(path, rulePath) || Minimatch(relativePath, rulePath)
  }
}

export function getRules({path, config, state, defaultRules}) {
  const rules = Object.assign({output: '{name}.dist.{ext}'})
  config.rules.forEach(function(rule) {
    if (validateRule({rulePath: rule.path, path, relativePath: state.relativePath})) {
      for (let key in rule) {
        if (key !== 'path') {
          rules[key] = rule[key]
        }
      }
    }
  })

  return rules
}

/** Saving Helper */

export function saveFile({contents, file, config, state, rules, root}) {
  if (rules.output === '-') {
    process.stdout.write(contents)
  } else if (rules.output === '--') {
    return contents
  } else {
    const parsed = Path.parse(file)
    const out = template.render(rules.output, {
      name: parsed.name,
      nameWithExt: parsed.name + parsed.ext,
      ext: parsed.ext.substr(1),
      root: root,
      relativePath: state.relativePath,
      absolutePath: file,
      dirName: parsed.dir
    })

    let outputPath
    if (out.indexOf(Path.sep) === -1) {
      // Relative to dirName
      outputPath = Path.join(parsed.dir, out)
    } else if (Path.isAbsolute(out)) {
      outputPath = out
    } else {
      // Relative to project root
      outputPath = Path.join(root, out)
    }
    return new Promise(function(resolve, reject) {
      FS.writeFile(outputPath, contents, function(err) {
        if (err) {
          reject(err)
        } else resolve(contents)
      })
    })
  }
}
