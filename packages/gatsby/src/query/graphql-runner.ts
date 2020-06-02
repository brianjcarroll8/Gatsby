import crypto from "crypto"
import v8 from "v8"
import { Span } from "opentracing"
import {
  parse,
  validate,
  execute,
  DocumentNode,
  GraphQLSchema,
  Source,
  GraphQLError,
  ExecutionResult,
} from "graphql"
import { debounce, isEmpty } from "lodash"
import * as nodeStore from "../db/nodes"
import { createPageDependency } from "../redux/actions/add-page-dependency"
import { addModuleDependencyToQueryResult } from "../redux/actions/internal"
import {
  registerModule,
  generateModuleId,
} from "../redux/actions/modules/register-module"
import withResolverContext from "../schema/context"
import { LocalNodeModel } from "../schema/node-model"
import { GatsbyReduxStore } from "../redux"
import { IGraphQLRunnerStatResults, IGraphQLRunnerStats } from "./types"
import GraphQLSpanTracer from "./graphql-span-tracer"
import {
  GatsbyGraphQLResolveInfo,
  GatsbyExecutionResult,
} from "../schema/type-definitions"
import { ExecutionResultDataDefault } from "graphql/execution/execute"
import { Path } from "graphql/jsutils/Path"

type Query = string | Source

export class GraphQLRunner {
  parseCache: Map<Query, DocumentNode>

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nodeModel: any // TODO: convert "../schema/node-model" from Flow

  schema: GraphQLSchema

  validDocuments: WeakSet<DocumentNode>
  scheduleClearCache: () => void

  stats: IGraphQLRunnerStats | null
  graphqlTracing: boolean

  constructor(
    protected store: GatsbyReduxStore,
    {
      collectStats,
      graphqlTracing,
    }: {
      collectStats?: boolean
      graphqlTracing?: boolean
    } = {}
  ) {
    const { schema, schemaCustomization } = this.store.getState()

    this.nodeModel = new LocalNodeModel({
      nodeStore,
      schema,
      schemaComposer: schemaCustomization.composer,
      createPageDependency,
    })
    this.schema = schema
    this.parseCache = new Map()
    this.validDocuments = new WeakSet()
    this.scheduleClearCache = debounce(this.clearCache.bind(this), 5000)

    this.graphqlTracing = graphqlTracing || false

    if (collectStats) {
      this.stats = {
        totalQueries: 0,
        uniqueOperations: new Set(),
        uniqueQueries: new Set(),
        totalRunQuery: 0,
        totalPluralRunQuery: 0,
        totalIndexHits: 0,
        totalSiftHits: 0,
        totalNonSingleFilters: 0,
        comparatorsUsed: new Map(),
        uniqueFilterPaths: new Set(),
        uniqueSorts: new Set(),
      }
    } else {
      this.stats = null
    }
  }

  clearCache(): void {
    this.parseCache.clear()
    this.validDocuments = new WeakSet()
  }

  parse(query: Query): DocumentNode {
    if (!this.parseCache.has(query)) {
      this.parseCache.set(query, parse(query))
    }
    return this.parseCache.get(query) as DocumentNode
  }

  validate(
    schema: GraphQLSchema,
    document: DocumentNode
  ): readonly GraphQLError[] {
    if (!this.validDocuments.has(document)) {
      const errors = validate(schema, document)
      if (!errors.length) {
        this.validDocuments.add(document)
      }
      return errors as Array<GraphQLError>
    }
    return []
  }

