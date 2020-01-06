const { /* graphql,*/ parse } = require(`graphql`)
const { compileQuery, isCompiledQuery } = require(`graphql-jit`)

const withResolverContext = require(`../schema/context`)
const { LocalNodeModel } = require(`../schema/node-model`)

const queryCache = new Map()

class GraphQLRunner {
  constructor(store) {
    this.store = store
    const nodeStore = require(`../db/nodes`)
    const createPageDependency = require(`../redux/actions/add-page-dependency`)
    const { schema, schemaCustomization } = this.store.getState()

    this.nodeModel = new LocalNodeModel({
      nodeStore,
      schema,
      schemaComposer: schemaCustomization.composer,
      createPageDependency,
    })
  }

  query(query, context) {
    let compiledQuery = queryCache.get(query)
    const { schema, schemaCustomization } = this.store.getState()
    if (!compiledQuery) {
      const document = parse(query)

      queryCache.set(query, (compiledQuery = compileQuery(schema, document)))
    }

    // const compiledQuery = compileQuery(schema, document)

    if (!isCompiledQuery(compiledQuery)) {
      console.error(compiledQuery)
      throw new Error(`Error compiling query`)
    }

    return compiledQuery.query(
      context,
      withResolverContext({
        schema,
        schemaComposer: schemaCustomization.composer,
        context,
        customContext: schemaCustomization.context,
        nodeModel: this.nodeModel,
      }),
      context
    )

    // return graphql(
    //   schema,
    //   query,
    //   context,
    //   withResolverContext({
    //     schema,
    //     schemaComposer: schemaCustomization.composer,
    //     context,
    //     customContext: schemaCustomization.context,
    //     nodeModel: this.nodeModel,
    //   }),
    //   context
    // )
  }
}

module.exports = GraphQLRunner
