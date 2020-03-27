import fs from "fs-extra"

// TODO: Implement dynamically generated pages
export const readGatsbyPages = (gatsbyRoot: string): Promise<string[]> => {
  return fs.readdir(gatsbyRoot)
}
