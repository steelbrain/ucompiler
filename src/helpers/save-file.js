'use babel'

import FS from 'fs'
import Path from 'path'
import {template} from '../defaults'
import {normalizePath} from './common'
import mkdirp from 'mkdirp'

const debug = require('debug')('UCompiler:Save')

export function saveFile(contents, config, {root, relativePath, absolutePath}, state) {
  const output = config.outputPath

  if (output === '-') {
    process.stdout.write(contents)
    return contents
  } else if (output === '--') {
    return contents
  } else {
    const parsed = Path.parse(absolutePath)
    const absoluteDir = normalizePath(Path.dirname(absolutePath))
    const relativeDir = normalizePath(Path.relative(root, absoluteDir))
    const templateInfo = {
      name: parsed.name,
      nameWithExt: parsed.name + parsed.ext,
      ext: parsed.ext.substr(1),
      root: root,
      relativePath: relativePath,
      relativeDir: relativeDir + '/',
      absolutePath: absolutePath,
      absoluteDir: absoluteDir + '/',
      state: state
    }

    let outputPath = template.render(output, templateInfo)
    let sourceMapPath = config.sourceMapPath ? template.render(config.sourceMapPath, templateInfo) : null

    if (config.outputPathTrim) {
      outputPath = outputPath.replace(config.outputPathTrim, '')
    }

    if (sourceMapPath)
    if (config.sourceMapPathTrim) {
      sourceMapPath = sourceMapPath.replace(config.sourceMapPathTrim, '')
    }

    if (outputPath.indexOf('/') === -1) {
      outputPath = Path.join(absoluteDir, outputPath)
    } else if (!Path.isAbsolute(outputPath)) {
      outputPath = Path.join(root, outputPath)
    }

    if (sourceMapPath)
    if (sourceMapPath.indexOf('/') === -1) {
      sourceMapPath = Path.join(absoluteDir, sourceMapPath)
    } else if (!Path.isAbsolute(sourceMapPath)) {
      sourceMapPath = Path.join(root, sourceMapPath)
    }

    debug(`Saving ${relativePath} to ${normalizePath(Path.relative(root, outputPath))}`)
    return saveFileToDisk(outputPath, contents)
    .then(function writeMap() {
      if (!sourceMapPath) {
        return
      }
      debug(`Saving source map of ${relativePath} to ${normalizePath(Path.relative(root, sourceMapPath))}`)
      return saveFileToDisk(sourceMapPath, JSON.stringify(state.sourceMap))
    })
  }
}

function saveFileToDisk(filePath, contents) {
  let firstTime = true
  return new Promise(function writeFile(resolve, reject) {
    FS.writeFile(filePath, contents, function(err) {
      if (err) {
        if (err.code === 'ENOENT' && firstTime) {
          firstTime = false
          mkdirp(Path.dirname(filePath), function(err) {
            if (err) {
              reject(err)
            } else writeFile(resolve, reject)
          })
        } else {
          reject(err)
        }
      } else resolve(contents)
    })
  })
}
