import fs from "fs-extra"
import { join } from "path"
import { readNodeModuleEntry, isNodeModuleRoot } from "./read-node-module-entry"
import { extractDependencies } from "./extract-dependencies"
import { hasExtension } from "./utils"
import { Node } from "./types"

function lengthInUtf8Bytes(str: string): number {
  // Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
  var m = encodeURIComponent(str).match(/%[89ABab]/g)
  return str.length + (m ? m.length : 0)
}

export const readDependencies = async (
  root: string,
  relativePath: string
): Promise<Node> => {
  if (await isNodeModuleRoot(root, relativePath)) {
    relativePath = await readNodeModuleEntry(root, relativePath)
  }

  const js = (
    await fs.readFile(
      join(
        root,
        hasExtension(relativePath) ? relativePath : `${relativePath}.js`
      )
    )
  ).toString()

  const size = lengthInUtf8Bytes(js)
  const dependencies = await extractDependencies(root, relativePath, js)

  return {
    relativePath,
    size,
    dependencies,
    absolutePath: join(root, relativePath),
  }
}
