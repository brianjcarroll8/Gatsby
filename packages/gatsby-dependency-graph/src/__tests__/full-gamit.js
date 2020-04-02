import { join } from "path"
import { deriveGraph } from "../"

const ROOT = join(__dirname, `../../../../../gdimension`)

jest.setTimeout(99999999)
describe(`gatsby-dependency-graph`, () => {
  let graph
  beforeAll(async () => {
    graph = await deriveGraph(ROOT)
  })

  it(`tracks components`, () => {
    expect(Array.from(graph.components.values()).sort()).toMatchSnapshot()
  })

  it(`tracks pages`, () => {
    expect(Array.from(graph.pages.values()).sort()).toMatchSnapshot()
  })
})
