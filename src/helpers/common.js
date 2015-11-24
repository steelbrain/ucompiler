'use babel'

import Path from 'path'
import FS from 'fs'

export function getDir(path) {
  let stat

  try {
    stat = FS.statSync(path)
  } catch (_) {
    throw new Error(`Error reading ${path}`)
  }

  switch(true) {
    case stat.isFile():
      return Path.dirname(path)
      break
    case stat.isDirectory():
      return path
      break
    default:
      throw new Error(`${path} is neither a file nor a directory`)
  }
}

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