const { store } = require(`../../redux`)
const { build, rebuildWithSitePage } = require(`..`)
require(`../../db/__tests__/fixtures/ensure-loki`)()

jest.mock(`gatsby-cli/lib/reporter`, () => {
  return {
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    activityTimer: () => {
      return {
        start: jest.fn(),
        setStatus: jest.fn(),
        end: jest.fn(),
      }
    },
    phantomActivity: () => {
      return {
        start: jest.fn(),
        end: jest.fn(),
      }
    },
  }
})

const firstPage = () => {
  return {
    id: `page1`,
    parent: null,
    children: [],
    internal: { type: `SitePage`, contentDigest: `0`, counter: 0 },
    keep: `Page`,
    fields: {
      oldKey: `value`,
    },
  }
}

const secondPage = () => {
  return {
    id: `page2`,
    parent: null,
    children: [],
    internal: { type: `SitePage`, contentDigest: `0`, counter: 1 },
    fields: {
      key: `value`,
    },
    context: {
      key: `value`,
    },
  }
}

const nodes = () => [firstPage()]

describe(`build and update schema for SitePage`, () => {
  let schema

  beforeAll(async () => {
    store.dispatch({ type: `DELETE_CACHE` })
    nodes().forEach(node =>
      store.dispatch({ type: `CREATE_NODE`, payload: node })
    )

    await build({})
    schema = store.getState().schema
  })

  it(`updates SitePage on rebuild`, async () => {
    let fields
    let inputFields

    const initialFields = [
      `id`,
      `parent`,
      `children`,
      `internal`,
      `keep`,
      `fields`,
    ]

    fields = Object.keys(schema.getType(`SitePage`).getFields())
    expect(fields.length).toBe(6)
    expect(fields).toEqual(initialFields)

    inputFields = Object.keys(schema.getType(`SitePageFilterInput`).getFields())
    expect(fields.length).toBe(6)
    expect(inputFields).toEqual(initialFields)

    // Rebuild Schema
    store.dispatch({ type: `CREATE_NODE`, payload: secondPage() })
    await rebuildWithSitePage({})
    schema = store.getState().schema

    fields = Object.keys(schema.getType(`SitePage`).getFields())
    expect(fields.length).toBe(7)
    expect(fields).toEqual(initialFields.concat(`context`))

    inputFields = Object.keys(schema.getType(`SitePageFilterInput`).getFields())
    expect(fields.length).toBe(7)
    expect(inputFields).toEqual(initialFields.concat(`context`))

    const fieldsEnum = schema
      .getType(`SitePageFieldsEnum`)
      .getValue(`context___key`)
    expect(fieldsEnum).toBeDefined()

    const sortFieldsEnum = schema.getType(`SitePageSortInput`).getFields()
      .fields.type.ofType
    expect(sortFieldsEnum.getValue(`context___key`)).toBeDefined()
  })

  it(`updates nested types on rebuild`, async () => {
    let fields
    let inputFields

    fields = Object.keys(schema.getType(`SitePageFields`).getFields())
    expect(fields.length).toBe(1)
    expect(fields).toEqual([`oldKey`])
    inputFields = Object.keys(
      schema.getType(`SitePageSitePageFieldsFilterInput`).getFields()
    )
    expect(inputFields.length).toBe(1)
    expect(inputFields).toEqual([`oldKey`])

    // Rebuild Schema
    store.dispatch({ type: `CREATE_NODE`, payload: secondPage() })
    await rebuildWithSitePage({})
    schema = store.getState().schema

    fields = Object.keys(schema.getType(`SitePageFields`).getFields())
    expect(fields.length).toBe(2)
    expect(fields).toEqual([`oldKey`, `key`])

    inputFields = Object.keys(
      schema.getType(`SitePageSitePageFieldsFilterInput`).getFields()
    )
    expect(inputFields.length).toBe(2)
    expect(inputFields).toEqual([`oldKey`, `key`])

    const fieldsEnum = schema
      .getType(`SitePageFieldsEnum`)
      .getValues()
      .map(value => value.name)
    expect(fieldsEnum.includes(`fields___oldKey`)).toBeTruthy()
    expect(fieldsEnum.includes(`fields___key`)).toBeTruthy()
  })
})

// describe(`build and update schema for other types`, () => {
//   const createNodes = () => [
//     {
//       id: `Foo`,
//       internal: { type: `Foo`, contentDigest: `0` },
//       numberKey: 1,
//       stringKey: `5`,
//       dateKey: `2018-05-05`,
//     },
//   ]
//
//   let schema
//
//   beforeAll(async () => {
//     store.dispatch({ type: `DELETE_CACHE` })
//     createNodes().forEach(node =>
//       actions.createNode(node, { name: `test` })(store.dispatch)
//     )
//
//     await build({})
//     schema = store.getState().schema
//   })
//
//   it(`should change type when new fields added`, async () => {})
//
//   it(`should not change type when nothing changes`, async () => {})
//
//   it(`should report error when conflicting changes`, async () => {})
// })
