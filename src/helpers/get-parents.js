'use babel'

/* @flow */

export function getParents(importsMap: Map<string, Array<string>>, filePath: string): Array<string> {
  const parents = []

  for (const [parentFile, imports] of importsMap) {
    for (const entry of imports) {
      if (entry === filePath) {
        parents.push(parentFile)
        break
      }
    }
  }

  return parents
}
