export type Node = {
  relativePath: string
  absolutePath: string
  size: number
  dependencies: string[]
}

export type DependencyGraph = {
  root: string
  pages: Map<string, Node>
  components: Map<string, Node>
}

export type Options = {
  depth?: number
}
