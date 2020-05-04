import { createPageDependency } from "../redux/actions/add-page-dependency"

import { store } from "../redux"
import {
  registerModule,
  addModuleDependencyToQueryResult,
} from "../redux/actions/internal"

const { LocalNodeModel } = require(`./node-model`)
const { defaultFieldResolver } = require(`./resolvers`)

const withResolverContext = ({
  schema,
  schemaComposer,
  context,
  customContext,
  nodeModel,
  stats,
}) => {
  const nodeStore = require(`../db/nodes`)

  if (!nodeModel) {
    nodeModel = new LocalNodeModel({
      nodeStore,
      schema,
      schemaComposer,
      createPageDependency,
    })
  }

  return {
    ...(context || {}),
    ...(customContext || {}),
    defaultFieldResolver,
    nodeModel: nodeModel.withContext({
      path: context ? context.path : undefined,
    }),
    stats,
    addModuleDependency: ({ source, type = `default`, importName }) => {
      if (!context?.path) {
        return `that's like graphiql or gatsby-node - DOESNT WORK NOW`
      }

      if (context.path.startsWith(`sq--`)) {
        return `static query - DOESNT WORK NOW`
      }

      // TO-DO: validation

      // generate moduleID - this show too many details - will change in future
      const moduleID = `${source}-${type}-${importName || ``}`
      if (!store.getState().modules.has(moduleID)) {
        // register module
        store.dispatch(
          registerModule({
            moduleID,
            source,
            type,
            importName,
          })
        )
      }

      const test = store.dispatch(
        addModuleDependencyToQueryResult({
          path: context.path,
          moduleID,
        })
      )

      console.log({ test })

      // actual working stuff
      return moduleID
    },
  }
}

module.exports = withResolverContext
