import { join } from "path"
import { deriveGraph } from "../"

const ROOT = join(__dirname, `../../../../../gdimension`)

it(`works`, async () => {
  const graph = await deriveGraph(ROOT, { depth: 4 })

  expect(graph).toMatchSnapshot()
})