  getStats(): IGraphQLRunnerStatResults | null {
    if (this.stats) {
      const comparatorsUsedObj: Array<{
        comparator: string
        amount: number
      }> = []
      this.stats.comparatorsUsed.forEach((value, key) => {
        comparatorsUsedObj.push({ comparator: key, amount: value })
      })
      return {
        totalQueries: this.stats.totalQueries,
        uniqueOperations: this.stats.uniqueOperations.size,
        uniqueQueries: this.stats.uniqueQueries.size,
        totalRunQuery: this.stats.totalRunQuery,
        totalPluralRunQuery: this.stats.totalPluralRunQuery,
        totalIndexHits: this.stats.totalIndexHits,
        totalSiftHits: this.stats.totalSiftHits,
        totalNonSingleFilters: this.stats.totalNonSingleFilters,
        comparatorsUsed: comparatorsUsedObj,
        uniqueFilterPaths: this.stats.uniqueFilterPaths.size,
        uniqueSorts: this.stats.uniqueSorts.size,
      }
    } else {
      return null
    }
  }

  query(
    query: Query,
    context: Record<string, unknown>,
    {
      parentSpan,
      queryName,
    }: { parentSpan: Span | undefined; queryName: string }
  ): Promise<GatsbyExecutionResult> {
    const { schema, schemaCustomization } = this.store.getState()

    if (this.schema !== schema) {
      this.schema = schema
      this.clearCache()
    }

    if (this.stats) {
      this.stats.totalQueries++
      let statsQuery = query
      if (typeof statsQuery !== `string`) {
        statsQuery = statsQuery.body
      }
      this.stats.uniqueOperations.add(
        crypto
          .createHash(`sha1`)
          .update(statsQuery)
          .update(v8.serialize(context))
          .digest(`hex`)
      )

      this.stats.uniqueQueries.add(
        crypto.createHash(`sha1`).update(statsQuery).digest(`hex`)
      )
    }

    const document = this.parse(query)
    const errors = this.validate(schema, document)

    const dataProcessors = {}

    let tracer
    if (this.graphqlTracing && parentSpan) {
      tracer = new GraphQLSpanTracer(`GraphQL Query`, {
        parentSpan,
        tags: {
          queryName: queryName,
        },
      })

      tracer.start()
    }

    const contextValue = withResolverContext({
      schema,
      schemaComposer: schemaCustomization.composer,
      context,
      customContext: schemaCustomization.context,
      nodeModel: this.nodeModel,
      stats: this.stats,
      tracer,
      // WIP
      addDataProcessor: ({
        info,
        processorSource,
      }: {
        info: GatsbyGraphQLResolveInfo
        processorSource: string
      }) => {
        const path = pathToArrayFlattening(info.path).join(`.`)
        if (context && context.path && typeof context.path === `string`) {
          const processorModuleId = generateModuleId({
            source: processorSource,
            importName: undefined,
          })
          this.store.dispatch([
            registerModule({
              moduleID: processorModuleId,
              source: processorSource,
            }),
            addModuleDependencyToQueryResult({
              moduleID: processorModuleId,
              path: context.path,
            }),
          ])
          let processorsByPath = dataProcessors[path]
          if (!processorsByPath) {
            processorsByPath = []
            dataProcessors[path] = processorsByPath
          }
          if (!processorsByPath.includes(processorModuleId)) {
            processorsByPath.push(processorModuleId)
          }
        }
      },
    })

    try {
      const result =
        errors.length > 0
          ? { errors }
          : execute({
              schema,
              document,
              rootValue: context,
              contextValue: contextValue,
              variableValues: context,
            })

      // Queries are usually executed in batch. But after the batch is finished
      // cache just wastes memory without much benefits.
      // TODO: consider a better strategy for cache purging/invalidation
      this.scheduleClearCache()

      return Promise.resolve(result).then(value => {
        if (!isEmpty(dataProcessors)) {
          ;(value as GatsbyExecutionResult).dataProcessors = dataProcessors
        }
        return value
      })
    } finally {
      if (tracer) {
        tracer.end()
      }
    }
  }
}

function pathToArrayFlattening(path: Path): Array<string> {
  const flattened: Array<string> = []
  let curr: Path | undefined = path
  while (curr) {
    if (typeof curr.key !== `number`) {
      flattened.push(curr.key)
    }
    curr = curr.prev
  }
  return flattened.reverse()
}
