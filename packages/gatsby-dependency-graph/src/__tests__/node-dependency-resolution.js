const { readDependencies } = require(`../read-dependencies`)
const { join } = require(`path`)

const root = join(__dirname, `../..`)

it(`resolves node deps`, async () => {
  const tree = await readDependencies(root, `node_modules/react`)
  let deps = []

  const originalLog = console.log
  console.log = () => {}

  await Promise.all(
    tree.dependencies.map(async dep => {
      const path = dep.split(root)[1]
      deps.push(await readDependencies(root, path))
    })
  )
  console.log = originalLog

  expect(tree).toMatchInlineSnapshot(`
    Object {
      "absolutePath": "/Users/blainekasten/Sites/gatsby/packages/gatsby-dependency-graph/node_modules/react/index.js",
      "dependencies": Array [
        "/Users/blainekasten/Sites/gatsby/packages/gatsby-dependency-graph/node_modules/react/cjs/react.production.min.js",
        "/Users/blainekasten/Sites/gatsby/packages/gatsby-dependency-graph/node_modules/react/cjs/react.development.js",
      ],
      "relativePath": "node_modules/react/index.js",
      "size": 190,
    }
  `)

  expect(deps).toMatchInlineSnapshot(`
    Array [
      Object {
        "absolutePath": "/Users/blainekasten/Sites/gatsby/packages/gatsby-dependency-graph/node_modules/react/cjs/react.production.min.js",
        "dependencies": Array [
          "/Users/blainekasten/Sites/gatsby/packages/gatsby-dependency-graph/node_modules/object-assign",
        ],
        "relativePath": "/node_modules/react/cjs/react.production.min.js",
        "size": 6675,
      },
      Object {
        "absolutePath": "/Users/blainekasten/Sites/gatsby/packages/gatsby-dependency-graph/node_modules/react/cjs/react.development.js",
        "dependencies": Array [
          "/Users/blainekasten/Sites/gatsby/packages/gatsby-dependency-graph/node_modules/object-assign",
          "/Users/blainekasten/Sites/gatsby/packages/gatsby-dependency-graph/node_modules/prop-types/checkPropTypes",
        ],
        "relativePath": "/node_modules/react/cjs/react.development.js",
        "size": 60645,
      },
    ]
  `)
})
