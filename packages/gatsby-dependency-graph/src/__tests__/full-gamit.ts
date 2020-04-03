import { join } from "path"
import { deriveGraph } from ".."
import { DependencyGraph, Node } from "../types"

const ROOT = join(__dirname, `../../../../../gdimension`)

// force sort to be alphebetical
const sort = (nodeA: Node, nodeB: Node): number =>
  nodeA.absolutePath > nodeB.absolutePath ? -1 : 1

jest.setTimeout(99999999)
describe(`gatsby-dependency-graph`, () => {
  let graph: DependencyGraph
  beforeAll(async () => {
    graph = await deriveGraph(ROOT)
  })

  it(`tracks components`, () => {
    expect(Array.from(graph.components.values()).sort(sort)).toMatchSnapshot()
  })

  it(`tracks pages`, () => {
    expect(Array.from(graph.pages.values()).sort(sort)).toMatchSnapshot()
  })
})
