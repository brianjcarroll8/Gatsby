import { kebabCase } from "lodash"
import path from "path"
import { store } from "../redux"

export const generateComponentChunkName = (componentPath: string): string => {
  const program = store.getState().program
  let directory = `/`
  if (program && program.directory) {
    directory = program.directory
  }
  let name = path.relative(directory, componentPath)

  console.log({ name })

  if (name.length > 150) {
    name = name.substring(0, 150)
  }

  return `component---${kebabCase(name)}`
}
