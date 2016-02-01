'use babel'

/* @flow */

export function getParents(files: Map<string, Array<string>>): Map<string, Array<string>> {
  const parents = new Map()

  for (const [filePath, imports] of files) {
    for (const entry of imports) {
      let entryParents = parents.get(entry)
      if (!entryParents) {
        parents.set(entry, entryParents = [])
      }
      entryParents.push(filePath)
    }
  }

  return parents
}
