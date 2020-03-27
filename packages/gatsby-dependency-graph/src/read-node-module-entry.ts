import { join } from "path"
import { readFile } from "fs-extra"

export const isNodeModuleRoot = async (
  root: string,
  path: string
): Promise<boolean> => {
  try {
    await readFile(join(root, path, "package.json"))
    return true
  } catch (e) {
    return false
  }
}

export const readNodeModuleEntry = async (
  root: string,
  path: string
): Promise<string> => {
  const packageJSON = JSON.parse(
    (await readFile(join(root, path, "package.json"))).toString()
  )

  return join(path, packageJSON.main || packageJSON.module || "./index.js")
}
